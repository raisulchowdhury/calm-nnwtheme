// Synthetic articles for Calm's performance checks. All text is made up here;
// the markup follows what real publishing platforms send (see docs/compatibility.md).
// Images are tiny inline SVGs with width and height, so no network is needed and
// their boxes are known before they load.

const words =
	"calm reading surface gives words enough room establish their own rhythm without adding another layer interface quiet margins steady type";
const sentence = (n) => {
	const list = words.split(" ");
	return Array.from({ length: n }, (_, i) => list[(i * 7 + n) % list.length]).join(" ");
};
export const svg = (width, height, fill = "%236e70b8") =>
	`data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22${width}%22 height=%22${height}%22%3E%3Crect width=%22${width}%22 height=%22${height}%22 fill=%22${fill}%22/%3E%3C/svg%3E`;

const p = (i) => `<p>${sentence(18 + (i % 20))}.</p>`;
const languages = ["swift", "python", "js", "bash", "rust", "go", "ruby", "plaintext"];
const codeLines = (n) => Array.from({ length: n }, (_, i) => `let value${i} = compute(${i}) // ${sentence(4)}`).join("\n");

// One instance of each component, by name. `i` varies ids and sizes.
export const components = {
	paragraphs: (i) => p(i),
	images: (i) => `<figure><img src="${svg(800, 450 + (i % 3) * 50)}" width="800" height="${450 + (i % 3) * 50}" alt=""><figcaption>${sentence(6)}</figcaption></figure>`,
	// Prism or Markdown (class on code), Rouge (class on the grandparent), Hugo (data-lang).
	code: (i) => {
		const lang = languages[i % languages.length];
		const body = codeLines(6 + (i % 12));
		if (i % 3 === 0) return `<pre><code class="language-${lang}">${body}</code></pre>`;
		if (i % 3 === 1) return `<div class="language-${lang} highlighter-rouge"><div class="highlight"><pre class="highlight"><code>${body}</code></pre></div></div>`;
		return `<div class="highlight"><pre tabindex="0" class="chroma"><code class="language-${lang}" data-lang="${lang}">${body}</code></pre></div>`;
	},
	footnotes: (i) => `<p>${sentence(12)}<sup id="fnref:${i}" role="doc-noteref"><a href="#fn:${i}" class="footnote" rel="footnote">${i}</a></sup> ${sentence(8)}.</p>`,
	footnoteList: (count) =>
		`<div class="footnotes" role="doc-endnotes"><ol>${Array.from({ length: count }, (_, i) => `<li id="fn:${i}" role="doc-endnote"><p>${sentence(14)}. <a href="#fnref:${i}" class="reversefootnote" role="doc-backlink">↩</a></p></li>`).join("")}</ol></div>`,
	tables: (i) =>
		`<table><thead><tr><th>Name</th><th>Value</th><th>Notes</th><th>More</th></tr></thead><tbody>${Array.from({ length: 30 }, (_, r) => `<tr><td>Row ${r}</td><td>${r * i}</td><td>${sentence(5)}</td><td>${sentence(3)}</td></tr>`).join("")}</tbody></table>`,
	breaks: (i) => `<p><br><br>${sentence(8)}<br>${sentence(7)}<br>${sentence(6)}<br><br></p><p>Line one<br>Line two<br>Line three</p><br><br>`,
	lists: (i) => `<ul><li>${sentence(6)}<ul><li>${sentence(5)}<ol><li>${sentence(4)}</li><li>${sentence(4)}</li></ol></li><li>${sentence(5)}</li></ul></li><li>${sentence(6)}</li></ul>`,
	galleries: (i) =>
		`<figure class="kg-card kg-gallery-card kg-width-wide"><div class="kg-gallery-container"><div class="kg-gallery-row">${[3, 2, 4]
			.map((w) => `<div class="kg-gallery-image"><img src="${svg(w * 100, 200)}" width="${w * 100}" height="200" alt=""></div>`)
			.join("")}</div></div></figure>`,
	linkCards: (i) =>
		i % 2
			? `<figure class="kg-card kg-bookmark-card"><a class="kg-bookmark-container" href="https://example.com/${i}"><div class="kg-bookmark-content"><div class="kg-bookmark-title">${sentence(5)}</div><div class="kg-bookmark-description">${sentence(14)}</div></div></a></figure>`
			: `<div class="embedded-post-wrap"><a class="embedded-post" href="https://example.com/${i}"><div class="embedded-post-header"><span class="embedded-post-publication-name">Example</span></div><div class="embedded-post-title-wrapper"><div class="embedded-post-title">${sentence(5)}</div></div><div class="embedded-post-body">${sentence(16)}</div><div class="embedded-post-cta-wrapper"><span class="embedded-post-cta">Read more</span></div></a></div>`,
	xEmbeds: (i) => `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">${sentence(14)}</p>&mdash; Someone (@someone) <a href="https://twitter.com/someone/status/${1000 + i}">Nov ${1 + (i % 28)}, 2026</a></blockquote>`,
	iframes: (i) => (i % 2 ? `<iframe src="about:blank" width="560" height="315" title="Video ${i}"></iframe>` : `<div class="iframeWrap"><iframe src="about:blank" title="Embed ${i}"></iframe></div>`),
	videos: (i) => `<video src="about:blank" width="1280" height="720" playsinline preload="none"></video>`,
	wpEmbeds: (i) =>
		`<blockquote class="wp-embedded-content" data-secret="s${i}"><a href="https://example.org/${i}/">${sentence(6)}</a></blockquote><iframe class="wp-embedded-content" sandbox="allow-scripts" security="restricted" title="${sentence(4)}" src="about:blank" data-secret="s${i}" width="600" height="338" frameborder="0" scrolling="no"></iframe>`,
	ghostCards: (i) =>
		[
			`<div class="kg-card kg-toggle-card" data-kg-toggle-state="close"><div class="kg-toggle-heading"><h4 class="kg-toggle-heading-text">${sentence(5)}?</h4><button class="kg-toggle-card-icon"><svg viewBox="0 0 24 24"><path d="M23.25,7.311,12.53,18.03"></path></svg></button></div><div class="kg-toggle-content"><p>${sentence(10)}</p></div></div>`,
			`<div class="kg-card kg-callout-card kg-callout-card-grey"><div class="kg-callout-emoji">💡</div><div class="kg-callout-text">${sentence(10)}</div></div>`,
			`<figure class="kg-card kg-video-card kg-width-regular" data-kg-thumbnail="${svg(1280, 720)}"><div class="kg-video-container"><video poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="1280" height="720" playsinline preload="none"></video><div class="kg-video-overlay"><button class="kg-video-large-play-icon">Play</button></div></div></figure>`,
		][i % 3],
	pullquotes: (i) =>
		i % 2
			? `<figure class="wp-block-pullquote"><blockquote><p>${sentence(12)}</p><cite>Someone</cite></blockquote></figure>`
			: `<aside><p>${sentence(14)}</p></aside>`,
	headings: (i) => `<h2>Section ${i}: ${sentence(3)}</h2>`,
	emoji: (i) => `<p>${sentence(8)} <img class="emoji" src="${svg(16, 16, "%23f1b35c")}" alt="🙂" width="16" height="16"> ${sentence(6)}</p>`,
	blanks: (i) => `<p>&nbsp;</p><div></div><p><br></p>`,
	// Substack and Ghost buttons, and a Mailchimp sign-up form Calm hides.
	buttons: (i) =>
		[
			`<p class="button-wrapper" data-attrs="{}" data-component-name="ButtonCreateButton"><a class="button primary" href="https://example.com/${i}"><span>${sentence(3)}</span></a></p>`,
			`<div class="kg-card kg-button-card kg-align-left"><a href="https://example.com/${i}" class="kg-btn kg-btn-accent">${sentence(4)}</a></div>`,
			`<div id="mc_embed_signup"><form action="https://example.us5.list-manage.com/subscribe/post?u=${i}" method="post" class="validate" novalidate><input type="email" name="EMAIL" placeholder="Email"><input type="submit" value="Subscribe" class="button"></form></div>`,
		][i % 3],
	// GitHub, Hugo and Pandoc task lists.
	tasks: (i) =>
		[
			`<ul class="contains-task-list"><li class="task-list-item"><input type="checkbox" class="task-list-item-checkbox" disabled checked> ${sentence(6)}</li><li class="task-list-item"><input type="checkbox" class="task-list-item-checkbox" disabled> ${sentence(9)}</li></ul>`,
			`<ul><li><input checked="" disabled="" type="checkbox"> ${sentence(5)}</li><li><input disabled="" type="checkbox"> ${sentence(7)}</li></ul>`,
			`<ul class="task-list"><li><label><input type="checkbox" checked="">${sentence(6)}</label></li><li><label><input type="checkbox">${sentence(4)}</label></li></ul>`,
		][i % 3],
	// Captions sent as plain blocks: WordPress classic, Jekyll, Blogger.
	captions: (i) =>
		[
			`<div class="wp-caption aligncenter" style="width: 810px"><img src="${svg(800, 450)}" width="800" height="450" alt=""><p class="wp-caption-text">${sentence(7)}</p></div>`,
			`<div class="imgcap"><img src="${svg(800, 400)}" width="800" height="400" alt=""><div class="thecap">${sentence(9)}</div></div>`,
			`<table class="tr-caption-container"><tbody><tr><td><img src="${svg(640, 360)}" width="640" height="360" alt=""></td></tr><tr><td class="tr-caption">${sentence(8)}</td></tr></tbody></table>`,
		][i % 3],
};

// Components whose cost is a separate step in Calm's script, mapped to that step's
// function name, so a test can read the step's own time.
export const componentSteps = {
	code: ["enableCodeCopy"],
	footnotes: ["restoreFootnoteIds", "markFootnotes"],
	breaks: ["removeStrayBreaks"],
	galleries: ["layoutGalleries"],
	xEmbeds: ["matchTweetTheme"],
	ghostCards: ["showVideoThumbnails"],
	emoji: ["markInlineImages"],
	images: ["markInlineImages"],
	blanks: ["hideBlankBlocks"],
	headings: ["syncTocMode"],
	iframes: ["askMastodonForHeights"],
};

// An article of `count` copies of one component, among enough paragraphs to be long.
export function componentArticle(name, count = 200) {
	const parts = [];
	for (let i = 0; i < count; i++) {
		parts.push(p(i));
		parts.push(components[name](i));
	}
	if (name === "footnotes") parts.push(components.footnoteList(count));
	return parts.join("\n");
}

// The whole-article stress test: about 1,500 paragraphs, 150 images, 60 code
// blocks, 100 footnotes, long tables, many <br> runs, nested lists and every card.
export function stressArticle() {
	const parts = [];
	const add = (name, count) => {
		for (let i = 0; i < count; i++) parts.push(components[name](i));
	};
	for (let block = 0; block < 30; block++) {
		parts.push(components.headings(block));
		for (let i = 0; i < 50; i++) parts.push(p(block * 50 + i));
		parts.push(components.images(block), components.images(block + 1), components.images(block + 2), components.images(block + 3), components.images(block + 4));
		parts.push(components.code(block), components.code(block + 1));
		for (let f = 0; f < 3; f++) parts.push(components.footnotes(block * 3 + f));
		parts.push(components.breaks(block), components.lists(block));
		if (block % 3 === 0) parts.push(components.tables(block));
		if (block % 2 === 0) {
			parts.push(components.galleries(block), components.linkCards(block), components.xEmbeds(block), components.iframes(block), components.wpEmbeds(block));
			parts.push(components.ghostCards(block), components.pullquotes(block), components.emoji(block), components.blanks(block));
			parts.push(components.buttons(block), components.tasks(block), components.captions(block));
		}
	}
	add("footnotes", 10);
	parts.push(components.footnoteList(100));
	return parts.join("\n");
}

// Wraps every top-level step of Calm's first script pass in a timer, so a page can
// report each step's share: window.__calmSteps[name] in milliseconds, plus
// window.__calmPass for the whole pass.
export function instrumentScript(script) {
	const timed = script.replace(/^\t(?:safely\((\w+)\)|(\w+)\(\));$/gm, (line, a, b) => `\t__calmStep(${JSON.stringify(a || b)}, function () {${line.trim()}});`);
	if (!/__calmStep\("enableCodeCopy"/.test(timed)) throw new Error("instrumentScript: step calls not found");
	return `window.__calmSteps = {};
function __calmStep(name, run) { var start = performance.now(); run(); window.__calmSteps[name] = (window.__calmSteps[name] || 0) + performance.now() - start; }
window.__calmPassStart = performance.now();
${timed}
window.__calmPass = performance.now() - window.__calmPassStart;`;
}
