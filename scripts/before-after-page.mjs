// Builds an article page the way NetNewsWire 7.3.1 on the Mac does: its page.html shell,
// core.css before the theme stylesheet, main.js and newsfoot.js as document-start scripts,
// and the theme's template with the article's values filled in.
import { readFileSync } from "node:fs";

const R = "/Applications/NetNewsWire.app/Contents/Resources";
const nnw = (f) => readFileSync(`${R}/${f}`, "utf8");
const shell = nnw("page.html");
const core = nnw("core.css");
const userScripts = [nnw("main.js"), nnw("newsfoot.js")].map((s) => `<script>${s}</script>`).join("\n");

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

// NetNewsWire 7.3's [[primary_media]] for an audio post (ArticleRenderer+PrimaryMedia.swift):
// the article image, then the player, then "title or linked file name · duration · size".
function primaryMediaFor(article) {
	const attachments = JSON.parse(article.attachments || "[]");
	const audio = attachments.find((a) => /^audio\//.test(a.mimeType || ""));
	if (!audio) return "";
	const parts = [];
	if (audio.title) parts.push(esc(audio.title));
	else parts.push(`<a href="${esc(audio.url)}">${esc(decodeURIComponent(new URL(audio.url).pathname.split("/").pop()))}</a>`);
	if (audio.durationInSeconds) {
		const d = audio.durationInSeconds, h = Math.floor(d / 3600), m = Math.floor((d % 3600) / 60), s = d % 60;
		parts.push(h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`);
	}
	if (audio.sizeInBytes) parts.push(`${(audio.sizeInBytes / 1e6).toFixed(1)} MB`);
	const image = article.imageURL ? `<div class="nnw-primary-image"><img src="${esc(article.imageURL)}" alt=""></div>` : "";
	return `<div class="nnw-primary-media">${image}<div class="nnw-enclosure nnw-enclosure-audio"><audio controls preload="none" src="${esc(audio.url)}"></audio><div class="nnw-enclosure-caption">${parts.join(" · ")}</div></div></div>`;
}

export function buildPage({ theme, article, textSize = "mediumText", template = "template7.3.html" }) {
	const css = readFileSync(`${theme}/stylesheet.css`, "utf8");
	const tpl = readFileSync(`${theme}/${template}`, "utf8");
	const link = article.url || article.externalURL || "";
	const date = article.datePublished ? new Date(article.datePublished * 1000) : null;
	const values = {
		title: esc(article.title || ""),
		preferred_link: esc(link),
		external_link_label: "",
		external_link_stripped: "",
		external_link: "",
		feed_link_title: esc(article.feedTitle || ""),
		feed_link: esc(article.feedID || ""),
		byline: esc(article.byline || ""),
		avatar_src: "",
		dateline_style: article.title ? "articleDateline" : "articleDatelineTitle",
		date_medium: date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
		date_long: "", date_short: "", datetime_long: "", datetime_medium: "", datetime_short: "",
		time_long: "", time_medium: "", time_short: "",
		text_size_class: textSize,
		primary_media: article.primaryMedia ?? primaryMediaFor(article),
		enclosures: article.enclosures || "",
		body: article.contentHTML || article.contentText || "",
	};
	// NetNewsWire substitutes in one pass; body last so feed text is never re-scanned.
	let filled = tpl.replace(/\[\[([a-z_]+)\]\]/g, (m, k) => (k === "body" ? "\u0000BODY\u0000" : k in values ? values[k] : m));
	filled = filled.replace("\u0000BODY\u0000", () => values.body);
	const head = `${core}\n${css}`;
	return shell
		.replace("[[title]]", () => values.title)
		.replace("[[style]]", () => head)
		.replace("[[baseURL]]", () => esc(link))
		.replace("<head>", () => `<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${userScripts}`)
		.replace("[[body]]", () => filled);
}
