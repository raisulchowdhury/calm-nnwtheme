import { extractInlineScript } from "./extract-inline-script.mjs";

const themeScript = extractInlineScript("Calm.nnwtheme/template.html");
const previewScript = extractInlineScript("preview/index.html");

if (themeScript !== previewScript) {
	console.error("Template and preview scripts differ.");
	process.exit(1);
}
