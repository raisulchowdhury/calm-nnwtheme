// Design options gallery: renders the current Calm (option 0) beside mocked
// alternatives for one area at a time, each on the same real or synthetic
// article crop at 390 wide, light and dark, and writes one self-contained page
// (images embedded) to docs/design-pass-options.html.
//
// Options are mockups: each one is extra CSS appended after Calm's stylesheet
// for that render only. Nothing here changes the theme.
//
// Articles come from free feeds in .corpus/ (gitignored) or from fixtures/.
// Usage: node scripts/design-options.mjs [area ...]
import { readFileSync, writeFileSync, existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { webkit } from "playwright";
import { buildPage } from "./before-after-page.mjs";

const root = new URL("..", import.meta.url).pathname;
const theme = join(root, "Calm.nnwtheme");
const P = "A calm reading surface gives the words enough room to establish their own rhythm without adding another layer of interface.";
const dark = (css) => `@media (prefers-color-scheme: dark) { ${css} }`;

// Line art on a transparent background, and a photo-like opaque picture.
const lineArt = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300"><g fill="none" stroke="#111" stroke-width="3"><path d="M40 260H570M40 260V30"/><path d="M40 230 130 190 220 205 310 120 400 140 490 70 560 60" stroke-width="4"/></g><g font-family="Helvetica" font-size="18" fill="#111"><text x="60" y="290">2019</text><text x="290" y="290">2021</text><text x="500" y="290">2023</text><text x="60" y="50">Readers</text></g></svg>`)}`;
const photo = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc7ef"/><stop offset="1" stop-color="#f3e2c0"/></linearGradient></defs><rect width="600" height="360" fill="url(#s)"/><path d="M0 250 140 150 260 230 380 120 600 260V360H0Z" fill="#3f6b4a"/><circle cx="470" cy="80" r="38" fill="#fff4c8"/></svg>`)}`;

const synthetic = {
	headings: { title: "Notes on a Quiet Page", feedTitle: "Example Blog", contentHTML: `<p>${P}</p><h2>Why the page matters</h2><p>${P}</p><h3>What readers do first</h3><p>${P}</p><h4>A smaller point</h4><p>${P}</p><h3>What they do next</h3><p>${P}</p>` },
	images: { title: "Charts and Photos", feedTitle: "Example Blog", contentHTML: `<p>${P}</p><img src="${lineArt}" width="600" height="300" alt="A line chart drawn in black on a transparent background"><p>${P}</p><img src="${photo}" width="600" height="360" alt="A landscape"><p>${P}</p>` },
};

// Each area: the article, what to crop, and the options. Option 0 is Calm as it is.
const areas = [
	{
		id: "link-cards",
		title: "Link cards",
		question: "A linked post is an extension of the article, not a second article. How much should the card say?",
		source: { fixture: "link-cards" },
		sel: ".kg-bookmark-card",
		pad: 70,
		options: [
			{ name: "Current", score: 7.0, cost: "none", insight: "Bold display title, three lines of excerpt, source line, bordered box: it reads as a second headline in the middle of the article.", css: "" },
			{
				name: "Quiet card",
				recommended: true,
				score: 8.3,
				cost: "none (CSS only)",
				insight: "Readers glance at a linked post to decide whether to open it later: the title in the body's weight and two muted lines are enough, and the hairline keeps it findable.",
				css: `.articleBody .kg-bookmark-container,.articleBody .embedded-post{margin:1.4em 0;padding:.75em .95em .8em}
.articleBody .kg-bookmark-title,.articleBody .embedded-post-title{font-family:var(--reader-serif-body);font-weight:500;font-size:.95em;line-height:1.35}
.articleBody .kg-bookmark-description,.articleBody .embedded-post-body{-webkit-line-clamp:2;font-size:.82em;margin-top:.25em}
.articleBody .kg-bookmark-metadata,.articleBody .embedded-post-header{font-size:.7em;font-weight:400;margin-top:.5em}`,
			},
			{
				name: "Tint, title and source only",
				score: 7.8,
				cost: "none (CSS only)",
				insight: "If the excerpt is never read, drop it: a tinted strip with the title and where it's from says 'link' without competing with the text around it.",
				css: `.articleBody .kg-bookmark-container,.articleBody .embedded-post{margin:1.4em 0;padding:.7em .95em;border:0;background:var(--reader-code-bg)}
.articleBody .kg-bookmark-title,.articleBody .embedded-post-title{font-family:var(--reader-serif-body);font-weight:500;font-size:.95em}
.articleBody .kg-bookmark-description,.articleBody .embedded-post-body{display:none}
.articleBody .kg-bookmark-metadata,.articleBody .embedded-post-header{font-size:.7em;font-weight:400;margin-top:.35em}`,
			},
			{
				name: "One line, no box",
				score: 7.3,
				cost: "none (CSS only)",
				insight: "The quietest form: the link as one underlined line with its source beneath, like a footnote in the flow; easy to miss for readers who skim.",
				css: `.articleBody .kg-bookmark-container,.articleBody .embedded-post{margin:1em 0;padding:0;border:0}
.articleBody .kg-bookmark-title,.articleBody .embedded-post-title{font-family:var(--reader-serif-body);font-weight:400;font-size:1em;text-decoration:underline;text-decoration-color:var(--reader-faint);text-underline-offset:.18em}
.articleBody .kg-bookmark-title::after{content:" \\2197";color:var(--reader-muted)}
.articleBody .kg-bookmark-description,.articleBody .embedded-post-body,.articleBody .kg-bookmark-icon{display:none}
.articleBody .kg-bookmark-metadata,.articleBody .embedded-post-header{font-size:.7em;font-weight:400;margin-top:.2em}`,
			},
		],
	},
	{
		id: "footnotes",
		title: "Footnotes",
		question: "Can the footnote marker and the note that opens in place be more minimal?",
		source: { fixture: "platform-footnotes" },
		sel: "p:has(a[href='#fn1'])",
		pad: 40,
		extraBelow: 40,
		states: ["closed", "open"],
		click: "a[href='#fn1']",
		options: [
			{ name: "Current", score: 7.6, cost: "none", insight: "A tinted pill behind a small bold number, and a bordered popover with a shadow and an arrow.", css: "" },
			{
				name: "Plain number, soft note",
				recommended: true,
				score: 8.4,
				cost: "none (CSS only)",
				insight: "Readers know a raised number is a note (books taught them); it needs no pill. The opened note keeps its shadow for depth and drops the border and arrow.",
				css: `.articleBody a.footnote,.articleBody a.footnote:visited{background:none;padding:0 .1em;font-weight:500;color:var(--reader-muted);font-size:.85em}
.articleBody a.footnote:hover,.articleBody .newsfoot-footnote-popover + a.footnote{background:none;color:var(--reader-heading)}
.newsfoot-footnote-popover{padding:0;background:var(--reader-popover-bg);box-shadow:0 8px 28px rgba(36,32,29,.14)}
.newsfoot-footnote-popover-arrow{display:none!important}
${dark(".newsfoot-footnote-popover{box-shadow:0 8px 28px rgba(0,0,0,.6);background:#22211f}.newsfoot-footnote-popover-inner{background:#22211f}")}`,
			},
			{
				name: "Plain number, flat tint",
				score: 7.9,
				cost: "none (CSS only)",
				insight: "No floating card at all: the note opens as a flat tinted box, the same surface as code and asides, so nothing in the page casts a shadow.",
				css: `.articleBody a.footnote,.articleBody a.footnote:visited{background:none;padding:0 .1em;font-weight:500;color:var(--reader-muted);font-size:.85em}
.articleBody a.footnote:hover,.articleBody .newsfoot-footnote-popover + a.footnote{background:none;color:var(--reader-heading)}
.newsfoot-footnote-popover{padding:0;box-shadow:none;background:var(--reader-code-bg)}
.newsfoot-footnote-popover-inner{background:var(--reader-code-bg)}
.newsfoot-footnote-popover-arrow{display:none!important}`,
			},
			{
				name: "Hairline note",
				score: 7.6,
				cost: "none (CSS only)",
				insight: "Closest to an inline note that CSS alone can reach: a lighter marker, and the note drawn between two hairlines like Calm's pull-quotes, with no card, shadow or arrow. A true inline or margin note would need the popover moved by script after a tap, which NetNewsWire's own footnote script owns.",
				css: `.articleBody a.footnote,.articleBody a.footnote:visited{background:none;padding:0 .1em;font-weight:400;color:var(--reader-muted);font-size:.8em}
.newsfoot-footnote-popover{padding:0;box-shadow:none;background:var(--reader-bg);border-top:1px solid var(--reader-rule);border-bottom:1px solid var(--reader-rule);border-radius:0}
.newsfoot-footnote-popover-inner{background:var(--reader-bg);border-radius:0;padding:.7em .2em!important;color:var(--reader-muted)}
.newsfoot-footnote-popover-arrow{display:none!important}`,
			},
		],
	},
	{
		id: "quotes",
		title: "Block quotes",
		question: "Long quoted passages are read, not skimmed. Should they stay muted and italic?",
		source: { id: "daringfireball-1" },
		sel: "blockquote",
		hasText: "frustrating",
		pad: 40,
		maxH: 560,
		options: [
			{ name: "Current", score: 7.4, cost: "none", insight: "Muted italic with a faint rule: elegant for a line, tiring over a paragraph-long quote (Daring Fireball quotes whole paragraphs).", css: "" },
			{
				name: "Upright, text colour",
				recommended: true,
				score: 8.3,
				cost: "none (CSS only)",
				insight: "Quotes in reading apps (Safari Reader, Instapaper) stay upright: the rule and indent already say 'quoted', and the reader keeps full contrast for long passages.",
				css: `.articleBody blockquote{color:var(--reader-text);font-style:normal}`,
			},
			{ name: "Italic, text colour", score: 7.9, cost: "none (CSS only)", insight: "Keeps Calm's italic voice for quotes but restores body contrast, so only the shape changes, not the strength.", css: `.articleBody blockquote{color:var(--reader-text)}` },
			{ name: "Upright, muted", score: 7.7, cost: "none (CSS only)", insight: "Stays visibly secondary to the author's own words while dropping the italic that slows long passages.", css: `.articleBody blockquote{font-style:normal}` },
		],
	},
	{
		id: "headings",
		title: "Heading scale",
		question: "h2 (1.3em) and h3 (1.225em) are both bold serif within 6% of each other. Should the steps be clearer?",
		source: { synthetic: "headings" },
		sel: "h2",
		pad: 40,
		extraBelow: 560,
		maxH: 820,
		options: [
			{ name: "Current", score: 7.5, cost: "none", insight: "h2 and h3 read as the same level; only h4's small sans capitals is clearly lower.", css: "" },
			{ name: "Clearer steps", recommended: true, score: 8.3, cost: "none (CSS only)", insight: "Readers use heading size to tell a new section from a sub-point; a third larger h2 over a body-plus-15% h3 makes the outline readable at a glance.", css: `.articleBody h2{font-size:1.45em}.articleBody h3{font-size:1.12em}` },
			{ name: "h3 in sans", score: 7.8, cost: "none (CSS only)", insight: "Marks the sub-level by face, not size, the way Calm already does h4: a small semibold sans h3 under serif h2s.", css: `.articleBody h3{font-family:var(--reader-sans);font-size:.95em;font-weight:650;letter-spacing:0}` },
		],
	},
	{
		id: "paragraphs",
		title: "Paragraph spacing at large text sizes",
		question: "The gap between paragraphs is a fixed 16px, so it shrinks against the text as the reader picks a larger size. Shown at NetNewsWire's largest text size.",
		source: { id: "ghost-codinghorror-1", textSize: "xxlargeText" },
		sel: "p",
		hasText: "Personally",
		pad: 40,
		extraBelow: 420,
		maxH: 700,
		options: [
			{ name: "Current", score: 7.6, cost: "none", insight: "1rem between paragraphs at every size: right at the default size, cramped at the largest.", css: "" },
			{ name: "Scales with text", recommended: true, score: 8.2, cost: "none (CSS only); changes every article, so the Linux visual reference image must be regenerated", insight: "A reader who enlarges the text wants the whole page larger, gaps included: 0.9em matches today's gap at the default size and grows with it.", css: `.articleBody p{margin:.9em 0}` },
			{ name: "A full line", score: 7.4, cost: "same as above", insight: "Book-like generous gaps; loosens the default size too, which makes short-paragraph posts feel scattered.", css: `.articleBody p{margin:1.1em 0}` },
		],
	},
	{
		id: "images-dark",
		title: "Pictures in dark mode",
		question: "Black line art on a transparent background disappears on Calm's dark page, and bright photos glare.",
		source: { synthetic: "images" },
		sel: "img",
		pad: 30,
		extraBelow: 470,
		maxH: 860,
		darkOnly: true,
		options: [
			{ name: "Current", score: 7.0, cost: "none", insight: "Line art vanishes; photos at full brightness.", css: "" },
			{ name: "Paper backing for line art", recommended: true, score: 8.2, cost: "none (CSS only, by file type, so a PNG shows the backing while it loads)", insight: "Charts and diagrams are drawn for white paper; a soft paper tone behind PNG, GIF and SVG pictures lets them read, and photos (JPEG, WebP) stay as they are.", css: dark(`.articleBody img:is([src*=".png" i],[src*=".gif" i],[src*=".svg" i],[src^="data:image/svg" i]){background:#d8d3c6}`) },
			{ name: "Backing and dimmed photos", score: 7.9, cost: "none (CSS only)", insight: "Also takes the glare off photos (90% brightness), as Reeder and Matter do; some readers see it as a grey film over every picture.", css: dark(`.articleBody img:is([src*=".png" i],[src*=".gif" i],[src*=".svg" i],[src^="data:image/svg" i]){background:#d8d3c6}.articleBody img{filter:brightness(.9)}`) },
			{ name: "Dimmed photos only", score: 7.2, cost: "none (CSS only)", insight: "Fixes glare but not the vanishing chart, the larger problem.", css: dark(`.articleBody img{filter:brightness(.9)}`) },
		],
	},
	{
		id: "buttons",
		title: "Buttons",
		question: "The pill is 13.8px text in a 32px-tall box with a border at about 1.2:1 against the page: below Apple's 44pt touch size and hard to see.",
		source: { fixture: "platform-buttons" },
		sel: ".button-wrapper",
		pad: 60,
		extraBelow: 60,
		options: [
			{ name: "Current", score: 7.2, cost: "none", insight: "Quiet, but easy to miss and a small target on iPhone.", css: "" },
			{ name: "Visible border, full-size target", recommended: true, score: 8.1, cost: "none (CSS only)", insight: "A button is the one place the publisher asks for a tap; a muted-colour border and a 44px height make it findable and easy to hit while staying one quiet outline.", css: `.articleBody :is(a.button,a.btn,a.wp-block-button__link,a.kg-btn,a.kg-cta-button,a.sqs-block-button-element){border-color:var(--reader-faint);padding:.75em 1.3em;font-size:.9rem}` },
			{ name: "Tinted pill", score: 7.6, cost: "none (CSS only)", insight: "A filled tint instead of an outline reads as a control without adding colour.", css: `.articleBody :is(a.button,a.btn,a.wp-block-button__link,a.kg-btn,a.kg-cta-button,a.sqs-block-button-element){border-color:transparent;background:var(--reader-code-bg)!important;padding:.75em 1.3em;font-size:.9rem}` },
		],
	},
];

const only = process.argv.slice(2);
const work = mkdtempSync(join(tmpdir(), "calm-options-"));
const browser = await webkit.launch();

function article(source) {
	if (source.synthetic) return { ...synthetic[source.synthetic], url: "https://example.com/" };
	const file = source.fixture ? join(root, "fixtures", `${source.fixture}.json`) : [join(root, ".corpus", `${source.id}.json`), join(root, ".corpus/platforms", `${source.id}.json`)].find(existsSync);
	if (!file || !existsSync(file)) throw new Error(`no article for ${JSON.stringify(source)}`);
	return JSON.parse(readFileSync(file, "utf8"));
}

async function shoot(area, option, scheme, state) {
	const html = buildPage({ theme, article: article(area.source), textSize: area.source.textSize }).replace("</head>", `<style>${option.css}</style></head>`);
	const file = join(work, `${area.id}.html`);
	writeFileSync(file, html);
	const page = await browser.newPage({ viewport: { width: 390, height: 1400 }, deviceScaleFactor: 2, colorScheme: scheme });
	await page.goto("file://" + file, { waitUntil: "load", timeout: 30000 }).catch(() => {});
	await page.waitForTimeout(1200);
	const el = page.locator(`#bodyContainer :is(${area.sel})`).filter(area.hasText ? { hasText: area.hasText } : {}).first();
	await el.evaluate((n, pad) => window.scrollTo(0, n.getBoundingClientRect().top + scrollY - pad), area.pad);
	await page.waitForTimeout(150);
	if (state === "open") { await page.locator(`#bodyContainer ${area.click}`).first().click(); await page.waitForTimeout(500); }
	const box = await el.evaluate((n) => { const r = n.getBoundingClientRect(); return { y: r.top, h: r.height }; });
	const extra = (area.extraBelow || 0) + (state === "open" ? 170 : 0);
	const clip = { x: 0, y: Math.max(0, box.y - area.pad), width: 390, height: Math.min(box.h + area.pad * 2 + extra, area.maxH || 900) };
	const jpg = await page.screenshot({ clip, type: "jpeg", quality: 72 });
	await page.close();
	return `data:image/jpeg;base64,${jpg.toString("base64")}`;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const sections = [];
for (const area of areas.filter((a) => !only.length || only.includes(a.id))) {
	const [current, ...rest] = area.options;
	const ordered = [current, ...rest.filter((o) => o.recommended), ...rest.filter((o) => !o.recommended)];
	const schemes = area.darkOnly ? ["dark"] : ["light", "dark"];
	const states = area.states || [null];
	const cards = [];
	for (const [i, option] of ordered.entries()) {
		const shots = [];
		for (const state of states) for (const scheme of schemes) shots.push({ label: [state, scheme].filter(Boolean).join(", "), src: await shoot(area, option, scheme, state) });
		cards.push(`<article class="option${option.recommended ? " rec" : ""}"><header><span class="num">${i === 0 ? "0 · Current Calm" : `${i} · ${esc(option.name)}`}</span>${option.recommended ? '<span class="tag">Recommended</span>' : ""}<span class="score">${option.score.toFixed(1)}</span></header><p class="insight">${esc(option.insight)}</p><p class="cost">Performance: ${esc(option.cost)}</p><div class="shots">${shots.map((s) => `<figure><img src="${s.src}" alt="${esc(area.title)}, ${esc(option.name)}, ${s.label}"><figcaption>${s.label}</figcaption></figure>`).join("")}</div></article>`);
		console.log(area.id, option.name);
	}
	sections.push(`<section id="${area.id}"><h2>${esc(area.title)}</h2><p class="q">${esc(area.question)}</p><div class="row">${cards.join("")}</div></section>`);
}
await browser.close();

const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Calm Design Options</title><style>
:root{--bg:#f6f4ef;--card:#fff;--text:#24201d;--muted:#706b64;--rule:#e4dccb;--rec:#24201d}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#0c0b0b;--card:#181716;--text:#e6e4d9;--muted:#9a978f;--rule:#2e2d2b;--rec:#e6e4d9}}
:root[data-theme="dark"]{--bg:#0c0b0b;--card:#181716;--text:#e6e4d9;--muted:#9a978f;--rule:#2e2d2b;--rec:#e6e4d9}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 -apple-system,BlinkMacSystemFont,"SF Pro Text",Helvetica,sans-serif}
main{max-width:1600px;margin:0 auto;padding:40px 16px 80px}
h1{font:700 30px/1.15 "Iowan Old Style",Charter,Georgia,serif;margin:0 0 8px}
.lede{color:var(--muted);max-width:44rem;margin:0 0 28px}
nav{display:flex;flex-wrap:wrap;gap:8px 16px;margin:0 0 36px}nav a{color:var(--text)}
section{margin:0 0 56px}h2{font:700 22px/1.2 "Iowan Old Style",Charter,Georgia,serif;margin:0 0 4px}.q{color:var(--muted);margin:0 0 16px;max-width:48rem}
.row{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px;align-items:flex-start}
.option{flex:0 0 auto;background:var(--card);border:1px solid var(--rule);border-radius:12px;padding:14px}
.insight{max-width:34rem}
.option.rec{border-color:var(--rec)}
header{display:flex;align-items:baseline;gap:10px}.num{font-weight:600}.tag{font-size:12px;font-weight:600;border:1px solid var(--rec);border-radius:999px;padding:1px 8px}.score{margin-left:auto;font-variant-numeric:tabular-nums;font-weight:600}
.insight{margin:6px 0 2px;max-width:34rem}.cost{margin:0 0 10px;color:var(--muted);font-size:13px}
.shots{display:flex;gap:10px;align-items:flex-start}figure{margin:0}img{display:block;width:260px;height:auto;border-radius:6px;border:1px solid var(--rule)}figcaption{color:var(--muted);font-size:12px;margin-top:4px}
@media (max-width:600px){img{width:min(72vw,240px)}}
</style></head><body><main><h1>Calm design options</h1><p class="lede">Mockups from the design pass of 2026-11-27. Option 0 in each row is Calm as it ships; the recommended option comes next. Each option is extra CSS rendered at 390 wide on the same crop, so none of them is in the theme until chosen. Scores are out of 10 against Readwise Reader, Reeder, Matter, Instapaper, Safari Reader and the strongest NetNewsWire themes.</p><nav>${areas.filter((a) => !only.length || only.includes(a.id)).map((a) => `<a href="#${a.id}">${esc(a.title)}</a>`).join("")}</nav>${sections.join("")}</main></body></html>`;
writeFileSync(join(root, "docs/design-pass-options.html"), page);
console.log("docs/design-pass-options.html", Math.round(page.length / 1024), "KB");
