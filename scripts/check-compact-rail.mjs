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
assertContains(stylesheet, "--reader-font-size: 18.5px;\n\t\tmax-width: 100%;\n\t\tline-height: 1.54;", "stylesheet.css compact article rhythm");
assertContains(stylesheet, "@supports (-webkit-touch-callout: none) {\n\tbody {\n\t\tpadding: 30px 20px 56px;\n\t\tpadding-left: 42px;", "stylesheet.css WebKit rail gutter");
assertContains(stylesheet, `@media ${compactQuery} {\n\t\tbody {\n\t\t\tpadding: 30px 16px 56px;`, "stylesheet.css WebKit compact body padding");
assertContains(stylesheet, `@media ${compactQuery} {\n\t\tbody {\n\t\t\tpadding: 30px 16px 56px;\n\t\t}\n\n\t\t.articleBody {\n\t\t\tline-height: 1.54;`, "stylesheet.css WebKit compact article rhythm");
assertNotContains(stylesheet, "@media (max-width: 760px)", "stylesheet.css");
assertNotContains(stylesheet, "padding: 34px 20px 56px 42px", "stylesheet.css");
assertNotContains(stylesheet, "padding: 30px 20px 56px 42px", "stylesheet.css");
assertNotContains(stylesheet, "@media (min-width: 821px) and (min-height: 501px)", "stylesheet.css");

for (const [label, script] of [
	["template.html script", templateScript],
	["preview/index.html script", previewScript],
]) {
	assertContains(script, `window.matchMedia("${compactQuery}")`, label);
	assertContains(script, "function shouldDisableRail() {", label);
	assertContains(script, "shouldDisableRail()", label);
	assertContains(script, "if (!body || !toc || !tocList || shouldDisableRail())", label);
}
