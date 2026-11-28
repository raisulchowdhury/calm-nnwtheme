// Runs real feed items from many publishing platforms through Calm, the way
// NetNewsWire builds the page, and reports what each Calm feature did, so false
// positives and misses show up. Items live in .corpus/platforms/*.json (gitignored:
// feed content stays local). Network is blocked; pages are checked at 390 and 900 wide.
//
// Usage: node scripts/check-platforms.mjs [--json out.json] [name-filter]
import { readdirSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { webkit } from "playwright";
import { buildPage } from "./before-after-page.mjs";

const args = process.argv.slice(2);
const jsonAt = args.indexOf("--json");
const jsonOut = jsonAt >= 0 ? args.splice(jsonAt, 2)[1] : null;
const filter = args[0] || "";
const root = new URL("..", import.meta.url).pathname;
const dir = join(root, ".corpus", "platforms");
const work = mkdtempSync(join(tmpdir(), "calm-platforms-"));
const files = readdirSync(dir).filter((f) => f.endsWith(".json") && f.includes(filter)).sort();

const browser = await webkit.launch();
const results = [];
for (const file of files) {
	const article = JSON.parse(readFileSync(join(dir, file), "utf8"));
	const html = join(work, file.replace(/\.json$/, ".html"));
	writeFileSync(html, buildPage({ theme: join(root, "Calm.nnwtheme"), article }));
	const source = article.contentHTML || "";
	for (const width of [390, 900]) {
		const page = await browser.newPage({ viewport: { width, height: 900 } });
		const errors = [];
		// main_mac.js (not loaded here) defines postRenderProcessing; feeds' own inline scripts may fail too.
		page.on("pageerror", (error) => { if (!/postRenderProcessing/.test(error.message)) errors.push(error.message); });
		await page.route(/^https?:/, (route) => route.abort());
		await page.goto("file://" + html, { waitUntil: "load" }).catch((error) => errors.push("load: " + error.message));
		await page.waitForTimeout(150);
		const report = await page.evaluate(() => {
			const body = document.getElementById("bodyContainer");
			const docWidth = document.documentElement.clientWidth;
			// Wider than the page and not inside something that scrolls sideways.
			const overflow = [];
			for (const node of body.querySelectorAll("*")) {
				const rect = node.getBoundingClientRect();
				if (rect.width === 0 || rect.right <= docWidth + 1) continue;
				let scroller = node.parentElement;
				let clipped = false;
				while (scroller && scroller !== body) {
					const style = getComputedStyle(scroller);
					if (/auto|scroll|hidden|clip/.test(style.overflowX)) { clipped = true; break; }
					scroller = scroller.parentElement;
				}
				if (!clipped) overflow.push(`${node.tagName.toLowerCase()}.${(node.className || "").toString().split(" ")[0]} ${Math.round(rect.right - docWidth)}px`);
			}
			const text = (node) => (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 90);
			return {
				pageOverflow: document.documentElement.scrollWidth - docWidth,
				overflow: overflow.slice(0, 5),
				code: Array.from(body.querySelectorAll("pre"), (pre) => ({ copy: !!pre.closest(".calmCode"), lang: pre.closest(".calmCode")?.querySelector(".calmCodeLanguage")?.textContent || "" })),
				footnoteRefs: body.querySelectorAll("a.footnote").length,
				footnoteMisses: Array.from(body.querySelectorAll("a[href*='#']"), (a) => {
					const id = decodeURIComponent((a.hash || "").slice(1));
					return /^(?:user-content-)?(?:fn|footnote)(?![-_:]?ref|-anchor)|^fn/i.test(id) && !/ref|anchor|back/i.test(id) && !a.classList.contains("footnote") && !a.closest(".footnotes, .footnote, section.footnotes, ol.wp-block-footnotes") && !a.id.startsWith("footnote-anchor") ? `${a.outerHTML.slice(0, 120)}` : null;
				}).filter(Boolean).slice(0, 3),
				credit: Array.from(body.querySelectorAll("[data-calm-feed-credit]"), text),
				blanks: body.querySelectorAll("[data-calm-blank]").length,
				blankWithText: Array.from(body.querySelectorAll("[data-calm-blank]"), text).filter(Boolean).slice(0, 3),
				inline: body.querySelectorAll("[data-calm-inline]").length,
				brs: body.querySelectorAll("br").length,
				leadHidden: !!document.querySelector(".nnw-primary-image[hidden]"),
				untitled: document.getElementById("readerTop")?.classList.contains("isUntitled"),
				lang: body.getAttribute("lang") || "",
				posters: Array.from(body.querySelectorAll(".kg-video-card video"), (v) => (v.getAttribute("poster") || "").slice(0, 60)),
				galleries: Array.from(body.querySelectorAll(".kg-gallery-image"), (c) => c.style.flex || "none").length,
				tweets: Array.from(body.querySelectorAll("blockquote.twitter-tweet"), (q) => q.getAttribute("data-theme") || "").length,
				rail: document.querySelectorAll(".readerToc button").length,
				readingTime: document.getElementById("readingTime")?.textContent || "",
				pills: Array.from(body.querySelectorAll("a"), (a) => (parseFloat(getComputedStyle(a).borderTopLeftRadius) >= 100 ? text(a).slice(0, 40) : null)).filter(Boolean),
				forms: Array.from(body.querySelectorAll("form, iframe, .subscription-widget-wrap, .subscription-widget-wrap-editor, #mc_embed_signup, .formkit-form, .kg-signup-card"), (node) => `${node.getClientRects().length ? "shown" : "HIDDEN"} ${node.tagName.toLowerCase()}${node.id ? "#" + node.id : ""} ${(node.getAttribute("action") || node.getAttribute("src") || "").slice(0, 50)}`).filter((line) => !/^shown iframe/.test(line)),
				tasks: Array.from(body.querySelectorAll("li"), (li) => (getComputedStyle(li).listStyleType === "none" && li.querySelector("input[type=checkbox]") ? text(li).slice(0, 40) : null)).filter(Boolean),
				captions: Array.from(body.querySelectorAll(".wp-caption > .wp-caption-text, .wp-caption .wp-caption-dd, .imgcap .thecap, table.tr-caption-container td.tr-caption, .media-wrapper > .image-caption, figcaption p"), (node) => text(node).slice(0, 50)),
			};
		});
		report.sourceBrs = (source.match(/<br\b/gi) || []).length;
		results.push({ file, width, errors, ...report });
		await page.close();
	}
}
await browser.close();
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(results, null, 1));

for (const r of results) {
	const flags = [];
	if (r.errors.length) flags.push(`ERRORS ${r.errors.join(" | ").slice(0, 160)}`);
	if (r.pageOverflow > 0 || r.overflow.length) flags.push(`OVERFLOW ${r.pageOverflow}px ${r.overflow.join(", ")}`);
	if (r.footnoteMisses.length) flags.push(`FOOTNOTE-MISS ${r.footnoteMisses.join(" ")}`);
	if (r.credit.length) flags.push(`CREDIT "${r.credit.join(" / ")}"`);
	if (r.blankWithText.length) flags.push(`BLANK-WITH-TEXT ${r.blankWithText.join(" / ")}`);
	if (r.pills.length) flags.push(`PILLS ${r.pills.join(" | ")}`);
	if (r.forms.length) flags.push(`FORMS ${r.forms.join(" | ")}`);
	if (r.tasks.length) flags.push(`TASKS ${r.tasks.join(" | ")}`);
	if (r.captions.length) flags.push(`CAPTIONS ${r.captions.length}: ${r.captions.slice(0, 3).join(" | ")}`);
	const codes = r.code.length ? `code ${r.code.filter((c) => c.copy).length}/${r.code.length} [${[...new Set(r.code.map((c) => c.lang))].join(",")}]` : "";
	console.log(`${r.file} @${r.width}: ${[codes, r.footnoteRefs ? `fn ${r.footnoteRefs}` : "", r.blanks ? `blank ${r.blanks}` : "", r.sourceBrs ? `br ${r.sourceBrs}->${r.brs}` : "", r.posters.length ? `posters ${r.posters.length}` : "", r.galleries ? `gallery ${r.galleries}` : "", r.untitled ? "untitled" : "", r.lang ? `lang ${r.lang}` : "", r.rail ? `rail ${r.rail}` : ""].filter(Boolean).join("; ")}${flags.length ? "\n    " + flags.join("\n    ") : ""}`);
}
