import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { extractInlineScript } from "./extract-inline-script.mjs";

const paths = ["Calm.nnwtheme/template.html", "preview/index.html"];
const stylesheet = readFileSync("Calm.nnwtheme/stylesheet.css", "utf8");

class FakeReadingTime {
	constructor() {
		this.hidden = true;
		this.textContent = "";
		this.attributes = new Map();
	}

	setAttribute(name, value) {
		this.attributes.set(name, String(value));
	}

	getAttribute(name) {
		return this.attributes.get(name) || "";
	}

	removeAttribute(name) {
		this.attributes.delete(name);
	}
}

class FakeMetadataItem {
	constructor(textContent) {
		this.hidden = false;
		this.textContent = textContent;
	}
}

function runScript(path, wordCount, includeBody = true, metadataText = ["Author", "Date", "Feed"]) {
	const readingTime = new FakeReadingTime();
	const metadataItems = metadataText.map((text) => new FakeMetadataItem(text));
	const articleMeta = {
		children: [...metadataItems, readingTime],
		hidden: false,
	};
	const text = Array.from({ length: wordCount }, () => "word").join(" ");
	const body = includeBody ? { innerText: text, textContent: text } : null;
	const document = {
		getElementById(id) {
			return {
				bodyContainer: body,
				readingTime,
			}[id] || null;
		},
		querySelector(selector) {
			return selector === ".articleMeta" ? articleMeta : null;
		},
	};
	const window = {
		matchMedia() {
			return { matches: false };
		},
	};

	vm.runInNewContext(extractInlineScript(path), { document, window });
	return { articleMeta, metadataItems, readingTime };
}

for (const path of paths) {
	const source = readFileSync(path, "utf8");
	assert.match(
		source,
		/<span class="feedName">[\s\S]*?<\/span>\s*<span class="readingTime" id="readingTime" hidden><\/span>/,
		`${path} should place reading time after the textual feed source`,
	);
	assert.ok(!source.includes("readerFooter"), `${path} should remove the statistics footer`);
	assert.ok(!source.includes("readingStats"), `${path} should remove obsolete statistics logic`);
	assert.ok(!source.includes("min read"), `${path} should remove the old footer phrasing`);

	const short = runScript(path, 675).readingTime;
	assert.equal(short.hidden, true, `${path} should hide a three-minute estimate`);
	assert.equal(short.textContent, "", `${path} should clear hidden reading-time text`);
	assert.equal(short.getAttribute("aria-label"), "", `${path} should clear hidden reading-time labels`);

	const threshold = runScript(path, 676).readingTime;
	assert.equal(threshold.hidden, false, `${path} should show a four-minute estimate`);
	assert.equal(threshold.textContent, "4 min", `${path} should use the quiet metadata label`);
	assert.equal(
		threshold.getAttribute("aria-label"),
		"Estimated reading time: 4 minutes",
		`${path} should expose an accessible estimate`,
	);

	const long = runScript(path, 1350).readingTime;
	assert.equal(long.hidden, false, `${path} should show a longer estimate`);
	assert.equal(long.textContent, "6 min", `${path} should continue using 225 words per minute`);
	assert.equal(
		long.getAttribute("aria-label"),
		"Estimated reading time: 6 minutes",
		`${path} should keep the accessible label in sync`,
	);

	const missingBody = runScript(path, 0, false).readingTime;
	assert.equal(missingBody.hidden, true, `${path} should fail closed when article text is missing`);

	const missingDate = runScript(path, 676, true, ["Author", "", "Feed"]);
	assert.equal(missingDate.metadataItems[0].hidden, false, `${path} should preserve present authors`);
	assert.equal(missingDate.metadataItems[1].hidden, true, `${path} should hide an empty date anchor`);
	assert.equal(missingDate.metadataItems[2].hidden, false, `${path} should preserve present feed names`);
	assert.equal(missingDate.articleMeta.hidden, false, `${path} should retain remaining metadata`);

	const placeholders = runScript(path, 675, true, ["[[byline]]", "[[date_medium]]", "[[feed_link_title]]"]);
	assert.ok(
		placeholders.metadataItems.every((metadataItem) => metadataItem.hidden),
		`${path} should hide unresolved metadata placeholders`,
	);
	assert.equal(placeholders.articleMeta.hidden, true, `${path} should hide an empty metadata row`);

	const readingTimeOnly = runScript(path, 676, true, ["", "", ""]);
	assert.equal(readingTimeOnly.readingTime.hidden, false, `${path} should allow reading-time-only metadata`);
	assert.equal(readingTimeOnly.articleMeta.hidden, false, `${path} should show the reading-time-only row`);
}

assert.ok(!stylesheet.includes(".readerFooter"), "stylesheet should remove obsolete footer rules");
assert.ok(
	stylesheet.includes(".articleMeta > span:not([hidden]) ~ span:not([hidden])::before"),
	"metadata separators should skip hidden preceding fields",
);
assert.ok(
	stylesheet.includes(".articleMeta[hidden],\n.byline:empty,"),
	"all-empty metadata rows should override the flex display",
);
assert.ok(
	stylesheet.includes(".readingTime:empty,\n.articleMeta > span[hidden] {\n\tdisplay: none;"),
	"empty and normalized metadata should stay hidden",
);
