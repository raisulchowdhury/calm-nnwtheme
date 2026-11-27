import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { extractInlineScript } from "./extract-inline-script.mjs";

const paths = ["Calm.nnwtheme/template.html", "Calm.nnwtheme/template7.3.html", "preview/index.html"];
const stylesheet = readFileSync("Calm.nnwtheme/stylesheet.css", "utf8");

// A small stand-in for a feed block: enough for hideBlankBlocks to read.
function block({ text = "", id = "", style = "", inside = [] } = {}) {
	const attributes = new Map(style ? [["style", style]] : []);
	return {
		id,
		textContent: text,
		getAttribute: (name) => (attributes.has(name) ? attributes.get(name) : null),
		setAttribute: (name, value) => attributes.set(name, String(value)),
		hasAttribute: (name) => attributes.has(name),
		querySelector: (selector) =>
			inside.some((tag) => selector.split(",").map((part) => part.trim()).includes(tag)) ? {} : null,
		mark: () => attributes.get("data-calm-blank"),
	};
}

function runHideBlankBlocks(path, blocks) {
	const script = extractInlineScript(path);
	const match = script.match(/function hideBlankBlocks\(\) \{[\s\S]*?\n\t\}\n/);
	assert.ok(match, `${path} should define hideBlankBlocks`);
	const body = { querySelectorAll: (selector) => (assert.equal(selector, "p, div"), blocks) };
	vm.runInNewContext(`${match[0]}\nhideBlankBlocks();`, { body });
}

for (const path of paths) {
	const script = extractInlineScript(path);
	assert.match(
		script,
		/\thideBlankBlocks\(\);\n\tnormalizeMetadata\(\);/,
		`${path} should clean blank blocks before measuring the article`,
	);

	const cases = {
		blankParagraph: block({ text: "  " }),
		zeroWidth: block({ text: "​﻿" }),
		lineBreakOnly: block({ text: "" }),
		clearing: block({ style: "clear: both" }),
		withText: block({ text: "Words" }),
		withId: block({ id: "footnote-1" }),
		withBorder: block({ style: "border-top: 1px solid" }),
		withBackground: block({ style: "background: #eee; height: 2px" }),
		withImage: block({ inside: ["img"] }),
		withIframe: block({ inside: ["iframe"] }),
		withRule: block({ inside: ["hr"] }),
		withAnchor: block({ inside: ["a[name]"] }),
		withInnerId: block({ inside: ["[id]"] }),
	};
	runHideBlankBlocks(path, Object.values(cases));

	assert.equal(cases.blankParagraph.mark(), "", `${path} should hide a non-breaking-space paragraph`);
	assert.equal(cases.zeroWidth.mark(), "", `${path} should hide invisible characters`);
	assert.equal(cases.lineBreakOnly.mark(), "", `${path} should hide a block holding only a line break`);
	assert.equal(cases.clearing.mark(), "clear", `${path} should keep a clearing block's clear but not its height`);
	for (const name of [
		"withText",
		"withId",
		"withBorder",
		"withBackground",
		"withImage",
		"withIframe",
		"withRule",
		"withAnchor",
		"withInnerId",
	]) {
		assert.equal(cases[name].mark(), undefined, `${path} should leave ${name} alone`);
	}
}

assert.ok(
	stylesheet.includes(".articleBody [data-calm-blank] {\n\tdisplay: none !important;"),
	"blank feed blocks should take no space, even with an inline display (Ghost skeletons)",
);
assert.ok(
	stylesheet.includes('.articleBody [data-calm-blank="clear"] {\n\tdisplay: block !important;\n\theight: 0;'),
	"blank clearing blocks should still clear floats",
);
assert.ok(
	stylesheet.includes('.articleBody :is(div, figure, section, p, blockquote):not([class*="newsfoot"]) {\n\tmax-width: 100%;'),
	"fixed-width feed blocks should stay inside the measure, footnote popovers excepted",
);
assert.ok(
	stylesheet.includes('.articleBody [data-sanitized-class~="image-link-expand"]'),
	"Substack's image buttons should hide in FreshRSS-sanitized feeds too",
);
