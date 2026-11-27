// Before/after images for release notes, in the style of assets/releases/1.4.4-*.jpg.
// Renders real articles through NetNewsWire's own page shell, core.css, main.js and
// newsfoot.js (read from /Applications/NetNewsWire.app) with the theme from a git ref
// ("before") and the working tree ("after"), then saves one labelled pair per case.
//
// Articles live in .corpus/<id>.json (gitignored: feed content stays local). Use free,
// public feeds only for anything published. Synthetic articles for markup the corpus
// lacks live in fixtures/<name>.json (committed); a case names one with `fixture`.
// A case's `scheme` overrides --scheme.
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
	{ slug: "x-embed-dark", id: "xembed-1", scheme: "dark", alt: "An embedded X post in dark mode: before, a white card; after, a dark card", sel: ".twitter-tweet", maxH: 900, wait: 6000 },
	{ slug: "video-embed", id: "yt-1", offline: true, alt: "A Latent Space post on iPhone: before, the YouTube video covers the first line below it; after, the line is clear", sel: "iframe", extraBelow: 140 },
	{ slug: "podcast-caption-file-name", id: "podcast-2", alt: "A Dwarkesh episode: before, the player caption is a hashed .mp3 file name; after, just the length", sel: ".nnw-primary-media", scope: "body", maxH: 760 },
	{ slug: "code-copy", id: "pre-3", alt: "A code block on the Mac: after, a quiet Copy button appears on hover", sel: "pre", hasText: "paperjam: $(OBJS)", width: 900, act: "hover" },
	{ slug: "macrumors-deal-gaps", id: "macrumors-3", alt: "MacRumors deal buttons on iPhone: before, a blank gap between each button; after, the buttons sit together", sel: ".center-wrap", extraBelow: 420, maxH: 760 },
	{ slug: "duplicate-cover-sized", id: "podcast-1", alt: "A Latent Space episode whose lead picture is the 1400x1400 copy of the body's: before, the cover twice; after, once", top: 1300 },
	{ slug: "code-language", fixture: "code-language", alt: "Code blocks on the Mac: after, the block's language shows beside Copy on hover", sel: "pre", width: 900, act: "hover" },
	{ slug: "code-copy-one-line", fixture: "code-language", alt: "A one-line shell command on the Mac: after, Copy and the language sit in a cap at the line's end instead of over the command", sel: "pre", hasText: "ollama serve", width: 900, act: "hover" },
	{ slug: "code-language-dark", fixture: "code-language", scheme: "dark", alt: "The same code blocks in dark mode", sel: "pre", width: 900, act: "hover" },
	{ slug: "feed-credit", fixture: "feed-credit", alt: "A WordPress post's end: before, a 'The post ... appeared first on ...' line; after, the post ends on its own last paragraph", top: 1000 },
	{ slug: "feed-footnotes", fixture: "feed-footnotes", alt: "A footnote read through FreshRSS: before, tapping it does nothing; after, the note opens in place", sel: "sup a", para: true, extraBelow: 260, act: "click" },
	{ slug: "feed-cards", fixture: "feed-cards", alt: "WordPress and Ghost cards on iPhone: before, a blank embed frame, a raw toggle, callout and video player; after, a link card, an open toggle, a tinted callout and a fitted video", sel: ".wp-embedded-content", maxH: 1800, extraBelow: 1500 },
	{ slug: "feed-cards-dark", fixture: "feed-cards", scheme: "dark", alt: "The same cards in dark mode", sel: ".wp-embedded-content", maxH: 1800, extraBelow: 1500 },
	{ slug: "ghost-video-poster", fixture: "feed-cards", alt: "A Ghost video card from the site's web page: before, an empty box until the video plays; after, the video's thumbnail", sel: ".kg-video-card", extraBelow: 40 },
	{ slug: "math-katex", fixture: "platform-math", alt: "KaTeX math from a Jekyll blog on iPhone: before, each formula twice, once as raw text; after, once", sel: ".katex-display", para: false, extraBelow: 120 },
	{ slug: "footnote-pandoc", fixture: "platform-footnotes", alt: "Pandoc and GitHub-style footnotes: before, tapping the number does nothing; after, the note opens in place", sel: "a[href='#fn1']", para: true, extraBelow: 260, act: "click" },
	{ slug: "medium-credit", fixture: "platform-credit", alt: "A Medium story's end: before, a rule and an 'originally published in ... on Medium' line; after, the story ends on its own last paragraph", top: 760 },
	{ slug: "code-language-rouge", fixture: "platform-code", alt: "A Jekyll (Rouge) code block on the Mac: before, no language; after, Python beside Copy on hover", sel: "pre", width: 900, act: "hover" },
	{ slug: "instagram-placeholder", fixture: "platform-instagram", alt: "An Instagram embed in a Ghost or WordPress post on iPhone: before, empty placeholder rows leave gaps in the card; after, just the link to the post and its caption", sel: ".instagram-media" },
	{ slug: "pullquote-aside", fixture: "feed-cards", alt: "A pull-quote and an aside: before, both look like the text around them; after, the pull-quote sits between hairlines and the aside in a tinted box", sel: ".wp-block-pullquote", extraBelow: 260 },
	{ slug: "signup-form-macrumors", id: "macrumors-3", alt: "A MacRumors deals post on iPhone: before, a Mailchimp email field and Subscribe button that can't work in a reader; after, the sign-up link stays and the form is gone", sel: "h3", hasText: "Deals Newsletter", extraBelow: 360, maxH: 900 },
	{ slug: "signup-form-pill", fixture: "signup-forms", alt: "A Substack subscribe box and a Mailchimp form on iPhone: before, email fields and buttons that can't work in a reader; after, each form is one quiet pill that opens the publisher's sign-up page", sel: ".subscription-widget-wrap-editor, [data-calm-signup]", extraBelow: 520, maxH: 900 },
	{ slug: "signup-form-pill-dark", fixture: "signup-forms", scheme: "dark", alt: "The same sign-up pills in dark mode", sel: ".subscription-widget-wrap-editor, [data-calm-signup]", extraBelow: 520, maxH: 900 },
	{ slug: "link-card-quiet", fixture: "link-cards", alt: "A Ghost bookmark card on iPhone: before, a bold display title and three lines, like a second headline; after, the title in the body's weight and two muted lines", sel: ".kg-bookmark-card", extraBelow: 120 },
	{ slug: "link-card-quiet-dark", fixture: "link-cards", scheme: "dark", alt: "The same link card in dark mode", sel: ".kg-bookmark-card", extraBelow: 120 },
	{ slug: "quote-upright", id: "platforms/daringfireball-1", alt: "A long quoted passage on Daring Fireball, on iPhone: before, muted italic; after, upright in the text colour, still set off by its rule", sel: "blockquote", hasText: "This can feel frustrating", maxH: 900 },
	{ slug: "quote-upright-dark", id: "platforms/daringfireball-1", scheme: "dark", alt: "The same quote in dark mode", sel: "blockquote", hasText: "This can feel frustrating", maxH: 900 },
	{ slug: "heading-steps", fixture: "headings", alt: "Headings on iPhone: before, an h2 and an h3 that read as the same level; after, a clearly larger h2 over a smaller h3", sel: "h2", extraBelow: 820, maxH: 1100 },
	{ slug: "heading-steps-dark", fixture: "headings", scheme: "dark", alt: "The same headings in dark mode", sel: "h2", extraBelow: 820, maxH: 1100 },
	{ slug: "paragraph-gaps-large-text", fixture: "paragraphs", textSize: "xxlargeText", alt: "Short paragraphs at NetNewsWire's largest text size on iPhone: before, the default-size gap between them; after, the gap grows with the text (the default size is unchanged)", sel: "p", extraBelow: 560, maxH: 1300 },
	{ slug: "button-tinted", fixture: "platform-buttons", alt: "Publishers' buttons on iPhone: before, a thin outlined pill; after, a pill filled with the code-block tint, larger to tap", sel: ".button-wrapper", extraBelow: 700, maxH: 1100 },
	{ slug: "button-tinted-dark", fixture: "platform-buttons", scheme: "dark", alt: "The same buttons in dark mode", sel: ".button-wrapper", extraBelow: 700, maxH: 1100 },
	{ slug: "footnote-minimal", fixture: "platform-footnotes", alt: "Pandoc and GitHub footnotes on iPhone: before, plain superscripts that jump to the end of the article; after, a plain muted number, and a tapped note opens in the text under its line, small, muted and in mono, pushing the text below down", sel: "a[href='#user-content-fn-2']", para: true, extraBelow: 200, act: "click" },
	{ slug: "footnote-minimal-dark", fixture: "platform-footnotes", scheme: "dark", alt: "The same footnotes in dark mode", sel: "a[href='#user-content-fn-2']", para: true, extraBelow: 200, act: "click" },
	{ slug: "footnote-substack", fixture: "substack-footnotes", alt: "A Substack footnote on iPhone: before, the number sits on the line at full size like a stray digit; after, a small raised number, and a tap opens the note under its line", sel: "a.footnote-anchor", para: true, extraBelow: 200, act: "click" },
	{ slug: "task-list", fixture: "platform-tasks", alt: "GitHub and Hugo task lists on iPhone: before, a bullet beside a small grey box; after, a text-size box in the muted text colour in place of the bullet", sel: "ul", extraBelow: 260 },
	{ slug: "task-list-dark", fixture: "platform-tasks", scheme: "dark", alt: "The same task lists in dark mode", sel: "ul", extraBelow: 260 },
	{ slug: "plain-captions", fixture: "platform-captions", alt: "Captions sent as plain blocks (WordPress classic, Jekyll, Blogger) on iPhone: before, they read as body text set apart from the picture; after, small muted centred captions under the picture, like Calm's figcaption", sel: ".wp-caption", extraBelow: 1100, maxH: 1700 },
	{ slug: "plain-captions-dark", fixture: "platform-captions", scheme: "dark", alt: "The same captions in dark mode", sel: ".wp-caption", extraBelow: 1100, maxH: 1700 },
	{ slug: "code-line-numbers", fixture: "platform-code-lines", alt: "A Jekyll code block with line numbers on iPhone: before, small code in boxes inside a box with wide gaps; after, one box at the usual code size with muted numbers", sel: "figure.highlight", extraBelow: 20 },
	{ slug: "code-line-numbers-dark", fixture: "platform-code-lines", scheme: "dark", alt: "The same code block in dark mode", sel: "figure.highlight", extraBelow: 20 },
	{ slug: "quote-bold", fixture: "design-pass", alt: "Bold words in a quote on iPhone: before, speaker names and emphasis jump to the heading colour; after, they keep the quote's quiet colour and stand out by weight", sel: "blockquote" },
	{ slug: "quote-bold-dark", fixture: "design-pass", scheme: "dark", alt: "The same quote in dark mode, where the bold words were brightest", sel: "blockquote" },
	{ slug: "caption-bold", fixture: "platform-captions", alt: "A caption with a bold phrase: before, the phrase in near-black inside the grey caption; after, the caption's own colour", sel: ".thecap", para: false, extraBelow: 0, maxH: 400 },
];

const theme = (dir) => join(dir, "Calm.nnwtheme");
const beforeDir = mkdtempSync(join(tmpdir(), "calm-before-"));
execFileSync("sh", ["-c", `git -C "${root}" archive "${base}" Calm.nnwtheme | tar -x -C "${beforeDir}"`]);
const themes = { before: theme(beforeDir), after: theme(root) };
mkdirSync(join(root, out), { recursive: true });

const browser = await webkit.launch();
async function shoot(c, which) {
	const article = JSON.parse(readFileSync(source(c), "utf8"));
	const html = join(beforeDir, `${c.slug}-${which}.html`);
	writeFileSync(html, buildPage({ theme: themes[which], article, textSize: c.textSize }));
	const width = c.width || 390;
	const page = await browser.newPage({ viewport: { width, height: 1600 }, deviceScaleFactor: 2, colorScheme: c.scheme || scheme });
	// offline: block the network, so a third-party player draws its empty box
	// instead of an error it shows when loaded from a local file.
	if (c.offline) await page.route(/^https?:/, (route) => route.abort());
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
		if ((which === "after" || c.both) && c.act === "click") { await el.click(); await page.waitForTimeout(600); }
		const box = await el.evaluate((node, para) => { const t = para ? node.closest("p, li") || node : node; const r = t.getBoundingClientRect(); return { y: r.top, h: r.height }; }, !!c.para);
		clip = { x: 0, y: Math.max(0, box.y - pad), width, height: Math.min(box.h + pad * 2 + (c.extraBelow || 0), c.maxH || 900) };
	}
	const png = await page.screenshot({ clip, timeout: 90000 });
	await page.close();
	return `data:image/png;base64,${png.toString("base64")}`;
}

function source(c) {
	return c.fixture ? join(root, "fixtures", `${c.fixture}.json`) : join(root, ".corpus", `${c.id}.json`);
}

const made = [];
for (const c of cases.filter((c) => !only.length || only.includes(c.slug))) {
	if (!existsSync(source(c))) { console.log(`skip ${c.slug}: no ${source(c)}`); continue; }
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
