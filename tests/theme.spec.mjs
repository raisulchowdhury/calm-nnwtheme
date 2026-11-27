import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { extractInlineScript } from "../scripts/extract-inline-script.mjs";
import { componentArticle, componentSteps, instrumentScript, stressArticle } from "./stress-fixtures.mjs";

const stylesheet = readFileSync("Calm.nnwtheme/stylesheet.css", "utf8");
const themeScript = extractInlineScript("Calm.nnwtheme/template.html");
const articleTitle = "A Field Guide to Quiet Reading";
const paragraph =
	"A calm reading surface gives the words enough room to establish their own rhythm without adding another layer of interface.";

function fixtureBody({ headings = [], paragraphCount = 24, image = false, lateMedia = false, html = "" } = {}) {
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
	return `${fixtureImage}${lateMediaFixtures}${sections}${paragraphs}${html}`;
}

async function loadFixture(page, options = {}) {
	// No doctype: NetNewsWire's page.html has none, so articles render in quirks mode.
	await page.setContent(`<html dir="auto">
		<head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${stylesheet}</style></head>
		<body>
			<nav class="readerToc" aria-label="Article sections" hidden>
				<div class="readerTocTitle">Sections</div>
				<div class="readerTocContext" aria-hidden="true"></div>
				<ol id="readerTocList"></ol>
			</nav>
			<header class="articleHeader" id="readerTop">
				<div class="articleTitle"><h1><a href="#">${options.title ?? articleTitle}</a></h1></div>
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

test("@webkit marks the clicked section as current when its heading lands on a fractional marker line", async ({ page }) => {
	// 780px tall gives a 93.6px marker line, so the heading lands a fraction
	// below it after the browser rounds the scroll position.
	await page.setViewportSize({ width: 1160, height: 780 });
	await loadFixture(page, {
		paragraphCount: 16,
		headings: ["Context", "Method", "Evidence", "Tradeoffs", "Practice"].map((text) => ({ level: 2, text })),
	});
	const markers = page.locator(".readerToc button");
	await expect(markers).toHaveCount(6);
	for (let index = 1; index < 6; index++) {
		await markers.nth(index).click();
		await page.waitForTimeout(150);
		await expect(markers.nth(index)).toHaveAttribute("aria-current", "location");
	}
});

test("@webkit reaches every final-screen heading and the true bottom", async ({ page }) => {
	await page.setViewportSize({ width: 1180, height: 800 });
	// Five sections up front, then three short sections that all fit on the last screen.
	await loadFixture(page, {
		paragraphCount: 0,
		headings: ["Context", "Method", "Evidence", "Tradeoffs", "Practice", "Questions", "Sources", "Thanks"].map((text, index) => ({
			level: 2,
			text,
			...(index < 5 ? {} : {}),
		})),
	});
	await page.evaluate(() => {
		const body = document.querySelector(".articleBody");
		const headings = [...body.querySelectorAll("h2")];
		for (const heading of headings.slice(0, 5)) {
			for (let i = 0; i < 6; i++) {
				const p = document.createElement("p");
				p.textContent = "A calm reading surface gives the words enough room to establish their own rhythm without adding another layer of interface.";
				heading.after(p);
			}
		}
		window.dispatchEvent(new Event("resize"));
	});
	await page.waitForTimeout(200);
	const markers = page.locator(".readerToc button");
	await expect(markers).toHaveCount(9);
	for (let index = 1; index < 9; index++) {
		await markers.nth(index).click();
		await page.waitForTimeout(150);
		await expect(markers.nth(index)).toHaveAttribute("aria-current", "location");
	}
	await expect
		.poll(() =>
			page.evaluate(() => {
				const root = document.scrollingElement || document.documentElement;
				return root.scrollHeight - window.innerHeight - window.scrollY;
			}),
		)
		.toBeLessThanOrEqual(2);
});

test("@webkit sends the Bottom depth marker to the end of the article", async ({ page }) => {
	await page.setViewportSize({ width: 1180, height: 800 });
	await loadFixture(page, { paragraphCount: 36 });
	const markers = page.locator(".readerToc button");
	await expect(markers).toHaveCount(5);
	await markers.nth(4).click();
	await expect
		.poll(() =>
			page.evaluate(() => {
				const root = document.scrollingElement || document.documentElement;
				return root.scrollHeight - window.innerHeight - window.scrollY;
			}),
		)
		.toBeLessThanOrEqual(2);
	await expect(markers.nth(4)).toHaveAttribute("aria-current", "location");
	await markers.nth(2).click();
	await page.waitForTimeout(150);
	await expect(markers.nth(2)).toHaveAttribute("aria-current", "location");
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

test("@webkit hides NetNewsWire's lead picture when the body opens with the same one", async ({ page }) => {
	await page.setViewportSize({ width: 1180, height: 800 });
	// As on Latent Space: the same file behind two different image-CDN paths.
	const page73 = (bodyStart) => `<html dir="auto">
		<head><style>${stylesheet}</style></head>
		<body>
			<header class="articleHeader" id="readerTop"><div class="articleTitle"><h1><a href="#">${articleTitle}</a></h1></div></header>
			<article>
				<div class="nnw-primary-media"><div class="nnw-primary-image"><img id="lead" src="https://media.example.com/uploads/asset/thumb.png" alt=""></div></div>
				<div id="bodyContainer" class="articleBody mediumText">${bodyStart}<p>${paragraph}</p></div>
			</article>
			<script>${themeScript}</script>
		</body>
		</html>`;
	const opening = `<div><a href="https://youtu.be/x"><img id="inBody" src="https://media.example.com/cdn-cgi/image/fit=scale-down,quality=80/uploads/asset/thumb.png?t=1" alt=""></a><small><a href="https://youtu.be/x">Open video on YouTube</a></small></div>`;

	await page.setContent(page73(opening));
	await expect(page.locator(".nnw-primary-media")).toHaveAttribute("hidden", "");
	await expect(page.locator("#inBody")).toBeAttached();

	// The same picture later in the text is a reprise, not a duplicate cover.
	await page.setContent(page73(`<p>${paragraph}</p>${opening}`));
	await expect(page.locator(".nnw-primary-media")).not.toHaveAttribute("hidden", "");
});

test("@webkit asks X embeds for a dark card in dark mode, and leaves light mode alone", async ({ page }) => {
	await page.setViewportSize({ width: 1180, height: 800 });
	const tweet = `<blockquote class="twitter-tweet"><p>Post</p>&mdash; Someone <a href="https://twitter.com/someone/status/1">March 26, 2026</a></blockquote><blockquote class="twitter-tweet" data-theme="light" id="chosen"><p>Post</p></blockquote>`;
	await page.emulateMedia({ colorScheme: "dark" });
	await loadFixture(page, { paragraphCount: 1, html: tweet });
	await expect(page.locator("blockquote.twitter-tweet").first()).toHaveAttribute("data-theme", "dark");
	// A theme the feed chose stays as it is.
	await expect(page.locator("#chosen")).toHaveAttribute("data-theme", "light");

	await page.emulateMedia({ colorScheme: "light" });
	await loadFixture(page, { paragraphCount: 1, html: tweet });
	await expect(page.locator("blockquote.twitter-tweet").first()).not.toHaveAttribute("data-theme", /./);
});

test("@webkit builds the map when NetNewsWire 7.3 primary media outside the body loads late", async ({ page }) => {
	await page.setViewportSize({ width: 1180, height: 800 });
	await loadFixture(page, { paragraphCount: 1 });
	await expect(page.locator(".readerToc")).toBeHidden();

	await page.evaluate(async () => {
		const media = document.createElement("div");
		media.className = "nnw-primary-media";
		const image = document.createElement("img");
		media.appendChild(image);
		document.querySelector("article").prepend(media);
		image.src =
			"data:image/svg+xml," +
			encodeURIComponent(
				'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="2400"><rect width="640" height="2400" fill="#6e70b8"/></svg>',
			);
		await image.decode();
	});

	await expect(page.locator(".readerToc")).toBeVisible();
	await expect(page.locator(".readerToc button")).toHaveCount(5);
});

test("@webkit removes the gaps that feeds' empty blocks leave", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await loadFixture(page, {
		paragraphCount: 0,
		html: `<p id="before">${paragraph}</p>
			<p data-test="blank-p">&nbsp;</p>
			<div data-test="blank-div"><br></div>
			<p data-test="zero-width">\u200b</p>
			<div data-test="clear" style="clear: both;"></div>
			<div data-test="rule" style="border-top: 1px solid;"></div>
			<p id="anchor-target" data-test="anchor-target"></p>
			<div data-test="kept-image"><img alt="" width="10" height="10" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></div>
			<p><a name="old-anchor"></a></p>
			<p id="after">${paragraph}</p>`,
	});
	const state = await page.evaluate(() => {
		const find = (name) => document.querySelector(`[data-test="${name}"]`);
		const display = (name) => getComputedStyle(find(name)).display;
		const anchorParent = document.querySelector('a[name="old-anchor"]').parentElement;
		return {
			blankP: display("blank-p"),
			blankDiv: display("blank-div"),
			zeroWidth: display("zero-width"),
			clear: display("clear"),
			clearHeight: find("clear").getBoundingClientRect().height,
			rule: display("rule"),
			anchorTarget: display("anchor-target"),
			keptImage: display("kept-image"),
			oldAnchor: getComputedStyle(anchorParent).display,
		};
	});
	expect(state).toEqual({
		blankP: "none",
		blankDiv: "none",
		zeroWidth: "none",
		clear: "block",
		clearHeight: 0,
		rule: "block",
		anchorTarget: "block",
		keptImage: "block",
		oldAnchor: "block",
	});
});

test("@webkit keeps fixed-width feed blocks and Substack image buttons in check", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	const wide = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221034%22 height=%22500%22%3E%3Crect width=%221034%22 height=%22500%22 fill=%22%236e70b8%22/%3E%3C/svg%3E';
	await loadFixture(page, {
		paragraphCount: 1,
		html: `<div id="caption" class="wp-caption" style="width: 1034px"><img src="${wide}" alt=""><p class="wp-caption-text">A caption</p></div>
			<div class="captioned-image-container"><figure><a class="image-link" href="#"><img src="${wide}" alt=""><div class="image-link-expand"><button id="restack">Restack</button></div></a></figure></div>`,
	});
	const state = await page.evaluate(() => {
		const body = document.getElementById("bodyContainer").getBoundingClientRect();
		const caption = document.getElementById("caption").getBoundingClientRect();
		return {
			fits: caption.right <= body.right + 0.5,
			pageWidth: document.documentElement.scrollWidth,
			viewport: document.documentElement.clientWidth,
		};
	});
	expect(state.fits).toBe(true);
	expect(state.pageWidth).toBeLessThanOrEqual(state.viewport);
	await expect(page.locator("#restack")).toBeHidden();
});

const svg = (width, height, fill = "%236e70b8") =>
	`data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22${width}%22 height=%22${height}%22%3E%3Crect width=%22${width}%22 height=%22${height}%22 fill=%22${fill}%22/%3E%3C/svg%3E`;

test("@webkit keeps icons and emoji drawn as images inside the line", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await loadFixture(page, {
		paragraphCount: 0,
		html: `<p id="df">There are no <img id="em-icon" alt="" style="height: 1em;" src="${svg(120, 120)}"> buttons in the menu bar.</p>
			<p>A <img id="attr-icon" alt="" width="16" height="16" src="${svg(64, 64)}"> icon and an emoji<img id="wp-emoji" alt="" src="${svg(72, 72)}#/images/core/emoji/15/svg/1f634.svg"> in the line.</p>
			<p id="pixel-p"><img id="pixel" alt="" width="1" height="1" src="${svg(1, 1)}"></p>
			<p><img id="photo" alt="" width="1200" height="600" src="${svg(1200, 600)}"></p>`,
	});
	const state = await page.evaluate(() => {
		const line = Number.parseFloat(getComputedStyle(document.querySelector("#df")).fontSize);
		const box = (id) => document.getElementById(id).getBoundingClientRect();
		return {
			line,
			icons: ["em-icon", "attr-icon", "wp-emoji"].map((id) => ({
				id,
				height: box(id).height,
				display: getComputedStyle(document.getElementById(id)).display,
			})),
			pixel: getComputedStyle(document.getElementById("pixel")).display,
			photo: { display: getComputedStyle(document.getElementById("photo")).display, width: box("photo").width },
		};
	});
	for (const icon of state.icons) {
		expect(icon.display, icon.id).toBe("inline");
		expect(icon.height, icon.id).toBeLessThanOrEqual(state.line * 1.3);
	}
	expect(state.pixel).toBe("none");
	expect(state.photo.display).toBe("block");
	expect(state.photo.width).toBeGreaterThan(300);
});

test("@webkit gives floated images room beside the text, and unfloats them on iPhone", async ({ page }) => {
	const html = `<p><img id="float" align="left" alt="" width="400" height="300" src="${svg(400, 300)}">${paragraph} ${paragraph}</p>`;
	await page.setViewportSize({ width: 1280, height: 800 });
	await loadFixture(page, { paragraphCount: 0, html });
	const wide = await page.evaluate(() => {
		const image = document.getElementById("float");
		const style = getComputedStyle(image);
		return {
			float: style.float,
			width: image.getBoundingClientRect().width,
			column: document.getElementById("bodyContainer").getBoundingClientRect().width,
			gap: Number.parseFloat(style.marginRight),
		};
	});
	expect(wide.float).toBe("left");
	expect(wide.width).toBeLessThanOrEqual(wide.column / 2 + 0.5);
	expect(wide.gap).toBeGreaterThanOrEqual(16);

	await page.setViewportSize({ width: 390, height: 844 });
	await expect(page.locator("#float")).toHaveCSS("float", "none");
});

test("@webkit removes line breaks around blocks and images but keeps them inside text", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await loadFixture(page, {
		paragraphCount: 0,
		html: `<p id="lead">${paragraph}<br><br/></p><p id="image-p"><br/><br><img id="hero" alt="" width="600" height="300" src="${svg(600, 300)}"><br><br/><br>After the image.<br><br/></p>
			<p id="poem">Roses are red,<br>violets are blue.</p>
			<pre id="code">line one<br>line two</pre>`,
	});
	const state = await page.evaluate(() => ({
		lead: document.querySelectorAll("#lead br").length,
		imageParagraph: document.querySelectorAll("#image-p br").length,
		poem: document.querySelectorAll("#poem br").length,
		code: document.querySelectorAll("#code br").length,
	}));
	expect(state).toEqual({ lead: 0, imageParagraph: 0, poem: 1, code: 1 });
});

test("@webkit opens footnotes that link through the site's home page", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await loadFixture(page, {
		paragraphCount: 0,
		html: `<p>${paragraph}<sup id="fnref-1-x"><a id="ref" href="https://sixcolors.com#fn-1-x" class="jetpack-footnote">1</a></sup></p>
			<p>A link elsewhere<sup><a id="other" href="https://example.com#fn-9">2</a></sup>.</p>
			<div class="footnotes"><hr><ol><li id="fn-1-x">The note. <a id="back" href="https://sixcolors.com#fnref-1-x">↩</a></li></ol></div>`,
	});
	await expect(page.locator("#ref")).toHaveClass(/(^|\s)footnote(\s|$)/);
	await expect(page.locator("#other")).not.toHaveClass(/(^|\s)footnote(\s|$)/);
	await expect(page.locator("#back")).not.toHaveClass(/(^|\s)footnote(\s|$)/);
});

test("@webkit starts a post with no title at its source line", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await loadFixture(page, { paragraphCount: 2, title: "" });
	await expect(page.locator("#readerTop")).toHaveClass(/isUntitled/);
	await expect(page.locator(".articleTitle")).toBeHidden();
	const gap = await page.evaluate(
		() => document.querySelector(".articleMeta").getBoundingClientRect().top - document.body.getBoundingClientRect().top,
	);
	expect(gap).toBeLessThan(60);

	await loadFixture(page, { paragraphCount: 2 });
	await expect(page.locator(".articleTitle")).toBeVisible();
});

test("@webkit sizes embedded posts to the height they report", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await loadFixture(page, {
		paragraphCount: 1,
		html: `<div class="iframeWrap"><iframe id="post" src="about:blank"></iframe></div><div class="iframeWrap"><iframe id="video" src="about:blank"></iframe></div>`,
	});
	await page.evaluate(() => {
		const post = document.getElementById("post").contentWindow;
		const video = document.getElementById("video").contentWindow;
		const resize = { "twttr.embed": { method: "twttr.private.resize", params: [{ width: 358, height: 584 }] } };
		window.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(resize), origin: "https://platform.twitter.com", source: post }));
		window.dispatchEvent(new MessageEvent("message", { data: { height: 900 }, origin: "https://www.youtube.com", source: video }));
	});
	const heights = await page.evaluate(() => ["post", "video"].map((id) => document.getElementById(id).getBoundingClientRect().height));
	expect(heights[0]).toBeCloseTo(584, 0);
	expect(heights[1]).toBeLessThan(260);
});

test("@webkit keeps readable text above 4.5:1 and darkens it under Increase Contrast", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await loadFixture(page, { paragraphCount: 1, html: '<p class="systemMessage" id="message">No article selected</p>' });
	const color = () => page.locator("#message").evaluate((node) => getComputedStyle(node).color);
	expect(await color()).toBe("rgb(112, 107, 100)");
	await page.emulateMedia({ contrast: "more" });
	expect(await color()).toBe("rgb(77, 72, 66)");
});

test("@webkit quiets NetNewsWire 7.3 podcast captions", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.setContent(`<!doctype html><html><head><style>${stylesheet}</style></head><body>
		<header class="articleHeader" id="readerTop"><div class="articleTitle"><h1><a href="#">${articleTitle}</a></h1></div></header>
		<article>
			<div class="nnw-primary-media"><div class="nnw-enclosure nnw-enclosure-audio" id="untitled"><audio controls preload="none"></audio><div class="nnw-enclosure-caption"><a href="https://example.com/a9606f26acc6870494c29aa0a5007a9d.mp3">a9606f26acc6870494c29aa0a5007a9d.mp3</a> · 53.8 MB</div></div></div>
			<div id="bodyContainer" class="articleBody mediumText"><p>${paragraph}</p></div>
			<div class="nnw-enclosures"><div class="nnw-enclosure nnw-enclosure-audio" id="titled"><audio controls preload="none"></audio><div class="nnw-enclosure-caption">Episode 311 · 1:54:09 · 54.9 MB</div></div>
			<div class="nnw-enclosure nnw-enclosure-audio" id="short"><audio controls preload="none"></audio><div class="nnw-enclosure-caption">42:31</div></div></div>
		</article>
		<script>${themeScript}</script></body></html>`);
	await expect(page.locator("#untitled .nnw-enclosure-caption")).toBeHidden();
	await expect(page.locator("#titled .nnw-enclosure-caption")).toHaveText("Episode 311 · 1 hr 54 min");
	await expect(page.locator("#short .nnw-enclosure-caption")).toHaveText("43 min");
});

test("@webkit marks Japanese, Chinese, Korean, Arabic, and Hebrew articles for their own serif", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	const samples = {
		ja: "静かな読書のための画面は、言葉が自分のリズムを作るための余白を与えます。ここではそれを確かめます。",
		zh: "安静的阅读界面让文字有足够的空间建立自己的节奏，而不会增加另一层界面。我们在这里检查它。",
		ko: "조용한 읽기 화면은 글이 스스로 리듬을 만들 수 있도록 충분한 여백을 줍니다. 여기서 확인합니다.",
		ar: "تمنح واجهة القراءة الهادئة الكلمات مساحة كافية لتأسيس إيقاعها الخاص دون إضافة طبقة أخرى.",
		he: "משטח קריאה שקט נותן למילים מספיק מקום כדי לבסס את הקצב שלהן בלי להוסיף עוד שכבה.",
	};
	for (const [lang, text] of Object.entries(samples)) {
		await loadFixture(page, { paragraphCount: 0, html: `<p>${text}</p><p>${text}</p>` });
		await expect(page.locator("#bodyContainer")).toHaveAttribute("lang", lang);
	}
	await loadFixture(page, { paragraphCount: 2 });
	await expect(page.locator("#bodyContainer")).not.toHaveAttribute("lang", /.+/);
});

test("@webkit lays out Ghost gallery rows side by side at one height", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await loadFixture(page, {
		paragraphCount: 1,
		html: `<figure class="kg-card kg-gallery-card kg-width-wide"><div class="kg-gallery-container"><div class="kg-gallery-row">
			<div class="kg-gallery-image"><img id="g1" width="1600" height="2000" loading="lazy" sizes="(min-width: 720px) 720px" alt=""></div>
			<div class="kg-gallery-image"><img id="g2" width="2000" height="1600" loading="lazy" sizes="(min-width: 720px) 720px" alt=""></div>
		</div></div></figure>
			<figure class="wp-block-gallery has-nested-images is-cropped"><figure class="wp-block-image"><img id="wp1" width="1200" height="926" alt=""></figure></figure>`,
	});
	// Bitmaps, since WebKit reports an SVG's natural size as its shown size.
	await page.evaluate(async () => {
		for (const [id, width, height] of [["g1", 800, 1000], ["g2", 1000, 800], ["wp1", 600, 463]]) {
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			canvas.getContext("2d").fillRect(0, 0, width, height);
			const image = document.getElementById(id);
			image.src = canvas.toDataURL("image/png");
			await image.decode();
		}
	});
	const [a, b, wp] = await page.evaluate(() => ["g1", "g2", "wp1"].map((id) => document.getElementById(id).getBoundingClientRect().toJSON()));
	expect(Math.abs(a.top - b.top)).toBeLessThan(1);
	expect(Math.abs(a.height - b.height)).toBeLessThan(2);
	expect(b.left).toBeGreaterThan(a.right);
	// Each picture keeps its own shape instead of stretching to the screen height.
	expect(Math.abs(a.height - a.width * 2000 / 1600)).toBeLessThan(3);
	expect(Math.abs(b.height - b.width * 1600 / 2000)).toBeLessThan(3);
	expect(Math.abs(wp.height - wp.width * 926 / 1200)).toBeLessThan(3);
});

test("@webkit shows Substack and Ghost link cards as one quiet box", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await loadFixture(page, {
		paragraphCount: 1,
		html: `<div class="embedded-post-wrap"><a class="embedded-post" href="https://example.com/p"><div class="embedded-post-header"><span class="embedded-post-publication-name">SemiAnalysis</span></div><div class="embedded-post-title-wrapper"><div class="embedded-post-title">A post</div></div><div class="embedded-post-body">${paragraph} ${paragraph}</div><div class="embedded-post-cta-wrapper"><span class="embedded-post-cta">Read more</span></div><div class="embedded-post-meta" id="meta">7 days ago · 338 likes · 4 comments</div></a></div>
			<figure class="kg-card kg-bookmark-card"><a class="kg-bookmark-container" id="bookmark" href="https://example.com/b"><div class="kg-bookmark-content"><div class="kg-bookmark-title">A bookmark</div><div class="kg-bookmark-description">${paragraph}</div></div></a></figure>`,
	});
	await expect(page.locator("#meta")).toBeHidden();
	await expect(page.locator(".embedded-post-cta")).toBeHidden();
	await expect(page.locator(".embedded-post")).toHaveCSS("text-decoration-line", "none");
	await expect(page.locator("#bookmark")).toHaveCSS("border-top-style", "solid");
});

test("@webkit offers a Copy button on code blocks with a mouse", async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await loadFixture(page, { paragraphCount: 1, html: "<pre id=\"code\"><code>make all\nmake install</code></pre><pre id=\"tiny\">ls</pre>" });
	const button = page.locator(".calmCopy");
	await expect(button).toHaveCount(1);
	await expect(button).toHaveCSS("opacity", "0");
	await page.locator("#code").hover();
	await expect(button).toHaveCSS("opacity", "1");
});

test("@webkit caps a one-line command with a full-height Copy button", async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	// A long single line scrolls under the button, as on Latent Space's Ollama command.
	const line = "OLLAMA_HOST=127.0.0.1:11434 OLLAMA_NO_CLOUD=1 OLLAMA_CONTEXT_LENGTH=65536 ollama serve";
	await loadFixture(page, { paragraphCount: 1, html: `<pre id="one">${line}</pre>` });
	const pre = await page.locator("#one").boundingBox();
	const button = await page.locator(".calmCopy").boundingBox();
	expect(Math.abs(button.y - pre.y)).toBeLessThanOrEqual(1);
	expect(Math.abs(button.height - pre.height)).toBeLessThanOrEqual(1);
	expect(Math.abs(button.x + button.width - (pre.x + pre.width))).toBeLessThanOrEqual(1);
});

test("@webkit keeps an unsized video inside its box, clear of the next paragraph", async ({ page }) => {
	// NetNewsWire's main.js wraps an iframe with no height in .iframeWrap and pins it
	// to the box, as on Latent Space's beehiiv YouTube embeds.
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 800 });
		await loadFixture(page, {
			paragraphCount: 1,
			html: `<div class="video-embed"><div class="iframeWrap" id="wrap"><iframe id="video" src="about:blank"></iframe></div></div><p id="next">AI News for 11/25.</p>`,
		});
		const wrap = await page.locator("#wrap").boundingBox();
		const video = await page.locator("#video").boundingBox();
		const next = await page.locator("#next").boundingBox();
		expect(Math.abs(video.y - wrap.y)).toBeLessThanOrEqual(1);
		expect(video.y + video.height).toBeLessThanOrEqual(next.y);
	}
});

test("@webkit opens a picture shown smaller than its size, and closes it with Escape", async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await loadFixture(page, {
		paragraphCount: 1,
		html: `<figure><img id="big" alt="Blocks"><figcaption>Warm blocks</figcaption></figure><a href="https://example.com"><img id="linked" alt=""></a><img id="small" alt="">`,
	});
	// A bitmap, since WebKit reports an SVG's natural width as its shown width.
	await page.evaluate(async () => {
		const bitmap = (width, height) => {
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			canvas.getContext("2d").fillRect(0, 0, width, height);
			return canvas.toDataURL("image/png");
		};
		const big = bitmap(2400, 1200);
		for (const [id, src] of [["big", big], ["linked", big], ["small", bitmap(300, 150)]]) {
			const image = document.getElementById(id);
			image.src = src;
			await image.decode();
		}
	});
	await page.locator("#linked").hover();
	await expect(page.locator("#linked")).not.toHaveClass(/isZoomable/);
	await page.locator("#small").hover();
	await expect(page.locator("#small")).not.toHaveClass(/isZoomable/);
	await page.locator("#big").hover();
	await expect(page.locator("#big")).toHaveClass(/isZoomable/);
	await page.locator("#big").click();
	await expect(page.locator(".calmViewer")).toBeVisible();
	await expect(page.locator(".calmViewerCaption")).toHaveText("Warm blocks");
	await page.keyboard.press("Escape");
	await expect(page.locator(".calmViewer")).toHaveCount(0);
});

test("@webkit keeps a malformed footnote link and an emoji story's screenshot from breaking the page", async ({ page }) => {
	await page.setViewportSize({ width: 1180, height: 800 });
	await loadFixture(page, {
		paragraphCount: 36,
		html: `<p>x<sup><a href="#fn-%">1</a></sup></p><p data-test="blank">&nbsp;</p>
			<p><img id="shot" alt="" width="1200" height="800" src="${svg(1200, 800)}#/new-emoji.png"></p>`,
	});
	await expect(page.locator('[data-test="blank"]')).toBeHidden();
	await expect(page.locator(".readerToc button")).toHaveCount(5);
	const height = await page.locator("#shot").evaluate((node) => node.getBoundingClientRect().height);
	expect(height).toBeGreaterThan(200);
});

test("@webkit closes the gaps MacRumors leaves between deal buttons", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	// MacRumors' markup as it arrives: each button block opens inside a <p>, which the
	// parser closes, so the break runs land between the blocks.
	const button = (label) => `<div class="center-wrap"><a href="https://example.com/${label}"><div class="fancybutton"><div class="fancybadge">${label}</div>A deal</div></a></div>`;
	await loadFixture(page, {
		paragraphCount: 0,
		html: `<p>${paragraph}<br><br/></p><p><br/><br>${button("A")}<br><br/><br>${button("B")}<br><br/><br>${button("C")}<br><br/></p><p><br/><br>After the deals.<br>Second line.</p>`,
	});
	const gaps = await page.evaluate(() => {
		const boxes = [...document.querySelectorAll(".center-wrap")].map((node) => node.getBoundingClientRect());
		return boxes.slice(1).map((box, index) => box.top - boxes[index].bottom);
	});
	for (const gap of gaps) {
		expect(gap).toBeLessThan(12);
	}
	await expect(page.locator("p", { hasText: "After the deals." }).locator("br")).toHaveCount(1);
});

test("@webkit hides the lead picture when the body has the same file without its size suffix", async ({ page }) => {
	await page.setViewportSize({ width: 1180, height: 800 });
	// Latent Space's Linear episode: the lead is the 1400x1400 rendition, the body the original.
	const page73 = (lead, inBody) => `<html dir="auto">
		<head><style>${stylesheet}</style></head>
		<body>
			<header class="articleHeader" id="readerTop"><div class="articleTitle"><h1><a href="#">${articleTitle}</a></h1></div></header>
			<article>
				<div class="nnw-primary-media"><div class="nnw-primary-image"><img id="lead" src="https://media.example.com/uploads/asset/file/aaa/${lead}?t=1" alt=""></div></div>
				<div id="bodyContainer" class="articleBody mediumText"><div><a href="https://youtu.be/x"><img src="https://media.example.com/cdn-cgi/image/quality=80/uploads/asset/file/bbb/${inBody}?t=2" alt=""></a></div><p>${paragraph}</p></div>
			</article>
			<script>${themeScript}</script>
		</body>
		</html>`;
	await page.setContent(page73("v2-thumbnail-cristina-1400x1400.png", "v2-thumbnail-cristina.png"));
	await expect(page.locator(".nnw-primary-media")).toHaveAttribute("hidden", "");

	await page.setContent(page73("thumb-a.png", "thumb.png"));
	await expect(page.locator(".nnw-primary-media")).not.toHaveAttribute("hidden", "");
});

test("@webkit names a code block's declared language beside the Copy button", async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await loadFixture(page, {
		paragraphCount: 1,
		html: `<pre id="swift" class="language-swift"><code>let a = 1\nlet b = 2</code></pre>
			<div class="highlight highlight-source-js"><pre id="js">const a = 1;\nconst b = 2;</pre></div>
			<pre id="data" data-lang="Python"><code>a = 1\nb = 2</code></pre>
			<pre id="plain"><code class="language-plaintext">a\nb</code></pre>
			<pre id="none"><code>a\nb</code></pre>`,
	});
	const label = (id) => page.locator(`#${id}`).locator("xpath=..").locator(".calmCodeLanguage");
	await expect(label("swift")).toHaveText("Swift");
	await expect(label("js")).toHaveText("JavaScript");
	await expect(label("data")).toHaveText("Python");
	await expect(label("plain")).toHaveCount(0);
	await expect(label("none")).toHaveCount(0);
	const copy = page.locator("#swift").locator("xpath=..").locator(".calmCopy");
	await expect(copy).toHaveCount(1);
	await page.locator("#swift").hover();
	const sizes = await Promise.all([label("swift"), copy].map((node) => node.evaluate((el) => getComputedStyle(el).fontSize)));
	expect(sizes[0]).toBe(sizes[1]);
	await expect(label("swift")).toHaveCSS("color", "rgb(112, 107, 100)");
});

test("@webkit hides WordPress's 'appeared first on' line and keeps the article's own last paragraph", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await loadFixture(page, {
		paragraphCount: 0,
		html: `<p id="early">The post <a href="https://example.com/a">A</a> appeared first on <a href="https://example.com">Example</a> is a quoted phrase here.</p><p>${paragraph}</p>
			<p id="credit">The post <a href="https://example.com/p">A Field Guide to Quiet Reading</a> appeared first on <a href="https://example.com">Example Site</a>.</p>
			<img width="1" height="1" src="${svg(1, 1)}" alt="">`,
	});
	await expect(page.locator("#credit")).toBeHidden();
	await expect(page.locator("#early")).toBeVisible();
});

test("@webkit opens footnotes whose ids FreshRSS renamed or Feedly removed", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await loadFixture(page, {
		paragraphCount: 0,
		html: `<p>FreshRSS<sup data-sanitized-id="fnref1"><a id="fresh" href="#fn1" data-sanitized-class="footnote-ref">1</a></sup> and Feedly<sup><a id="feedly" href="#fn:2">2</a></sup>.</p>
			<div data-sanitized-class="footnotes"><ol><li data-sanitized-id="fn1"><p>First note. <a href="#fnref1">↩</a></p></li></ol></div>
			<div class="footnotes"><ol><li><p>Second note. <a href="#fnref:2">↩</a></p></li></ol></div>
			<p data-sanitized-id="readerTop">A feed id that must not take the page's own.</p>`,
	});
	await expect(page.locator("#fresh")).toHaveClass(/(^|\s)footnote(\s|$)/);
	await expect(page.locator("#feedly")).toHaveClass(/(^|\s)footnote(\s|$)/);
	const targets = await page.evaluate(() => ({
		fresh: document.getElementById("fn1")?.textContent.trim(),
		feedly: document.getElementById("fn:2")?.textContent.trim(),
		readerTop: document.getElementById("readerTop").tagName,
	}));
	expect(targets).toEqual({ fresh: "First note. ↩", feedly: "Second note. ↩", readerTop: "HEADER" });
});

test("@webkit fits WordPress post embeds and Ghost cards at iPhone width", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await loadFixture(page, {
		paragraphCount: 1,
		html: `<blockquote class="wp-embedded-content" data-secret="abc"><a id="wp-link" href="https://example.com/post/">A post on another WordPress site</a></blockquote><iframe id="wp-frame" class="wp-embedded-content" sandbox="allow-scripts" security="restricted" style="position: absolute; clip: rect(1px, 1px, 1px, 1px);" title="A post" src="about:blank" data-secret="abc" width="600" height="338" frameborder="0" scrolling="no"></iframe>
			<div class="kg-card kg-toggle-card" data-kg-toggle-state="close"><div class="kg-toggle-heading"><h4 class="kg-toggle-heading-text">Is it calm?</h4><button class="kg-toggle-card-icon" id="toggle-icon"><svg viewBox="0 0 24 24"><path d="M23.25,7.311,12.53,18.03a.749.749,0,0,1-1.06,0L.75,7.311"></path></svg></button></div><div class="kg-toggle-content" id="toggle-content"><p>Yes.</p></div></div>
			<div class="kg-card kg-callout-card kg-callout-card-grey" id="callout"><div class="kg-callout-emoji">💡</div><div class="kg-callout-text">A tip.</div></div>
			<figure class="kg-card kg-video-card kg-width-regular" id="video-card"><div class="kg-video-container"><video id="video" src="about:blank" width="1280" height="720" playsinline preload="metadata"></video><div class="kg-video-overlay"><button class="kg-video-large-play-icon" aria-label="Play video"><svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z"></path></svg></button></div><div class="kg-video-player-container" id="video-player"><div class="kg-video-player"><button class="kg-video-play-icon">Play</button><span class="kg-video-current-time">0:00</span><input type="range" class="kg-video-seek-slider" max="100" value="0"></div></div></div></figure>
			<figure class="wp-block-pullquote" id="wp-pull"><blockquote><p>Calm is a reading surface.</p><cite>Someone</cite></blockquote></figure>
			<aside id="aside"><p>A side note.</p></aside>
			<p>${paragraph}</p>`,
	});
	const fits = await page.evaluate(() => ({
		scroll: document.documentElement.scrollWidth,
		width: document.documentElement.clientWidth,
	}));
	expect(fits.scroll).toBeLessThanOrEqual(fits.width);
	await expect(page.locator("#wp-frame")).toBeHidden();
	await expect(page.locator("#wp-link")).toBeVisible();
	await expect(page.locator(".wp-embedded-content").first()).toHaveCSS("border-top-style", "solid");
	await expect(page.locator("#toggle-icon")).toBeHidden();
	await expect(page.locator("#toggle-content")).toBeVisible();
	await expect(page.locator(".kg-toggle-card")).toHaveCSS("border-top-style", "solid");
	await expect(page.locator("#callout")).toHaveCSS("display", "flex");
	await expect(page.locator("#callout")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
	await expect(page.locator("#video-player")).toBeHidden();
	await expect(page.locator(".kg-video-overlay")).toBeHidden();
	const video = await page.locator("#video").boundingBox();
	const card = await page.locator("#video-card").boundingBox();
	expect(video.width).toBeLessThanOrEqual(card.width + 0.5);
	expect(video.width / video.height).toBeCloseTo(16 / 9, 1);
	await expect(page.locator("#wp-pull blockquote")).toHaveCSS("font-style", "normal");
	await expect(page.locator("#wp-pull blockquote")).toHaveCSS("border-left-style", "none");
	await expect(page.locator("#aside")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
});

test("@webkit gives Ghost video cards their thumbnail as the poster instead of a blank spacer", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	// Ghost's web markup: a 1x1 GIF (or spacergif.org) poster, the thumbnail on
	// the card and in the video's inline background.
	const gif = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
	const card = (id, attrs, poster, style = "") =>
		`<figure class="kg-card kg-video-card kg-width-regular" ${attrs}><div class="kg-video-container"><video id="${id}" poster="${poster}" ${style ? `style="${style}"` : ""} width="1280" height="720" playsinline preload="metadata"></video></div></figure>`;
	await loadFixture(page, {
		paragraphCount: 1,
		html: [
			card("thumb", 'data-kg-thumbnail="https://example.com/media/a_thumb.jpg" data-kg-custom-thumbnail=""', gif, "background: transparent url('https://example.com/media/a_thumb.jpg') 50% 50% / cover no-repeat;"),
			card("custom", 'data-kg-thumbnail="https://example.com/media/b_thumb.jpg" data-kg-custom-thumbnail="https://example.com/images/b-custom.jpg"', "https://img.spacergif.org/v1/1280x720/0a/spacer.png"),
			card("style", "", gif, "background: transparent url('https://example.com/media/c_thumb.jpg') 50% 50% / cover no-repeat;"),
			card("real", 'data-kg-thumbnail="https://example.com/media/d_thumb.jpg"', "https://example.com/images/d-poster.jpg"),
			card("none", "", gif),
		].join(""),
	});
	const posters = await page.evaluate(() =>
		Object.fromEntries(["thumb", "custom", "style", "real", "none"].map((id) => [id, document.getElementById(id).getAttribute("poster")])),
	);
	expect(posters).toEqual({
		thumb: "https://example.com/media/a_thumb.jpg",
		custom: "https://example.com/images/b-custom.jpg",
		style: "https://example.com/media/c_thumb.jpg",
		real: "https://example.com/images/d-poster.jpg",
		none: gif,
	});
});

// Performance. Calm does all its work in one pass before the page shows, so the
// checks are: the pass is fast on huge articles and on many copies of each component;
// it doesn't lay the page out once per element; the first frame already has Calm's
// changes; and nothing moves after that first frame. Each check also runs once on a
// deliberately slowed or shifting copy of the script, to prove it can fail.

function perfPage(bodyHtml, script) {
	return `<html dir="auto">
		<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${stylesheet}</style></head>
		<body>
			<nav class="readerToc" aria-label="Article sections" hidden>
				<div class="readerTocTitle">Sections</div>
				<div class="readerTocContext" aria-hidden="true"></div>
				<ol id="readerTocList"></ol>
			</nav>
			<header class="articleHeader" id="readerTop">
				<div class="articleTitle"><h1><a href="#">${articleTitle}</a></h1></div>
				<div class="articleMeta"><span class="feedName"><a href="#">Field Notes</a></span><span class="metaDate"><a href="#">Nov 27, 2026</a></span><span class="readingTime" id="readingTime" hidden></span></div>
				<div class="externalLink" hidden></div>
			</header>
			<article><div id="bodyContainer" class="articleBody mediumText">${bodyHtml}</div></article>
			<script>${script}</script>
		</body>
		</html>`;
}

// Serves the page from a URL so init scripts run first; blocks the network.
async function openPerfPage(page, html) {
	await page.route(/^https?:/, (route) =>
		route.request().url() === "https://calm.test/" ? route.fulfill({ body: html, contentType: "text/html; charset=utf-8" }) : route.abort(),
	);
	await page.goto("https://calm.test/", { waitUntil: "load" });
}

// Wastes `ms` milliseconds at the start of one step, to prove a budget can fail.
const slowed = (script, step, ms) => script.replace(`function ${step}() {`, `function ${step}() { var __until = performance.now() + ${ms}; while (performance.now() < __until) {}`);

async function passTimes(page, bodyHtml, script = themeScript) {
	await page.setViewportSize({ width: 1280, height: 800 });
	await openPerfPage(page, perfPage(bodyHtml, instrumentScript(script)));
	return page.evaluate(() => ({ pass: window.__calmPass, steps: window.__calmSteps }));
}

// Measured on an M-series Mac (Playwright 1.59; WebKit timers have 1 ms resolution),
// 1280 wide so the rail is built too: the stress article's pass took 87-102 ms in
// WebKit and 27-41 ms in Chrome. Most of it is the page's first layout, forced by the
// reading-time count, which the page needs before it shows anyway. Before the Copy
// buttons were batched, the same pass took about 40 ms more. Budget: about 4x.
const STRESS_PASS_BUDGET = 400;

test("@webkit runs Calm's first pass on a huge article within its budget", async ({ page }) => {
	const times = await passTimes(page, stressArticle());
	expect(times.pass).toBeLessThan(STRESS_PASS_BUDGET);
	// The budget would catch a slower pass.
	const slow = await passTimes(page, stressArticle(), slowed(themeScript, "enableCodeCopy", STRESS_PASS_BUDGET));
	expect(slow.pass).toBeGreaterThan(STRESS_PASS_BUDGET);
});

// Each component's own step, on 400 copies of it among 400 paragraphs. Measured
// (ms, four runs each, WebKit / Chrome): code Copy and language 4-10 / 4-4.6;
// footnote repair and marking 1-3 / 1.4-2; break cleanup 4-5 / 15-19; gallery rows
// 1-2 / 0.7-0.9; X theme 0 / 0-0.1; Ghost video posters 1-2 / 2.4-4.7; inline images
// and emoji 1-2 / 0.5-1.2; blank blocks 0-1 / 0.6-0.8; rail markers 4-7 / 3.2-5.4;
// Mastodon frames 0 / 0.2-0.3. Each budget is about 4-5x the slowest run, with a
// 10 ms floor for WebKit's 1 ms timer.
const componentBudgets = {
	code: 40,
	footnotes: 15,
	breaks: 80,
	galleries: 10,
	xEmbeds: 10,
	ghostCards: 20,
	emoji: 10,
	images: 10,
	blanks: 10,
	headings: 30,
	iframes: 10,
};

for (const [name, budget] of Object.entries(componentBudgets)) {
	test(`@webkit keeps the ${name} step within its budget on 400 copies`, async ({ page }) => {
		const { steps } = await passTimes(page, componentArticle(name, 400));
		const own = componentSteps[name].reduce((sum, step) => sum + steps[step], 0);
		expect(own).toBeLessThan(budget);
	});
}

test("@webkit component budgets fail when a step is slowed", async ({ page }) => {
	const { steps } = await passTimes(page, componentArticle("galleries", 50), slowed(themeScript, "layoutGalleries", componentBudgets.galleries + 5));
	expect(steps.layoutGalleries).toBeGreaterThan(componentBudgets.galleries);
});

// Chromium counts layouts. Calm's pass may lay the page out a few times (the
// reading-time count and the rail read sizes), but never once per element.
// Measured: 3 layouts with or without 200 code blocks; before batching, about 200.
test("@webkit doesn't lay the page out once per element", async ({ page, browserName }) => {
	test.skip(browserName !== "chromium", "layout counts come from Chromium's DevTools protocol");
	async function layouts(script) {
		const cdp = await page.context().newCDPSession(page);
		await cdp.send("Performance.enable");
		await openPerfPage(page, perfPage(componentArticle("code", 200) + componentArticle("footnotes", 100) + componentArticle("breaks", 100), script));
		const { metrics } = await cdp.send("Performance.getMetrics");
		await cdp.detach();
		return metrics.find((metric) => metric.name === "LayoutCount").value;
	}
	await page.setViewportSize({ width: 1280, height: 800 });
	const withCalm = await layouts(themeScript);
	expect(withCalm).toBeLessThan(10);
	// Reading each block's innerText between changes, the old way, lays out per block.
	const thrashing = themeScript.replace("blocks.forEach(function (block) {", "blocks.forEach(function (block) { block.pre.innerText;");
	expect(thrashing).not.toBe(themeScript);
	expect(await layouts(thrashing)).toBeGreaterThan(100);
});

// The first frame the reader sees already has Calm's changes. WebKit, NetNewsWire's
// engine, parses an article like this one before it paints. (Chromium paints parts of
// a long page while still parsing, so this check is WebKit's.)
test("@webkit shows the first frame with Calm's changes already made", async ({ page, browserName }) => {
	test.skip(browserName !== "webkit", "Chromium paints long pages before the parser reaches the script");
	await page.setViewportSize({ width: 390, height: 844 });
	await page.addInitScript(() => {
		window.__firstFrame = null;
		requestAnimationFrame(() => {
			window.__firstFrame = { ran: window.__calmPass !== undefined, blankHidden: !!document.querySelector("[data-calm-blank]") };
		});
	});
	const body = Array.from({ length: 300 }, (_, i) => `<p>${paragraph}</p>${i % 10 ? "" : '<p>&nbsp;</p><pre><code class="language-js">a\nb</code></pre>'}`).join("");
	await openPerfPage(page, perfPage(body, instrumentScript(themeScript)));
	await page.waitForFunction(() => window.__firstFrame);
	expect(await page.evaluate(() => window.__firstFrame)).toEqual({ ran: true, blankHidden: true });
	// A version that does its work on a timer would be caught.
	await page.unroute(/^https?:/);
	await openPerfPage(page, perfPage(body, `setTimeout(function () { ${instrumentScript(themeScript)} }, 200);`));
	await page.waitForFunction(() => window.__firstFrame);
	expect((await page.evaluate(() => window.__firstFrame)).ran).toBe(false);
});

// Nothing moves after the first frame: every block of the article sits where it was
// first drawn. The page stays hidden until Calm's script has run, the way WebKit
// first paints after it, so this measures only what happens after the first frame.
// Images carry width and height, as the feed's do when it gives them.
async function blocksMoveAfterFirstFrame(page, bodyHtml, script, width) {
	await page.setViewportSize({ width, height: 844 });
	const reveal = `${script}\n;document.documentElement.style.visibility = "";`;
	const html = perfPage(bodyHtml, reveal).replace("<html dir=\"auto\">", '<html dir="auto" style="visibility: hidden">');
	await page.addInitScript(() => {
		const snapshot = () =>
			Array.from(document.querySelectorAll("#bodyContainer > *, #readerTop, #readerTop *"), (node) => {
				const rect = node.getBoundingClientRect();
				return [Math.round(rect.top + scrollY), Math.round(rect.left), Math.round(rect.height)];
			});
		const wait = () => {
			if (document.documentElement.style.visibility === "hidden" || !document.getElementById("bodyContainer")) {
				requestAnimationFrame(wait);
				return;
			}
			window.__first = snapshot();
			addEventListener("load", () => setTimeout(() => requestAnimationFrame(() => (window.__settled = snapshot())), 600));
			if (document.readyState === "complete") setTimeout(() => requestAnimationFrame(() => (window.__settled = snapshot())), 600);
		};
		requestAnimationFrame(wait);
	});
	await openPerfPage(page, html);
	await page.waitForFunction(() => window.__settled, null, { timeout: 10000 });
	return page.evaluate(() => window.__first.filter((rect, index) => JSON.stringify(rect) !== JSON.stringify(window.__settled[index])).length);
}

const shiftComponents = ["paragraphs", "images", "code", "footnotes", "tables", "breaks", "lists", "galleries", "linkCards", "xEmbeds", "iframes", "videos", "wpEmbeds", "ghostCards", "pullquotes", "headings", "emoji", "blanks"];
for (const width of [390, 1280]) {
	test(`@webkit moves nothing after the first frame at ${width} wide, for every component`, async ({ page }) => {
		const body = shiftComponents.map((name) => componentArticle(name, 6)).join("");
		expect(await blocksMoveAfterFirstFrame(page, body, themeScript, width)).toBe(0);
	});
}

test("@webkit the first-frame check catches a late change", async ({ page }) => {
	const late = `${themeScript}\n;setTimeout(function () { var p = document.createElement("p"); p.textContent = "Late"; document.getElementById("bodyContainer").prepend(p); }, 50);`;
	expect(await blocksMoveAfterFirstFrame(page, componentArticle("paragraphs", 20), late, 390)).toBeGreaterThan(0);
});

// Hovering a code block, pressing Copy and opening a footnote change only the tools
// and the popover, which float above the text: nothing around them moves. Measured
// (WebKit): hover to visible tools and click to "Copied" well under one frame plus
// the 120 ms fade; the budget is the fade plus 200 ms.
test("@webkit hover tools, Copy and footnote popovers leave the text where it is", async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.context().grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
	await loadFixture(page, {
		paragraphCount: 6,
		html: `<pre id="code"><code class="language-swift">let a = 1\nlet b = 2</code></pre><p id="after-code">${paragraph}</p>
			<p id="fn-paragraph">${paragraph}<sup id="fnref:1"><a href="#fn:1" class="footnote" rel="footnote">1</a></sup> ${paragraph}</p><p id="after-note">${paragraph}</p>
			<div class="footnotes"><ol><li id="fn:1"><p>The note. <a href="#fnref:1" class="reversefootnote">↩</a></p></li></ol></div>`,
	});
	await page.addStyleTag({ content: newsfootCore });
	const positions = () =>
		page.evaluate(() => Array.from(document.querySelectorAll("#bodyContainer p, #code"), (node) => JSON.stringify(node.getBoundingClientRect())));
	const before = await positions();

	const started = Date.now();
	await page.locator("#code").hover();
	await expect(page.locator(".calmCopy")).toHaveCSS("opacity", "1");
	await page.locator(".calmCopy").click();
	await expect(page.locator(".calmCopy")).toHaveText(/Copy|Copied/);
	expect(Date.now() - started).toBeLessThan(120 + 200 + 400); // fade + budget + Playwright's own steps
	expect(await positions()).toEqual(before);

	// The popover the way newsfoot.js builds it, inside the reference's <sup>.
	await page.evaluate(() => {
		const link = document.querySelector("a.footnote");
		const container = document.createElement("div");
		container.className = "newsfoot-footnote-container";
		link.parentElement.insertBefore(container, link);
		container.appendChild(link);
		const popover = document.createElement("div");
		popover.className = "newsfoot-footnote-popover";
		popover.innerHTML = '<div class="newsfoot-footnote-popover-inner"><p>The note.</p></div><div class="newsfoot-footnote-popover-arrow"></div>';
		container.insertBefore(popover, link);
	});
	await expect(page.locator(".newsfoot-footnote-popover-inner")).toBeVisible();
	const withPopover = await positions();
	// Only the popover's own paragraph is new; every other block stays put.
	expect(withPopover.filter((rect) => !before.includes(rect))).toHaveLength(1);
	await page.evaluate(() => document.querySelector(".newsfoot-footnote-popover").remove());
	expect((await positions()).filter((rect) => !before.includes(rect))).toHaveLength(0);
});
