import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { extractInlineScript } from "./extract-inline-script.mjs";

// NetNewsWire 7.3+ loads template7.3.html instead of template.html. Keep the two
// identical apart from the comment note and the media tags around the body.
const base = readFileSync("Calm.nnwtheme/template.html", "utf8");
const modern = readFileSync("Calm.nnwtheme/template7.3.html", "utf8");

assert.equal(
	extractInlineScript("Calm.nnwtheme/template7.3.html"),
	extractInlineScript("Calm.nnwtheme/template.html"),
	"template7.3.html should run the same script as template.html",
);
assert.ok(!/\[\[(primary_media|enclosures)\]\]/.test(base), "template.html must not use 7.3-only tags");

const comment = /<!--[\s\S]*?-->/;
const strip = (html) =>
	html
		.replace(comment, "")
		.replace(/\n\t\[\[primary_media\]\]/, "")
		.replace(/\n\t\[\[enclosures\]\]/, "");
assert.equal(strip(modern), strip(base), "template7.3.html should differ only by the media tags");

const tagsOutsideComment = modern.replace(comment, "");
assert.match(
	tagsOutsideComment,
	/<article>\s*\[\[primary_media\]\]\s*<div id="bodyContainer"[^>]*>\[\[body\]\]<\/div>\s*\[\[enclosures\]\]\s*<\/article>/,
	"primary media should sit above the body and enclosures below it, inside the article",
);
assert.ok(
	!comment.exec(modern)[0].match(/\[\[(primary_media|enclosures)\]\]/),
	"NetNewsWire matches tags anywhere, so the comment must not contain the media tags",
);
