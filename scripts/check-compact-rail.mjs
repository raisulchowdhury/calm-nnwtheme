import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { extractInlineScript } from "./extract-inline-script.mjs";

const stylesheet = readFileSync("Calm.nnwtheme/stylesheet.css", "utf8");
const templateScript = extractInlineScript("Calm.nnwtheme/template.html");
const previewScript = extractInlineScript("preview/index.html");
const compactQuery = "(max-width: 820px), (pointer: coarse) and (max-height: 500px)";

function assertContains(source, expected, label) {
	if (!source.includes(expected)) {
		console.error(`${label} is missing: ${expected}`);
		process.exit(1);
	}
}

function assertNotContains(source, forbidden, label) {
	if (source.includes(forbidden)) {
		console.error(`${label} still contains forbidden text: ${forbidden}`);
		process.exit(1);
	}
}

assertContains(stylesheet, `@media ${compactQuery}`, "stylesheet.css");
assertContains(stylesheet, ".readerToc,\n\t.readerToc:not([hidden]) {\n\t\tdisplay: none !important;\n\t}", "stylesheet.css compact rail rule");
assertContains(stylesheet, "padding: 34px 16px 56px;", "stylesheet.css compact body padding");
assertContains(stylesheet, "font-size: calc(var(--reader-font-size, var(--reader-base-size)) + 1px);\n\t\tmax-width: 100%;\n\t\tline-height: 1.48;", "stylesheet.css compact article rhythm");
assertContains(stylesheet, "@supports (-webkit-touch-callout: none) {\n\tbody {\n\t\tpadding: 30px 20px 56px;\n\t\tword-break: break-word;", "stylesheet.css centered WebKit reading column");
assertContains(stylesheet, `@media ${compactQuery} {\n\t\tbody {\n\t\t\tpadding: 30px 16px 56px;`, "stylesheet.css WebKit compact body padding");
assertContains(stylesheet, `@media ${compactQuery} {\n\t\tbody {\n\t\t\tpadding: 30px 16px 56px;\n\t\t}\n\n\t\t.articleBody {\n\t\t\tline-height: 1.48;`, "stylesheet.css WebKit compact article rhythm");
const webkitRules = stylesheet.slice(stylesheet.indexOf("@supports (-webkit-touch-callout: none)"));
assert.ok(
	webkitRules.indexOf("\t.articleBody {\n\t\tline-height: 1.6;") < webkitRules.indexOf(`\t@media ${compactQuery}`),
	"the WebKit base rhythm should appear before the compact override so iPhone keeps 1.48 line height",
);
assertNotContains(stylesheet, "mix-blend-mode: multiply", "stylesheet.css light-mode image blending");
assertNotContains(stylesheet, "@media (max-width: 760px)", "stylesheet.css");
assertNotContains(stylesheet, "padding: 34px 20px 56px 42px", "stylesheet.css");
assertNotContains(stylesheet, "padding: 30px 20px 56px 42px", "stylesheet.css");
assertNotContains(stylesheet, "padding-left: 42px", "stylesheet.css");
assertNotContains(stylesheet, "\tleft: 12px;", "stylesheet.css legacy desktop rail position");
assertNotContains(stylesheet, "\t\tleft: 2px;", "stylesheet.css legacy coarse rail position");
assertNotContains(stylesheet, "@media (min-width: 821px) and (min-height: 501px)", "stylesheet.css");

for (const [label, script] of [
	["template.html script", templateScript],
	["preview/index.html script", previewScript],
]) {
	assertContains(script, `window.matchMedia("${compactQuery}")`, label);
	assertContains(script, "function shouldDisableRail() {", label);
	assertContains(script, "function syncTocMode() {", label);
	assertContains(script, 'compactRailQuery.addEventListener("change", syncTocMode);', label);
	assertContains(script, "tocCleanup = initToc() || null;", label);
	assertContains(script, 'window.removeEventListener("scroll", requestActiveUpdate);', label);
	assertContains(script, 'window.removeEventListener("resize", scheduleLayoutRefresh);', label);
	assertContains(script, "shouldDisableRail()", label);
	assertContains(script, "if (!body || !toc || !tocList || shouldDisableRail())", label);
}
