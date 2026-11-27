// Measures what Calm adds to an article's load, against NetNewsWire's Default theme.
// Pages are built with NetNewsWire's own page shell, core.css, main.js and newsfoot.js
// (scripts/before-after-page.mjs), with every network request blocked so the numbers
// are Calm's work, not the network's.
//
// WebKit (NetNewsWire's engine): Calm's first script pass, DOMContentLoaded, load,
// and each step's share. Chromium: layout shift after first paint (Calm's script and
// CSS run before it, so any shift is a regression) and the layouts the page needs.
//
// Usage: node scripts/measure-performance.mjs [--runs 5] [--components] [article.json ...]
// With no articles: the five largest in .corpus/ (gitignored) plus the stress article.
import { mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync, copyFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, webkit } from "playwright";
import { buildPage } from "./before-after-page.mjs";
import { extractInlineScript } from "./extract-inline-script.mjs";
import { componentArticle, componentSteps, components, instrumentScript, stressArticle } from "../tests/stress-fixtures.mjs";

const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(name); if (i < 0) return fallback; const v = args[i + 1]; args.splice(i, 2); return v; };
const runs = Number(flag("--runs", "5"));
const perComponent = args.includes("--components") ? (args.splice(args.indexOf("--components"), 1), true) : false;
const root = new URL("..", import.meta.url).pathname;
const calmTheme = join(root, "Calm.nnwtheme");
const calmScript = extractInlineScript(join(calmTheme, "template7.3.html"));
const work = mkdtempSync(join(tmpdir(), "calm-perf-"));

// NetNewsWire's Default theme: its template and stylesheet from the app.
const defaultTheme = join(work, "Default.nnwtheme");
mkdirSync(defaultTheme);
const resources = "/Applications/NetNewsWire.app/Contents/Resources";
copyFileSync(join(resources, "template.html"), join(defaultTheme, "template.html"));
copyFileSync(join(resources, "stylesheet.css"), join(defaultTheme, "stylesheet.css"));

function pageFor(article, theme) {
	if (theme === "Default") return buildPage({ theme: defaultTheme, article, template: "template.html" });
	const html = buildPage({ theme: calmTheme, article });
	if (!html.includes(calmScript)) throw new Error("Calm's script not found in the built page");
	return html.replace(calmScript, () => instrumentScript(calmScript));
}

const median = (list) => { const s = [...list].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const blockNetwork = (page) => page.route(/^https?:/, (route) => route.abort());

async function timeInWebKit(browser, html, name) {
	const file = join(work, `${name}.html`);
	writeFileSync(file, html);
	const samples = [];
	for (let run = 0; run < runs + 1; run++) {
		const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
		await blockNetwork(page);
		await page.goto("file://" + file, { waitUntil: "load" });
		const metrics = await page.evaluate(() => {
			const nav = performance.getEntriesByType("navigation")[0];
			const paint = performance.getEntriesByName("first-contentful-paint")[0];
			return { pass: window.__calmPass ?? 0, steps: window.__calmSteps || {}, dcl: nav.domContentLoadedEventEnd, load: nav.loadEventEnd, fcp: paint ? paint.startTime : NaN };
		});
		await page.close();
		if (run > 0) samples.push(metrics); // the first run warms the engine
	}
	const steps = {};
	for (const key of Object.keys(samples[0].steps)) steps[key] = median(samples.map((s) => s.steps[key]));
	return { pass: median(samples.map((s) => s.pass)), dcl: median(samples.map((s) => s.dcl)), load: median(samples.map((s) => s.load)), fcp: median(samples.map((s) => s.fcp)), steps };
}

async function shiftsInChromium(browser, html, name, width) {
	const file = join(work, `${name}-c.html`);
	writeFileSync(file, html);
	const page = await browser.newPage({ viewport: { width, height: 844 } });
	await blockNetwork(page);
	await page.addInitScript(() => {
		window.__shift = 0;
		new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__shift += entry.value; }).observe({ type: "layout-shift", buffered: true });
	});
	const cdp = await page.context().newCDPSession(page);
	await cdp.send("Performance.enable");
	await page.goto("file://" + file, { waitUntil: "load" });
	await page.waitForTimeout(800);
	const shift = await page.evaluate(() => window.__shift);
	const { metrics } = await cdp.send("Performance.getMetrics");
	const layouts = metrics.find((m) => m.name === "LayoutCount").value;
	await page.close();
	return { shift, layouts };
}

const articles = [];
if (args.length) {
	for (const path of args) articles.push({ name: path.split("/").pop().replace(/\.json$/, ""), article: JSON.parse(readFileSync(path, "utf8")) });
} else {
	const corpus = [];
	for (const dir of [join(root, ".corpus"), join(root, ".corpus", "platforms")]) {
		try { for (const f of readdirSync(dir)) if (f.endsWith(".json")) corpus.push(join(dir, f)); } catch {}
	}
	corpus.sort((a, b) => statSync(b).size - statSync(a).size);
	for (const path of corpus.slice(0, 5)) articles.push({ name: path.split("/").pop().replace(/\.json$/, ""), article: JSON.parse(readFileSync(path, "utf8")) });
	articles.push({ name: "stress (synthetic)", article: { title: "Stress", url: "https://example.com/stress", contentHTML: stressArticle() } });
}
if (perComponent) {
	articles.length = 0;
	for (const name of Object.keys(components).filter((n) => n !== "footnoteList")) {
		articles.push({ name: `component: ${name} x200`, component: name, article: { title: "Components", url: "https://example.com/c", contentHTML: componentArticle(name, 200) } });
	}
}

const wk = await webkit.launch();
const cr = await chromium.launch({ channel: process.env.CALM_CHROMIUM_CHANNEL ?? "chrome" });
const rows = [];
for (const { name, article, component } of articles) {
	const slug = name.replace(/[^a-z0-9]+/gi, "-");
	const calm = await timeInWebKit(wk, pageFor(article, "Calm"), `${slug}-calm`);
	const plain = await timeInWebKit(wk, pageFor(article, "Default"), `${slug}-default`);
	const shift390 = await shiftsInChromium(cr, pageFor(article, "Calm"), `${slug}-390`, 390);
	const shift900 = await shiftsInChromium(cr, pageFor(article, "Calm"), `${slug}-900`, 900);
	const plainLayouts = await shiftsInChromium(cr, pageFor(article, "Default"), `${slug}-d`, 900);
	const own = component ? (componentSteps[component] || []).map((s) => `${s} ${calm.steps[s]?.toFixed(2)}`).join(", ") : "";
	const top = Object.entries(calm.steps).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(", ");
	rows.push({ name, kb: Math.round(Buffer.byteLength(article.contentHTML || "") / 1024), calm, plain, shift390, shift900, plainLayouts, own, top });
	console.error(`done ${name}`);
}
await wk.close();
await cr.close();

const f = (n) => (Number.isFinite(n) ? n.toFixed(1) : "n/a");
console.log(`WebKit, median of ${runs} runs, network blocked, 390 wide. Times in ms.\n`);
console.log("| Article | KB | Calm pass | Calm load | Default load | Calm FCP | Default FCP | Shift 390 / 900 (Chrome) | Layouts Calm / Default (Chrome) | Slowest steps |");
console.log("|---|---|---|---|---|---|---|---|---|---|");
for (const r of rows) {
	console.log(`| ${r.name} | ${r.kb} | ${f(r.calm.pass)} | ${f(r.calm.load)} | ${f(r.plain.load)} | ${f(r.calm.fcp)} | ${f(r.plain.fcp)} | ${r.shift390.shift.toFixed(4)} / ${r.shift900.shift.toFixed(4)} | ${r.shift900.layouts} / ${r.plainLayouts.layouts} | ${r.own || r.top} |`);
}
