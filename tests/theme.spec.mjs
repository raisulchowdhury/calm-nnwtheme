import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { extractInlineScript } from "../scripts/extract-inline-script.mjs";

const stylesheet = readFileSync("Calm.nnwtheme/stylesheet.css", "utf8");
const themeScript = extractInlineScript("Calm.nnwtheme/template.html");
const articleTitle = "A Field Guide to Quiet Reading";
const paragraph =
	"A calm reading surface gives the words enough room to establish their own rhythm without adding another layer of interface.";

function fixtureBody({ headings = [], paragraphCount = 24, image = false, lateMedia = false } = {}) {
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
	const lateMediaFixtures = lateMedia
		? '<img id="late-image" alt="Late-loading abstract illustration"><video id="fixture-video" title="Silent reading demo" muted></video><audio id="fixture-audio" aria-label="Article audio"></audio>'
		: "";
	return `${fixtureImage}${lateMediaFixtures}${sections}${paragraphs}`;
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

test("@webkit uses ordinary paragraph wrapping in compact layouts", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await loadFixture(page, { paragraphCount: 1 });

	const textWrap = await page
		.locator(".articleBody p")
		.first()
		.evaluate((node) => getComputedStyle(node).getPropertyValue("text-wrap"));
	expect(textWrap).toBe("wrap");
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

test("@webkit builds the map when late media turns a short article long", async ({ page }) => {
	await page.setViewportSize({ width: 1180, height: 800 });
	await loadFixture(page, { paragraphCount: 1, lateMedia: true });
	await expect(page.locator(".readerToc")).toBeHidden();

	await page.locator("#late-image").evaluate(async (image) => {
		image.src =
			"data:image/svg+xml," +
			encodeURIComponent(
				'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="1800"><rect width="640" height="1800" fill="#f1b35c"/></svg>',
			);
		await image.decode();
	});
	await page.locator("#fixture-video").evaluate((video) => {
		video.style.height = "240px";
		video.dispatchEvent(new Event("loadedmetadata"));
	});
	await page.locator("#fixture-audio").evaluate((audio) => {
		audio.dispatchEvent(new Event("loadedmetadata"));
	});

	await expect(page.locator(".readerToc")).toBeVisible();
	await expect(page.locator(".readerToc button")).toHaveCount(5);
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

// NetNewsWire's newsfoot.js inserts the footnote popover inside the reference's
// <sup>, next to the a.footnote link. These rules mirror the positioning that
// NetNewsWire's core.css applies to every theme.
const newsfootCore = `
.newsfoot-footnote-container { position: relative; display: inline-block; z-index: 9999; }
.newsfoot-footnote-popover { position: absolute; display: block; padding: 0em 1em; margin: 1em 0; top: 0.75em; max-width: 44em; border-radius: 0.3em; box-sizing: border-box; }
.newsfoot-footnote-popover-arrow { display: block; width: 1em; position: absolute; top: -0.5em; height: 1em !important; transform: rotate(45deg); z-index: 0; }
.newsfoot-footnote-popover-inner { border-radius: calc(0.3em - 1px); padding: 1em; position: relative; z-index: 1; }
a.footnote { display: inline-block; text-decoration: none; padding: 0.05em 0.75em; border-radius: 1em; min-width: 1em; text-align: center; font-size: 0.8em; line-height: 1em; position: relative; top: -0.1em; }
`;

for (const colorScheme of ["light", "dark"]) {
	test(`@webkit keeps footnote popovers legible in ${colorScheme} mode`, async ({ page }) => {
		await page.emulateMedia({ colorScheme });
		await page.setViewportSize({ width: 1280, height: 800 });
		const footnote =
			"This footnote is long enough to wrap across several lines inside the popover, so overlapping lines would be easy to see. It also has a <a href=\"#\">link</a>.";
		await page.setContent(`<!doctype html>
			<html>
			<head><style>${newsfootCore}</style><style>${stylesheet}</style></head>
			<body>
				<article><div id="bodyContainer" class="articleBody mediumText">
					<p id="fn-paragraph">${paragraph}<sup id="fnr1"><a class="footnote" href="#fn1">1</a></sup></p>
					<p>${paragraph}</p>
				</div></article>
			</body>
			</html>`);
		// Build the popover the way newsfoot.js does: wrap the link in a container
		// inside the <sup>, then insert the popover before the link.
		await page.evaluate((html) => {
			const link = document.querySelector("a.footnote");
			const container = document.createElement("div");
			container.className = "newsfoot-footnote-container";
			link.parentElement.insertBefore(container, link);
			container.appendChild(link);
			const popover = document.createElement("div");
			popover.className = "newsfoot-footnote-popover";
			popover.style.left = "0px";
			popover.style.width = "420px";
			const inner = document.createElement("div");
			inner.className = "newsfoot-footnote-popover-inner";
			inner.innerHTML = html;
			const arrow = document.createElement("div");
			arrow.className = "newsfoot-footnote-popover-arrow";
			popover.append(inner, arrow);
			container.insertBefore(popover, link);
		}, `<p>${footnote}</p>`);

		const popover = await page.locator(".newsfoot-footnote-popover-inner p").evaluate((node) => {
			const style = getComputedStyle(node);
			const inner = getComputedStyle(node.closest(".newsfoot-footnote-popover-inner"));
			const body = getComputedStyle(document.querySelector(".articleBody"));
			return {
				fontSize: Number.parseFloat(style.fontSize),
				lineHeight: Number.parseFloat(style.lineHeight),
				bodyFontSize: Number.parseFloat(body.fontSize),
				height: node.getBoundingClientRect().height,
				background: inner.backgroundColor,
				pageBackground: getComputedStyle(document.body).backgroundColor,
			};
		});
		expect(popover.lineHeight / popover.fontSize).toBeGreaterThan(1.3);
		expect(popover.fontSize).toBeGreaterThan(popover.bodyFontSize * 0.8);
		expect(popover.height).toBeGreaterThan(popover.lineHeight * 2.5);
		expect(popover.background).not.toBe("rgba(0, 0, 0, 0)");
		await expect(page.locator("a.footnote")).toHaveCSS("text-decoration-line", "none");
	});
}

test("@webkit keeps NetNewsWire 7.3 media inside the reading measure", async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	const wide = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%222000%22 height=%22800%22%3E%3Crect width=%222000%22 height=%22800%22 fill=%22%236e70b8%22/%3E%3C/svg%3E';
	await page.setContent(`<!doctype html>
		<html>
		<head><style>${stylesheet}</style></head>
		<body>
			<header class="articleHeader" id="readerTop"><div class="articleTitle"><h1><a href="#">${articleTitle}</a></h1></div></header>
			<article>
				<div class="nnw-primary-media"><div class="nnw-primary-image"><img id="primary" src="${wide}" alt=""><div class="nnw-primary-image-caption">Cover art</div></div></div>
				<div id="bodyContainer" class="articleBody mediumText"><p>${paragraph}</p></div>
				<div class="nnw-enclosures">
					<div class="nnw-enclosure nnw-enclosure-image"><img id="enclosure" src="${wide}" alt=""></div>
					<div class="nnw-enclosure nnw-enclosure-audio"><audio id="audio" controls preload="none"></audio><div class="nnw-enclosure-caption">a-very-long-episode-file-name-without-any-spaces-that-should-wrap-instead-of-overflowing.mp3 · 1:51:27 · 53.8 MB</div></div>
				</div>
			</article>
		</body>
		</html>`);

	const geometry = await page.evaluate(() => {
		const article = document.querySelector("article").getBoundingClientRect();
		const box = (selector) => document.querySelector(selector).getBoundingClientRect();
		return {
			article: { left: article.left, right: article.right },
			items: ["#primary", "#enclosure", "#audio", ".nnw-enclosure-caption"].map((selector) => {
				const rect = box(selector);
				return { selector, left: rect.left, right: rect.right, height: rect.height };
			}),
			imageRatio: box("#primary").width / box("#primary").height,
		};
	});
	for (const item of geometry.items) {
		expect(item.left, item.selector).toBeGreaterThanOrEqual(geometry.article.left - 0.5);
		expect(item.right, item.selector).toBeLessThanOrEqual(geometry.article.right + 0.5);
	}
	expect(geometry.imageRatio).toBeCloseTo(2.5, 1);
	await expect(page.locator(".nnw-enclosure-caption")).toHaveCSS("color", "rgb(112, 107, 100)");
});
