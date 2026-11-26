// Before/after images for release notes, in the style of assets/releases/1.4.4-*.jpg.
// Renders real articles through NetNewsWire's own page shell, core.css, main.js and
// newsfoot.js (read from /Applications/NetNewsWire.app) with the theme from a git ref
// ("before") and the working tree ("after"), then saves one labelled pair per case.
//
// Articles live in .corpus/<id>.json (gitignored: feed content stays local). Use free,
// public feeds only for anything published.
//
// Usage: node scripts/before-after.mjs [--base origin/main] [--label "Calm 1.5.0"] [--out assets/releases/unreleased] [--scheme light|dark] [case ...]
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { webkit } from "playwright";
import { buildPage } from "./before-after-page.mjs";

const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(name); if (i < 0) return fallback; const v = args[i + 1]; args.splice(i, 2); return v; };
const base = flag("--base", "origin/main");
const label = flag("--label", "This change");
const out = flag("--out", "assets/releases/unreleased");
const scheme = flag("--scheme", "light");
const only = args;
const root = new URL("..", import.meta.url).pathname;

// Each case: corpus article, what to crop, viewport width, and an optional action on "after".
export const cases = [
	{ slug: "footnote-popover", id: "fn6c-2", alt: "A Six Colors footnote: before, a plain superscript; after, tapping it opens the note in place", sel: "sup a[href*='#fn']", para: true, extraBelow: 260, act: "click" },
	{ slug: "untitled-post", id: "masto-1", alt: "A Mastodon post with no title: before, an empty title line above the date; after, the date sits at the top", top: 520 },
	{ slug: "gallery-row", id: "gallery-2", alt: "A Ghost photo gallery: before, photos stacked full width; after, one row at a single height", sel: ".kg-gallery-row", maxH: 640 },
	{ slug: "link-card", id: "bookmark-2", alt: "A Substack link card: before, raw text, buttons and comment counts; after, one quiet card with source, title and a few lines", sel: ".embedded-post, .kg-bookmark-container" },
	{ slug: "podcast-caption", id: "podcast-1", alt: "A podcast player caption: before, a file name and h:mm:ss; after, just the length, 1 hr 24 min", sel: ".nnw-primary-media", scope: "body", maxH: 760 },
	{ slug: "duplicate-cover", id: "cover-1", alt: "A Latent Space episode: before, the cover picture twice in a row; after, once", top: 1100 },
	{ slug: "x-embed-dark", id: "xembed-1", alt: "An embedded X post in dark mode: before, a white card; after, a dark card", sel: ".twitter-tweet", maxH: 900, wait: 6000 },
	{ slug: "podcast-caption-file-name", id: "podcast-2", alt: "A Dwarkesh episode: before, the player caption is a hashed .mp3 file name; after, just the length", sel: ".nnw-primary-media", scope: "body", maxH: 760 },
	{ slug: "x-frame-dark", id: "xembed-2", alt: "A Latent Space post with X card frame embedded directly, in dark mode: before, a white card; after, a dark card", sel: "iframe[src*=\"platform.twitter.com\"]", maxH: 900, wait: 6000 },
	{ slug: "code-copy", id: "pre-3", alt: "A code block on the Mac: after, a quiet Copy button appears on hover", sel: "pre", hasText: "paperjam: $(OBJS)", width: 900, act: "hover" },
];

const theme = (dir) => join(dir, "Calm.nnwtheme");
const beforeDir = mkdtempSync(join(tmpdir(), "calm-before-"));
execFileSync("sh", ["-c", `git -C "${root}" archive "${base}" Calm.nnwtheme | tar -x -C "${beforeDir}"`]);
const themes = { before: theme(beforeDir), after: theme(root) };
mkdirSync(join(root, out), { recursive: true });

const browser = await webkit.launch();
async function shoot(c, which) {
	const article = JSON.parse(readFileSync(join(root, ".corpus", `${c.id}.json`), "utf8"));
	const html = join(beforeDir, `${c.slug}-${which}.html`);
	writeFileSync(html, buildPage({ theme: themes[which], article }));
	const width = c.width || 390;
	const page = await browser.newPage({ viewport: { width, height: 1600 }, deviceScaleFactor: 2, colorScheme: scheme });
	await page.goto("file://" + html, { waitUntil: "load", timeout: 30000 }).catch(() => {});
	await page.waitForTimeout(c.wait || 2000);
	let clip = { x: 0, y: 0, width, height: c.top || 520 };
	if (c.sel) {
		const el = page.locator(`${c.scope || "#bodyContainer"} :is(${c.sel})`).filter(c.hasText ? { hasText: c.hasText } : {}).first();
		if (!(await el.count())) throw new Error(`${c.slug}: "${c.sel}" not found (${which})`);
		const pad = 48;
		// Scroll so the target sits near the top, then clip in viewport coordinates
		// (a full-page capture resizes the page and drops hover).
		await el.evaluate((node, pad) => window.scrollTo(0, node.getBoundingClientRect().top + scrollY - pad), pad);
		await page.waitForTimeout(200);
		if (which === "after" && c.act === "hover") { await el.hover(); await page.waitForTimeout(400); }
		if (which === "after" && c.act === "click") { await el.click(); await page.waitForTimeout(600); }
		const box = await el.evaluate((node, para) => { const t = para ? node.closest("p, li") || node : node; const r = t.getBoundingClientRect(); return { y: r.top, h: r.height }; }, !!c.para);
		clip = { x: 0, y: Math.max(0, box.y - pad), width, height: Math.min(box.h + pad * 2 + (c.extraBelow || 0), c.maxH || 900) };
	}
	const png = await page.screenshot({ clip, timeout: 90000 });
	await page.close();
	return `data:image/png;base64,${png.toString("base64")}`;
}

const made = [];
for (const c of cases.filter((c) => !only.length || only.includes(c.slug))) {
	if (!existsSync(join(root, ".corpus", `${c.id}.json`))) { console.log(`skip ${c.slug}: no .corpus/${c.id}.json`); continue; }
	let before, after;
	try { before = await shoot(c, "before"); after = await shoot(c, "after"); }
	catch (error) { console.log(`fail ${c.slug}: ${error.message.split("\n")[0]}`); continue; }
	const colW = c.width ? 760 : 520;
	const page = await browser.newPage({ viewport: { width: colW * 2 + 160, height: 400 }, deviceScaleFactor: 2 });
	await page.setContent(`<style>body{margin:0;background:#111}main{font:500 22px -apple-system,"SF Pro Text",sans-serif;display:flex;align-items:flex-start;gap:48px;padding:36px 48px 44px;width:max-content;background:#111}
		figure{margin:0;width:${colW}px}figcaption{color:#8a8a8a;margin-bottom:16px}figure.after figcaption{color:#f2f2f2}
		img{width:100%;display:block;border-radius:10px}</style>
		<main><figure><figcaption>Before</figcaption><img src="${before}"></figure>
		<figure class="after"><figcaption>${label}</figcaption><img src="${after}"></figure></main>`);
	await page.waitForTimeout(300);
	const file = join(out, `${c.slug}.jpg`);
	await page.locator("main").screenshot({ path: join(root, file), type: "jpeg", quality: 82 });
	await page.close();
	made.push({ ...c, file });
	console.log(file);
}
await browser.close();

// Release-note snippets, ready to paste.
const md = made.map((c) => `### ${c.slug}\n\n<img src="https://raw.githubusercontent.com/raisulchowdhury/calm-nnwtheme/main/${c.file}" width="720" alt="${c.alt}">\n`).join("\n");
const index = join(root, out, "README.md");
const header = `# Before and after\n\nMade by \`node scripts/before-after.mjs\` against \`${base}\`. At release, rename the folder's files to \`<version>-<slug>.jpg\` and move them up into \`assets/releases/\`.\n\n`;
const existing = existsSync(index) ? readFileSync(index, "utf8").replace(/^[\s\S]*?(?=### |$)/, "") : "";
const keep = existing.split(/(?=^### )/m).filter((s) => s.trim() && !made.some((c) => s.startsWith(`### ${c.slug}\n`)));
writeFileSync(index, (header + [...keep, md].join("\n")).replace(/\n{3,}/g, "\n\n"));
