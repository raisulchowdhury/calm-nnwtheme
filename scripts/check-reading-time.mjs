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

function runScript(path, wordCount, includeBody = true) {
	const readingTime = new FakeReadingTime();
	const text = Array.from({ length: wordCount }, () => "word").join(" ");
	const body = includeBody ? { innerText: text, textContent: text } : null;
	const document = {
		getElementById(id) {
			return {
				bodyContainer: body,
				readingTime,
			}[id] || null;
		},
		querySelector() {
			return null;
		},
	};
	const window = {
		matchMedia() {
			return { matches: false };
		},
	};

	vm.runInNewContext(extractInlineScript(path), { document, window });
	return readingTime;
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

	const short = runScript(path, 675);
	assert.equal(short.hidden, true, `${path} should hide a three-minute estimate`);
	assert.equal(short.textContent, "", `${path} should clear hidden reading-time text`);
	assert.equal(short.getAttribute("aria-label"), "", `${path} should clear hidden reading-time labels`);

	const threshold = runScript(path, 676);
	assert.equal(threshold.hidden, false, `${path} should show a four-minute estimate`);
	assert.equal(threshold.textContent, "4 min", `${path} should use the quiet metadata label`);
	assert.equal(
		threshold.getAttribute("aria-label"),
		"Estimated reading time: 4 minutes",
		`${path} should expose an accessible estimate`,
	);

	const long = runScript(path, 1350);
	assert.equal(long.hidden, false, `${path} should show a longer estimate`);
	assert.equal(long.textContent, "6 min", `${path} should continue using 225 words per minute`);
	assert.equal(
		long.getAttribute("aria-label"),
		"Estimated reading time: 6 minutes",
		`${path} should keep the accessible label in sync`,
	);

	const missingBody = runScript(path, 0, false);
	assert.equal(missingBody.hidden, true, `${path} should fail closed when article text is missing`);
}

assert.ok(!stylesheet.includes(".readerFooter"), "stylesheet should remove obsolete footer rules");
assert.ok(
	stylesheet.includes(".articleMeta > span:not(:empty) ~ span:not(:empty)::before"),
	"metadata separators should skip empty preceding fields",
);
assert.ok(
	stylesheet.includes(".readingTime:empty,\n.readingTime[hidden] {\n\tdisplay: none;"),
	"empty and short reading-time metadata should stay hidden",
);
