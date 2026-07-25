import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { extractInlineScript } from "./extract-inline-script.mjs";

const paths = ["Calm.nnwtheme/template.html", "preview/index.html"];
const stylesheet = readFileSync("Calm.nnwtheme/stylesheet.css", "utf8");
const preciseQuery = "@media (min-width: 1080px) and (hover: hover) and (pointer: fine) {";

for (const path of paths) {
	const source = readFileSync(path, "utf8");
	const script = extractInlineScript(path);
	assert.match(
		source,
		/<div class="readerTocTitle">Sections<\/div>\s*<div class="readerTocContext" aria-hidden="true"><\/div>/,
		`${path} should include a presentation-only rail label`,
	);
	assert.ok(
		script.includes('toc.classList.toggle("is-heading-based", useHeadingTargets);'),
		`${path} should mark only real-heading navigation`,
	);
	assert.ok(
		script.includes('tocContext.textContent = activeControl.getAttribute("data-label") || "";'),
		`${path} should synchronize the label with the active marker`,
	);
	assert.ok(
		script.includes('tocContext.style.top = (activeRect.top - tocRect.top + activeRect.height / 2) + "px";'),
		`${path} should align the label to the active marker`,
	);
}

assert.ok(stylesheet.includes(".readerTocContext {\n\tdisplay: none;\n}"), "rail labels should be hidden by default");
assert.ok(
	stylesheet.includes(preciseQuery),
	"rail labels should support a normal NetNewsWire pane while requiring a wide precise-pointer layout",
);
assert.ok(
	stylesheet.includes("right: calc(100% + 0.75rem);"),
	"rail labels should sit to the left of the navigation rail",
);
assert.ok(
	stylesheet.includes("width: min(12rem, calc(50vw - var(--reader-half-measure) - 3.75rem));"),
	"rail labels should truncate within the available outer margin",
);
assert.ok(stylesheet.includes("transition: opacity 120ms ease;"), "rail labels should use the approved quiet fade");
assert.ok(
	stylesheet.includes(
		".readerToc.is-heading-based:hover .readerTocContext,\n" +
		"\t.readerToc.is-heading-based:focus-within .readerTocContext,\n" +
		"\t.readerToc.is-heading-based.isScrubbing .readerTocContext {\n" +
		"\t\topacity: 1;",
	),
	"hover, keyboard focus, and active scrubbing should reveal the label",
);
assert.ok(
	stylesheet.includes(
		"@media (any-pointer: coarse) {\n" +
		"\t.readerTocContext {\n" +
		"\t\tdisplay: none !important;\n" +
		"\t}\n" +
		"}",
	),
	"coarse-pointer layouts should remain text-free",
);
assert.ok(
	stylesheet.includes(
		"@media (prefers-reduced-motion: reduce) {\n" +
		"\t.readerTocContext {\n" +
		"\t\ttransition: none;\n" +
		"\t}\n" +
		"}",
	),
	"reduced motion should disable the label transition",
);

const contextRule = stylesheet.match(
	/\.readerToc\.is-heading-based \.readerTocContext \{([\s\S]*?)\n\t\}/,
)?.[1];
assert.ok(contextRule, "heading-label styling should exist");
assert.doesNotMatch(
	contextRule,
	/(?:^|\n)\s*(?:background|border|box-shadow)\s*:/,
	"heading labels should remain plain text without tooltip decoration",
);

const preview = readFileSync("preview/index.html", "utf8");
assert.ok(
	preview.includes('<h2 id="intention">Practice with intention</h2>'),
	"the live preview should exercise real-heading navigation",
);
