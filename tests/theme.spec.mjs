import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { extractInlineScript } from "../scripts/extract-inline-script.mjs";

const stylesheet = readFileSync("Calm.nnwtheme/stylesheet.css", "utf8");
const themeScript = extractInlineScript("Calm.nnwtheme/template.html");
const articleTitle = "A Field Guide to Quiet Reading";
const paragraph =
	"A calm reading surface gives the words enough room to establish their own rhythm without adding another layer of interface.";

function fixtureBody({ headings = [], paragraphCount = 24, image = false } = {}) {
	const sections = headings
		.map(
			({ level, text }) =>
				`<h${level}>${text}</h${level}><p>${paragraph}</p><p>${paragraph}</p>`,
		)
		.join("");
	const paragraphs = Array.from({ length: paragraphCount }, () => `<p>${paragraph}</p>`).join("");
	const fixtureImage = image
		? '<img id="fixture-image" alt="Warm abstract blocks" width="480" height="240" src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22480%22 height=%22240%22%3E%3Crect width=%22480%22 height=%22240%22 fill=%22%23f1b35c%22/%3E%3Ccircle cx=%22325%22 cy=%22120%22 r=%2280%22 fill=%22%236e70b8%22/%3E%3C/svg%3E">'
		: "";
	return `${fixtureImage}${sections}${paragraphs}`;
}

async function loadFixture(page, options = {}) {
	await page.setContent(`<!doctype html>
		<html>
		<head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${stylesheet}</style></head>
		<body>
			<nav class="readerToc" aria-label="Article sections" hidden>
				<div class="readerTocTitle">Sections</div>
				<div class="readerTocContext" aria-hidden="true"></div>
				<ol id="readerTocList"></ol>
			</nav>
			<header class="articleHeader" id="readerTop">
				<div class="articleTitle"><h1><a href="#">${articleTitle}</a></h1></div>
				<div class="articleMeta"><span class="feedName">Field Notes</span></div>
				<div class="externalLink" hidden></div>
			</header>
			<article><div id="bodyContainer" class="articleBody mediumText">${fixtureBody(options)}</div></article>
			<script>${themeScript}</script>
		</body>
		</html>`);
}

test("@webkit keeps compact WebKit typography readable and images undistorted", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await loadFixture(page, { paragraphCount: 8, image: true });

	const typography = await page.locator(".articleBody").evaluate((node) => {
		const style = getComputedStyle(node);
		return { fontSize: Number.parseFloat(style.fontSize), lineHeight: Number.parseFloat(style.lineHeight) };
	});
	expect(typography.fontSize).toBeCloseTo(18.5, 1);
	expect(typography.lineHeight / typography.fontSize).toBeCloseTo(1.48, 2);
	await expect(page.locator(".readerToc")).toBeHidden();
	await expect(page.locator("#fixture-image")).toHaveCSS("mix-blend-mode", "normal");
});

test("@webkit adapts markers to article length and heading hierarchy", async ({ page }) => {
	await page.setViewportSize({ width: 1180, height: 800 });
	await loadFixture(page, { paragraphCount: 1 });
	await expect(page.locator(".readerToc")).toBeHidden();

	await loadFixture(page, { paragraphCount: 36 });
	await expect(page.locator(".readerToc button")).toHaveCount(5);
	await expect(page.locator(".readerToc button").first()).toHaveAttribute("aria-current", "location");

	await loadFixture(page, {
		paragraphCount: 16,
		headings: [
			{ level: 2, text: "Opening" },
			{ level: 3, text: "Supporting detail" },
			{ level: 2, text: "OPENING" },
			{ level: 2, text: "Advertisement" },
			{ level: 2, text: "Context" },
			{ level: 2, text: "Method" },
			{ level: 2, text: "Evidence" },
			{ level: 2, text: "Tradeoffs" },
			{ level: 2, text: "Practice" },
			{ level: 2, text: "Examples" },
			{ level: 2, text: "Questions" },
			{ level: 2, text: "Conclusion" },
		],
	});
	const labels = await page.locator(".readerToc button").allTextContents();
	expect(labels.length).toBeLessThanOrEqual(9);
	expect(labels.filter((label) => label.toLowerCase() === "opening")).toHaveLength(1);
	expect(labels).not.toContain("Advertisement");
	expect(labels).not.toContain("Supporting detail");
});

test("@webkit rebuilds across Split View and refreshes targets after content growth", async ({ page }) => {
	await page.setViewportSize({ width: 1024, height: 800 });
	await loadFixture(page, { paragraphCount: 36 });
	await expect(page.locator(".readerToc button")).toHaveCount(5);

	await page.setViewportSize({ width: 744, height: 800 });
	await expect(page.locator(".readerToc button")).toHaveCount(0);
	await page.setViewportSize({ width: 1024, height: 800 });
	await expect(page.locator(".readerToc button")).toHaveCount(5);

	const oldScrollMax = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
	await page.locator("#bodyContainer").evaluate((body) => {
		const lateMedia = document.createElement("div");
		lateMedia.style.height = "1600px";
		lateMedia.setAttribute("aria-hidden", "true");
		body.appendChild(lateMedia);
	});
	await page.waitForFunction((previous) => document.documentElement.scrollHeight - innerHeight > previous + 1000, oldScrollMax);
	await page.waitForTimeout(100);
	await page.locator(".readerToc button").last().click();
	await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(oldScrollMax + 500);
});

test("@visual matches the canonical compact reading surface", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await loadFixture(page, { paragraphCount: 6, image: true });
	await expect(page).toHaveScreenshot("calm-compact.png", {
		animations: "disabled",
		fullPage: true,
		maxDiffPixelRatio: 0.005,
	});
});
