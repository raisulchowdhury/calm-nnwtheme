import { readFileSync } from "node:fs";

export function extractInlineScript(path) {
	const html = readFileSync(path, "utf8");
	const matches = Array.from(html.matchAll(/<script>\s*([\s\S]*?)\s*<\/script>/g));
	if (matches.length !== 1) {
		throw new Error(`${path} must contain exactly one inline script; found ${matches.length}`);
	}
	return matches[0][1].trim();
}
