// Markup the way each publishing platform sends it in its feed, with made-up text.
// Each case is modelled on real feed items (kept locally in .corpus/platforms/, never
// committed) and names the platform it stands for. docs/compatibility.md summarises.
// Tests loop over these: every case says what Calm should do, including when a
// feature must NOT trigger.

const line = "A short sentence that stands in for the article's own words";

// Code blocks: the language label Calm should show ("" for none) and, where line
// numbers are in the markup, the text Copy should take. `blocks` is the number of
// code blocks when more than one.
export const codeCases = [
	{ platform: "Markdown / Prism", html: `<pre><code class="language-swift">let a = 1\nlet b = 2</code></pre>`, language: "Swift" },
	{ platform: "Prism (class on pre)", html: `<pre class="language-sql"><code class="language-sql">select 1;\nselect 2;</code></pre>`, language: "SQL" },
	{ platform: "Prism markup", html: `<pre><code class="language-markup">&lt;p&gt;a&lt;/p&gt;\n&lt;p&gt;b&lt;/p&gt;</code></pre>`, language: "HTML" },
	{ platform: "Jekyll (kramdown + Rouge)", html: `<div class="language-python highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="n">a</span> <span class="o">=</span> <span class="mi">1</span>\nb = 2</code></pre></div></div>`, language: "Python" },
	{ platform: "Jekyll Rouge, plain text", html: `<div class="language-plaintext highlighter-rouge"><div class="highlight"><pre class="highlight"><code>just\ntext</code></pre></div></div>`, language: "" },
	{
		platform: "Jekyll highlight tag with line numbers",
		html: `<figure class="highlight"><pre><code class="language-ruby" data-lang="ruby"><table class="rouge-table"><tbody><tr><td class="gutter gl"><pre class="lineno">1\n2</pre></td><td class="code"><pre>puts 1\nputs 2\n</pre></td></tr></tbody></table></code></pre></figure>`,
		language: "Ruby",
		copies: "puts 1\nputs 2",
	},
	{ platform: "Hugo (Chroma)", html: `<div class="highlight"><pre tabindex="0" class="chroma"><code class="language-yaml" data-lang="yaml"><span class="line"><span class="cl">a: 1\n</span></span><span class="line"><span class="cl">b: 2</span></span></code></pre></div>`, language: "YAML" },
	{ platform: "Hugo, plain text", html: `<div class="highlight"><pre tabindex="0" class="chroma"><code class="language-text" data-lang="text">a\nb</code></pre></div>`, language: "" },
	{ platform: "GitHub", html: `<div class="highlight highlight-source-js"><pre>const a = 1;\nconst b = 2;</pre></div>`, language: "JavaScript" },
	{ platform: "Substack (Shiki)", html: `<div class="highlighted_code_block" data-attrs="{&quot;language&quot;:&quot;bash&quot;}" data-component-name="HighlightedCodeBlockToDOM"><pre class="shiki"><code class="language-bash">ls\npwd</code></pre></div>`, language: "Shell" },
	{ platform: "WordPress code block", html: `<pre class="wp-block-code"><code lang="php" class="language-php">&lt;?php\necho 1;</code></pre>`, language: "PHP" },
	{ platform: "WordPress SyntaxHighlighter", html: `<div class="wp-block-syntaxhighlighter-code "><pre class="brush: xml; gutter: false; title: ; notranslate" title="">&lt;a&gt;\n&lt;/a&gt;</pre></div>`, language: "XML" },
	{ platform: "WordPress SyntaxHighlighter, plain", html: `<div class="wp-block-syntaxhighlighter-code "><pre class="brush: plain; gutter: false; title: ; notranslate" title="">docker run\n--rm</pre></div>`, language: "" },
	{ platform: "Pandoc", html: `<div class="sourceCode" id="cb1"><pre class="sourceCode haskell literate"><code class="sourceCode haskell"><span id="cb1-1"><a href="#cb1-1" aria-hidden="true" tabindex="-1"></a>main = do</span>\n<span id="cb1-2"><a href="#cb1-2" aria-hidden="true" tabindex="-1"></a>  print 1</span></code></pre></div>`, language: "Haskell" },
	{ platform: "Quarto", html: `<div class="sourceCode cell-code" id="cb2"><pre class="sourceCode python code-with-copy"><code class="sourceCode python">a = 1\nb = 2</code></pre></div>`, language: "Python" },
	{ platform: "Blog with bare class (David Walsh)", html: `<pre class="javascript">const a = 1;\nconst b = 2;</pre>`, language: "JavaScript" },
	{ platform: "Medium (lines as <br>)", html: `<pre>package main<br><br>import "fmt"<br>func main() {}</pre>`, language: "" },
	{ platform: "Blogger (prettyprint)", html: `<pre class="prettyprint">a = 1\nb = 2</pre>`, language: "" },
	{ platform: "Buttondown (codehilite)", html: `<div class="codehilite"><pre><span></span><code><span class="o">a</span>\nb</code></pre></div>`, language: "" },
	{ platform: "Bear Blog (Pygments)", html: `<div class="highlight"><pre><span class="n">a</span>\nb</pre></div>`, language: "" },
	{ platform: "Ghost / Write.as (bare)", html: `<pre><code>a = 1\nb = 2</code></pre>`, language: "" },
	{ platform: "Junk: template left in", html: `<pre><code class="language-{{lang}}">a\nb</code></pre>`, language: "" },
	{ platform: "Junk: long data-lang", html: `<pre data-lang="this is a sentence and not a language name"><code>a\nb</code></pre>`, language: "" },
	{ platform: "Not a language: site wrapper lang-en", html: `<div class="lang-en"><pre><code>a\nb</code></pre></div>`, language: "" },
	{ platform: "Not this block's: wrapper with two blocks", html: `<div class="language-python"><pre><code>a\nb</code></pre><pre><code>c\nd</code></pre></div>`, language: "", blocks: 2 },
];

// Footnotes: `marked` lists the reference ids that must open NetNewsWire's popover
// (get class "footnote" and point at a note in the article); `unmarked` must not.
export const footnoteCases = [
	{
		platform: "Jekyll (kramdown)",
		html: `<p>${line}<sup id="fnref:1" role="doc-noteref"><a href="#fn:1" class="footnote" rel="footnote" id="ref">1</a></sup>.</p><div class="footnotes" role="doc-endnotes"><ol><li id="fn:1" role="doc-endnote"><p>A note. <a href="#fnref:1" class="reversefootnote" role="doc-backlink" id="back">↩</a></p></li></ol></div>`,
		marked: ["ref"],
		unmarked: ["back"],
	},
	{
		platform: "Daring Fireball (MultiMarkdown)",
		html: `<p>${line}<sup id="fnr1-2026-11-26"><a href="#fn1-2026-11-26" id="ref">1</a></sup>.</p><div class="footnotes"><hr><ol><li id="fn1-2026-11-26"><p>A note. <a href="#fnr1-2026-11-26" class="footnoteBackLink" id="back">↩︎</a></p></li></ol></div>`,
		marked: ["ref"],
		unmarked: ["back"],
	},
	{
		platform: "WordPress Jetpack (Six Colors)",
		html: `<p>${line}<sup id="fnref-1-x"><a href="https://example.com/post/#fn-1-x" class="jetpack-footnote" id="ref">1</a></sup>.</p><div class="footnotes"><hr><ol><li id="fn-1-x">A note. <a href="https://example.com/post/#fnref-1-x" id="back">↩</a></li></ol></div>`,
		marked: ["ref"],
		unmarked: ["back"],
	},
	{
		platform: "WordPress footnotes block",
		html: `<p>${line}<sup data-fn="0b1c2d3e-aaaa-bbbb-cccc-1234567890ab" class="fn"><a href="#0b1c2d3e-aaaa-bbbb-cccc-1234567890ab" id="0b1c2d3e-aaaa-bbbb-cccc-1234567890ab-link">1</a></sup>.</p><ol class="wp-block-footnotes"><li id="0b1c2d3e-aaaa-bbbb-cccc-1234567890ab">A note. <a href="#0b1c2d3e-aaaa-bbbb-cccc-1234567890ab-link" aria-label="Jump to footnote reference 1" id="back">↩︎</a></li></ol>`,
		marked: ["0b1c2d3e-aaaa-bbbb-cccc-1234567890ab-link"],
		unmarked: ["back"],
	},
	{
		platform: "Ghost (markdown-it)",
		html: `<p>${line}<sup class="footnote-ref"><a href="#fn1" id="fnref1">[1]</a></sup>.</p><hr class="footnotes-sep"><section class="footnotes"><ol class="footnotes-list"><li id="fn1" class="footnote-item"><p>A note. <a href="#fnref1" class="footnote-backref" id="back">↩︎</a></p></li></ol></section>`,
		marked: ["fnref1"],
		unmarked: ["back"],
	},
	{
		platform: "Ghost HTML card (Substack-style ids)",
		html: `<p>${line}<sup id="footnote-anchor-1" class="footnote-anchor"><a href="#footnote-1" id="ref">a</a></sup>.</p><div class="footnotes"><ol><li id="footnote-1"><p>A note. <a href="#footnote-anchor-1" id="back">↩</a></p></li></ol></div>`,
		marked: ["ref"],
		unmarked: ["back"],
	},
	{
		platform: "Hugo (goldmark)",
		html: `<p>${line}<sup id="fnref:1"><a href="#fn:1" class="footnote-ref" role="doc-noteref" id="ref">1</a></sup>.</p><div class="footnotes" role="doc-endnotes"><hr><ol><li id="fn:1"><p>A note. <a href="#fnref:1" class="footnote-backref" role="doc-backlink" id="back">↩︎</a></p></li></ol></div>`,
		marked: ["ref"],
		unmarked: ["back"],
	},
	{
		platform: "Buttondown (Python-Markdown)",
		html: `<p>${line}<sup id="fnref:note"><a class="footnote-ref" href="#fn:note" id="ref">1</a></sup>.</p><div class="footnote"><hr><ol><li id="fn:note"><p>A note. <a class="footnote-backref" href="#fnref:note" id="back">↩</a></p></li></ol></div>`,
		marked: ["ref"],
		unmarked: ["back"],
	},
	{
		platform: "Bear Blog",
		html: `<p>${line}<sup class="footnote-ref" id="fnref-1"><a href="#fn-1" id="ref">1</a></sup>.</p><section class="footnotes"><ol><li id="fn-1"><p>A note. <a href="#fnref-1" class="footnote" id="back">↩</a></p></li></ol></section>`,
		marked: ["ref"],
		unmarked: [],
	},
	{
		platform: "Pandoc (sup inside the link)",
		html: `<p>${line}<a href="#fn1" class="footnote-ref" id="fnref1" role="doc-noteref"><sup>1</sup></a>.</p><section id="footnotes" class="footnotes footnotes-end-of-document" role="doc-endnotes"><hr><ol><li id="fn1"><p>A note. <a href="#fnref1" class="footnote-back" role="doc-backlink" id="back">↩︎</a></p></li></ol></section>`,
		marked: ["fnref1"],
		unmarked: ["back"],
		supWrapsLink: true,
	},
	{
		platform: "GitHub-flavoured Markdown",
		html: `<p>${line}<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p><section data-footnotes="" class="footnotes"><h2 class="sr-only" id="footnote-label">Footnotes</h2><ol><li id="user-content-fn-1"><p>A note. <a href="#user-content-fnref-1" data-footnote-backref="" aria-label="Back to reference 1" id="back">↩</a></p></li></ol></section>`,
		marked: ["user-content-fnref-1"],
		unmarked: ["back"],
	},
	{
		platform: "FreshRSS (ids and classes renamed)",
		html: `<p>${line}<sup data-sanitized-id="fnref1"><a id="fresh" href="#fn1" data-sanitized-class="footnote-ref">1</a></sup>.</p><div data-sanitized-class="footnotes"><ol><li data-sanitized-id="fn1"><p>A note. <a href="#fnref1" id="back">↩</a></p></li></ol></div>`,
		marked: ["fresh"],
		unmarked: ["back"],
	},
	{
		platform: "Not footnotes: a sup link to a section, a WordPress-style sup to a heading",
		html: `<h2 id="fn-section">Section</h2><p>${line}<sup><a href="#section-2" id="to-section">2</a></sup> and <sup data-fn="x"><a href="#fn-section" id="to-heading">3</a></sup> and <a href="#fn-section" id="plain">a link</a>.</p><h2 id="section-2">Two</h2>`,
		marked: [],
		unmarked: ["to-section", "to-heading", "plain"],
	},
];

// Closing credit lines: `hidden` must be hidden, `kept` must stay.
export const creditCases = [
	{ platform: "WordPress", html: `<p id="kept">${line}.</p><p id="hidden">The post <a href="https://example.com/p">A Title</a> appeared first on <a href="https://example.com">Example</a>.</p>`, hidden: ["hidden"], kept: ["kept"] },
	{ platform: "WordPress (German)", html: `<p id="kept">${line}.</p><p id="hidden">Der Beitrag <a href="https://example.com/p">Ein Titel</a> erschien zuerst auf <a href="https://example.com">Beispiel</a>.</p>`, hidden: ["hidden"], kept: ["kept"] },
	{ platform: "WPBeginner", html: `<p id="kept">${line}.</p><p id="hidden">The post <a href="https://example.com/p">A Title</a> first appeared on <a href="https://example.com">Example</a>.</p>`, hidden: ["hidden"], kept: ["kept"] },
	{
		platform: "Medium",
		html: `<p id="kept">${line}.</p><img src="https://medium.com/_/stat?event=post.clientViewed" width="1" height="1" alt=""><hr id="rule"><p id="hidden"><a href="https://example.com/p">A Title</a> was originally published in <a href="https://example.com">A Publication</a> on Medium, where people are continuing the conversation by highlighting and responding to this story.</p>`,
		hidden: ["hidden", "rule"],
		kept: ["kept"],
	},
	{ platform: "OMG! Ubuntu", html: `<p id="kept">${line}.</p><p id="hidden">You’re reading <a href="https://example.com/p">A Title</a>, a blog post from <a href="https://example.com">Example</a>. Do not reproduce elsewhere without permission.</p>`, hidden: ["hidden"], kept: ["kept"] },
	{ platform: "Not a credit: the phrase mid-article", html: `<p id="early">The post <a href="https://example.com/a">A</a> appeared first on <a href="https://example.com">B</a>.</p><p id="kept">${line}.</p>`, hidden: [], kept: ["early", "kept"] },
	{ platform: "Not a credit: one link only", html: `<p id="kept">The post about <a href="https://example.com/a">cats</a> appeared first on our old site, years ago.</p>`, hidden: [], kept: ["kept"] },
	{ platform: "Not a credit: a real ending that mentions Medium", html: `<p id="kept">This essay <a href="https://example.com/a">was originally published</a> in <a href="https://example.com">my newsletter</a> on Medium, and I rewrote it since.</p>`, hidden: [], kept: ["kept"] },
	{ platform: "Not a credit: a normal 'You're reading' line", html: `<p id="kept">You’re reading <a href="https://example.com/a">part two</a> of a series; <a href="https://example.com/1">part one</a> is here.</p>`, hidden: [], kept: ["kept"] },
];

// Line breaks: `removed` counts breaks Calm should drop; the rest must stay.
export const breakCases = [
	{ platform: "MacRumors (breaks around blocks)", html: `<p><br><br><img src="IMG" width="600" height="300" alt=""><br><br></p><p>${line}.</p>`, removed: 4 },
	{ platform: "Blogger (separator divs)", html: `<p>${line}.</p><br><div style="line-height: 40%;"><br></div><h2>Next</h2>`, removed: 2 },
	{ platform: "Tumblr (trailing break)", html: `<p>${line}.<br></p><figure class="tmblr-full"><img src="IMG" width="600" height="300" alt=""></figure>`, removed: 1 },
	{ platform: "Jekyll (spacer paragraph)", html: `<p>${line}.</p><p><br><br><br></p><p>${line}.</p>`, removed: 3 },
	{ platform: "Buttondown (trailing break)", html: `<p>Examples: <br></p><p>${line}.</p>`, removed: 1 },
	{ platform: "Poem lines stay", html: `<p>The first line of a poem<br>The second line of it<br>The third and last</p>`, removed: 0 },
	{ platform: "Address lines stay", html: `<p>Example Company<br>1 Example Street<br>Example City</p>`, removed: 0 },
	{ platform: "Ghost (dialogue in a quote stays)", html: `<blockquote>Ann: a question here.<br><br>Ben: an answer there.<br><br>Ann: thanks.</blockquote>`, removed: 0 },
	{ platform: "Medium (code lines stay)", html: `<pre>line one<br>line two<br>line three</pre>`, removed: 0 },
	{ platform: "Squarespace (paragraph break inside text stays)", html: `<p>${line}. <br><br>${line} again.</p>`, removed: 0 },
];

// Blocks Calm hides as empty (`blank`) and ones it must keep; the block is the one
// carrying data-t.
export const blankCases = [
	{ platform: "Substack / Blogger empty paragraph", html: `<p data-t></p>`, blank: true },
	{ platform: "Buttondown spacer", html: `<p class="empty-line" style="height:16px; margin:0px !important;" data-t></p>`, blank: true },
	{ platform: "Ghost embed loading skeleton", html: `<div style="display: flex;" data-t><div style="border-radius: 50%; height: 40px; width: 40px;"></div></div>`, blank: true },
	{ platform: "Nieman story break", html: `<div class="storybreak-simple" data-t><span></span></div>`, blank: true },
	{ platform: "Keeps: a block with an image", html: `<div data-t><img src="IMG" width="600" height="300" alt=""></div>`, blank: false },
	{ platform: "Keeps: an anchor target", html: `<div id="anchor" data-t></div>`, blank: false },
	{ platform: "Keeps: a drawn box", html: `<div style="border-top: 1px solid" data-t></div>`, blank: false },
	{ platform: "Keeps: a rule", html: `<div data-t><hr></div>`, blank: false },
];

// Whole cards and embeds that must fit the column at iPhone width with nothing
// overflowing. `check` names a CSS expectation where Calm restyles the card.
export const layoutCases = [
	{ platform: "WordPress YouTube embed", html: `<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper"><iframe title="A video" width="500" height="281" src="about:blank" frameborder="0" allowfullscreen></iframe></div></figure>` },
	{ platform: "WordPress post embed", html: `<figure class="wp-block-embed is-type-wp-embed"><div class="wp-block-embed__wrapper"><blockquote class="wp-embedded-content" data-secret="abc"><a href="https://example.org/p/">A post elsewhere</a></blockquote><iframe class="wp-embedded-content" sandbox="allow-scripts" security="restricted" title="A post" src="about:blank" data-secret="abc" width="600" height="338" frameborder="0" scrolling="no"></iframe></div></figure>`, check: { selector: "blockquote.wp-embedded-content", css: ["border-top-style", "solid"] } },
	{ platform: "WordPress gallery", html: `<figure class="wp-block-gallery has-nested-images columns-default is-cropped"><figure class="wp-block-image size-large"><img src="IMG" width="1024" height="768" alt=""></figure><figure class="wp-block-image size-large"><img src="IMG" width="1024" height="768" alt=""></figure></figure>` },
	{ platform: "WordPress Jetpack tiled gallery", html: `<div class="tiled-gallery"><div class="tiled-gallery__gallery"><div class="tiled-gallery__row"><div class="tiled-gallery__col" style="flex-basis:57%"><figure class="tiled-gallery__item"><img src="IMG" width="900" height="600" alt=""></figure></div><div class="tiled-gallery__col" style="flex-basis:43%"><figure class="tiled-gallery__item"><img src="IMG" width="600" height="600" alt=""></figure></div></div></div></div>` },
	{ platform: "WordPress table", html: `<figure class="wp-block-table"><table class="has-fixed-layout"><tbody><tr><td>One</td><td>Two</td><td>Three</td></tr><tr><td>${line}</td><td>${line}</td><td>${line}</td></tr></tbody></table></figure>` },
	{ platform: "WordPress pull-quote", html: `<figure class="wp-block-pullquote"><blockquote><p>${line}.</p><cite>Someone</cite></blockquote></figure>`, check: { selector: ".wp-block-pullquote", css: ["border-top-style", "solid"] } },
	{ platform: "MacStories aside", html: `<aside><p>${line}.</p></aside>`, check: { selector: "aside", notCss: ["background-color", "rgba(0, 0, 0, 0)"] } },
	{ platform: "Ghost gallery", html: `<figure class="kg-card kg-gallery-card kg-width-wide"><div class="kg-gallery-container"><div class="kg-gallery-row"><div class="kg-gallery-image"><img src="IMG" width="1200" height="800" alt=""></div><div class="kg-gallery-image"><img src="IMG" width="800" height="1200" alt=""></div></div></div></figure>` },
	{ platform: "Ghost bookmark card", html: `<figure class="kg-card kg-bookmark-card"><a class="kg-bookmark-container" href="https://example.com/"><div class="kg-bookmark-content"><div class="kg-bookmark-title">A linked page</div><div class="kg-bookmark-description">${line}.</div></div></a></figure>`, check: { selector: ".kg-bookmark-container", css: ["border-top-style", "solid"] } },
	{ platform: "Ghost YouTube embed (tiny size)", html: `<figure class="kg-card kg-embed-card"><iframe width="200" height="113" src="about:blank" frameborder="0" allowfullscreen title="A video"></iframe></figure>` },
	{ platform: "Ghost wide image", html: `<figure class="kg-card kg-image-card kg-width-full kg-card-hascaption"><img src="IMG" class="kg-image" alt="" loading="lazy" width="2000" height="1000"><figcaption><span style="white-space: pre-wrap;">A caption</span></figcaption></figure>` },
	{ platform: "Ghost toggle and callout", html: `<div class="kg-card kg-toggle-card" data-kg-toggle-state="close"><div class="kg-toggle-heading"><h4 class="kg-toggle-heading-text"><span>A question?</span></h4><button class="kg-toggle-card-icon" aria-label="Expand"><svg viewBox="0 0 24 24"><path d="M23.25,7.311,12.53,18.03"></path></svg></button></div><div class="kg-toggle-content"><p>An answer.</p></div></div><div class="kg-card kg-callout-card kg-callout-card-purple"><div class="kg-callout-emoji">💡</div><div class="kg-callout-text">${line}.</div></div>`, check: { selector: ".kg-toggle-card", css: ["border-top-style", "solid"] } },
	{ platform: "Substack link card", html: `<div class="embedded-post-wrap"><a class="embedded-post" native="true" href="https://example.substack.com/p/a"><div class="embedded-post-header"><span class="embedded-post-publication-name">A Newsletter</span></div><div class="embedded-post-title-wrapper"><div class="embedded-post-title">A linked post</div></div><div class="embedded-post-body">${line}.</div><div class="embedded-post-cta-wrapper"><span class="embedded-post-cta">Read more</span></div></a></div>`, check: { selector: ".embedded-post", css: ["border-top-style", "solid"] } },
	{ platform: "Substack YouTube", html: `<div id="youtube2-x" class="youtube-wrap" data-component-name="Youtube2ToDOM"><div class="youtube-inner"><iframe src="about:blank" frameborder="0" loading="lazy" allowfullscreen="true" width="728" height="409"></iframe></div></div>` },
	{ platform: "Blogger image table", html: `<table align="center" cellpadding="0" cellspacing="0" class="tr-caption-container" style="margin-left: auto; margin-right: auto;"><tbody><tr><td style="text-align: center;"><a href="IMG" style="margin-left: auto; margin-right: auto;"><img border="0" data-original-height="900" data-original-width="1600" src="IMG" width="640"></a></td></tr><tr><td class="tr-caption" style="text-align: center;">A caption</td></tr></tbody></table>` },
	{ platform: "Blogger Google Docs picture", html: `<p><span style="vertical-align: baseline; white-space-collapse: preserve;"><span style="border: none; display: inline-block; height: 325px; overflow: hidden; width: 624px;"><img height="325" src="IMG" width="624" alt=""></span></span></p>` },
	{ platform: "Blogger YouTube", html: `<div class="separator" style="clear: both; text-align: center;"><iframe class="BLOG_video_class" allowfullscreen="" frameborder="0" height="360" width="640" src="about:blank"></iframe></div>` },
	{ platform: "Jekyll YouTube (fixed size)", html: `<div style="text-align:center;"><iframe width="420" height="315" src="about:blank" frameborder="0" allowfullscreen=""></iframe></div>` },
	{ platform: "Jekyll KaTeX math", html: `<p>So <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>a</mi><mo>=</mo><mi>b</mi></mrow><annotation encoding="application/x-tex">a = b</annotation></semantics></math></span><span class="katex-html" aria-hidden="true" id="katex-html"><span class="base"><span class="strut" style="height:0.43em;"></span><span class="mord mathnormal">${"a".repeat(400)}</span></span></span></span>.</p><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow>${"<mi>x</mi><mo>+</mo>".repeat(60)}<mi>y</mi></mrow></math></span><span class="katex-html" aria-hidden="true"><span class="base">${"x+".repeat(200)}</span></span></span></span>`, check: { selector: "#katex-html", hidden: true } },
	{ platform: "Hugo padded video wrapper", html: `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden"><iframe src="about:blank" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen title="A video"></iframe></div>` },
	{ platform: "Write.as PeerTube (width in style)", html: `<iframe title="A video" style="width:100%" height="315" src="about:blank" frameborder="0" allowfullscreen=""></iframe>` },
	{ platform: "MacStories video with sources", html: `<video data-autoplay="yes" width="1280" height="720" preload="none" playsinline controls><source src="about:blank" type="video/mp4"></video>` },
	{ platform: "Tumblr photo row", html: `<div class="npf_row"><figure class="tmblr-full" data-orig-height="1000" data-orig-width="1500"><img src="IMG" data-orig-height="1000" data-orig-width="1500" alt=""></figure></div>` },
	{ platform: "Squarespace quote", html: `<figure class="block-animation-none"><blockquote data-animation-role="quote"><span>“</span>${line}.<span>”</span></blockquote><figcaption class="source">— Someone</figcaption></figure>` },
	{ platform: "Beehiiv body and footer", html: `<div class="beehiiv"><div class="beehiiv__body"><p class="paragraph" style="text-align:left;">${line}.<br><br>${line}.</p><div class="image"><img alt="" class="image__image" style="" src="IMG"></div></div><div class="beehiiv__footer"><br class="beehiiv__footer__break"><hr class="beehiiv__footer__line"><a class="beehiiv__footer_link" style="text-align: center;" href="https://example.com/">Powered by a newsletter tool</a></div></div>` },
	{ platform: "X post in a Ghost card", html: `<figure class="kg-card kg-embed-card"><blockquote class="twitter-tweet"><p lang="en" dir="ltr">${line}.</p>&mdash; Someone (@someone) <a href="https://twitter.com/someone/status/1">November 1, 2026</a></blockquote></figure>` },
	{ platform: "Bluesky post (WordPress)", html: `<blockquote class="bluesky-embed" data-bluesky-uri="at://x" data-bluesky-cid="y"><p lang="en">${line}.</p>&mdash; Someone (<a href="https://bsky.app/profile/x">@x</a>)</blockquote>` },
	{ platform: "Wide data table (NetNewsWire wraps tables in .nnw-overflow)", html: `<div class="nnw-overflow"><table><thead><tr>${Array.from({ length: 12 }, (_, i) => `<th>Column ${i}</th>`).join("")}</tr></thead><tbody><tr>${Array.from({ length: 12 }, (_, i) => `<td>value-${i}-without-spaces-in-it</td>`).join("")}</tr></tbody></table></div>` },
];

// Buttons and sign-up forms: `pill` must be drawn as Calm's bordered pill, `hidden`
// must be hidden, `kept` must stay visible and unchanged.
export const buttonCases = [
	{ platform: "Substack button", html: `<p>${line}.</p><p class="button-wrapper" data-attrs="{}" data-component-name="ButtonCreateButton"><a class="button primary" id="b" href="https://example.com/try"><span>Try it free</span></a></p>`, pill: ["b"], hidden: [], kept: [] },
	{ platform: "Substack subscribe button", html: `<p class="button-wrapper" data-attrs="{}" data-component-name="ButtonCreateButton"><a class="button primary" id="b" href="https://example.substack.com/subscribe?"><span>Subscribe now</span></a></p>`, pill: ["b"], hidden: [], kept: [] },
	{ platform: "Substack subscribe widget", html: `<p id="kept">${line}.</p><div class="subscription-widget-wrap-editor" id="w" data-attrs="{}" data-component-name="SubscribeWidgetToDOM"><div class="subscription-widget show-subscribe"><div class="preamble"><p class="cta-caption">Thanks for reading! Subscribe for free.</p></div><form class="subscription-widget-subscribe"><input type="email" class="email-input" name="email" placeholder="Type your email…" tabindex="-1"><input type="submit" class="button primary" value="Subscribe"></form></div></div>`, pill: [], hidden: ["w"], kept: ["kept"] },
	{ platform: "Ghost button card", html: `<div class="kg-card kg-button-card kg-align-left"><a href="https://example.com/episode" class="kg-btn kg-btn-accent" id="b">Episode two, 45:47</a></div>`, pill: ["b"], hidden: [], kept: [] },
	{ platform: "Ghost call-to-action card (inline white text)", html: `<div class="kg-card kg-cta-card kg-cta-bg-grey kg-cta-minimal"><div class="kg-cta-content"><div class="kg-cta-content-inner"><div class="kg-cta-text"><p id="kept">P.S. ${line}.</p></div><a href="https://example.com/signup/" class="kg-cta-button kg-style-accent" id="b" style="color: #FFFFFF;">Subscribe</a></div></div></div>`, pill: ["b"], hidden: [], kept: ["kept"] },
	{ platform: "Ghost sign-up card", html: `<div class="kg-card kg-signup-card" id="w"><h2 class="kg-signup-card-heading">Sign up for the newsletter</h2><form class="kg-signup-card-form" data-members-form="signup"><input class="kg-signup-card-input" type="email" required placeholder="Your email"><button class="kg-signup-card-button" type="submit">Subscribe</button></form></div>`, pill: [], hidden: ["w"], kept: [] },
	{ platform: "Jekyll (Minimal Mistakes)", html: `<p>If you find a bug, <a href="https://example.com/issues/new" class="btn btn--info btn--large" id="b">File an issue</a></p>`, pill: ["b"], hidden: [], kept: [] },
	{ platform: "WordPress buttons block", html: `<div class="wp-block-buttons is-layout-flex"><div class="wp-block-button"><a class="wp-block-button__link wp-element-button" id="b" href="https://example.com/download">Download</a></div></div>`, pill: ["b"], hidden: [], kept: [] },
	{ platform: "Squarespace button", html: `<div class="sqs-block-button-container"><a href="https://example.com/build" class="sqs-block-button-element--medium sqs-button-element--primary sqs-block-button-element" data-sqsp-button id="b">Build a website</a></div>`, pill: ["b"], hidden: [], kept: [] },
	{ platform: "MacRumors (Mailchimp form)", html: `<h3>Deals Newsletter</h3><p id="kept">Interested? <a href="https://eepurl.com/x" id="link">Sign up</a> for the newsletter.</p><div style="text-align:center;margin-bottom:2em;"><form action="https://example.us5.list-manage.com/subscribe/post?u=1&amp;id=2" method="post" id="w" class="validate" target="_blank" novalidate><input type="email" value="" name="EMAIL" class="required email" placeholder="Enter Email Address"><input type="submit" value="Subscribe" name="subscribe" class="button"></form></div>`, pill: [], hidden: ["w"], kept: ["kept", "link"] },
	{ platform: "WordPress Mailchimp embed", html: `<div id="mc_embed_signup"><form action="https://example.us5.list-manage.com/subscribe/post?u=1" method="post" id="w"><label for="e">Email</label><input type="email" id="e" name="EMAIL"><input type="submit" value="Subscribe"></form></div>`, pill: [], hidden: ["mc_embed_signup"], kept: [] },
	{ platform: "Kit (ConvertKit) form", html: `<form action="https://app.example.com/forms/1/subscriptions" class="seva-form formkit-form" method="post" id="w" data-sv-form="1"><input class="formkit-input" name="email_address" placeholder="Email Address" required type="email"><button data-element="submit" class="formkit-submit">Subscribe</button></form>`, pill: [], hidden: ["w"], kept: [] },
	{ platform: "Any email form posting to a newsletter address", html: `<form action="https://example.com/newsletter/join" method="post" id="w"><input type="email" name="email"><button>Join</button></form>`, pill: [], hidden: ["w"], kept: [] },
	{ platform: "Not a sign-up: a search box", html: `<form action="https://example.com/search" id="kept"><input type="search" name="q"><button id="go">Search</button></form>`, pill: [], hidden: [], kept: ["kept", "go"] },
	{ platform: "Not a sign-up: a tutorial's email field", html: `<p>${line}:</p><form action="#" id="kept"><label>Email <input type="email" name="email"></label><button>Send</button></form>`, pill: [], hidden: [], kept: ["kept"] },
	{ platform: "Not a sign-up: a contact form", html: `<form action="https://example.com/contact" method="post" id="kept"><input type="email" name="email"><textarea name="message"></textarea><button>Send</button></form>`, pill: [], hidden: [], kept: ["kept"] },
	{ platform: "Not a button: a plain subscribe link and a demo's own controls", html: `<p id="kept">You can <a href="https://example.com/subscribe" id="link">subscribe here</a>.</p><div><label>SNR <input id="slider" type="range" min="0" max="60"></label> <button id="play">Play</button></div>`, pill: [], hidden: [], kept: ["kept", "link", "slider", "play"] },
];

// Task lists: `tasks` are list items that must lose their bullet and show Calm's box
// on the first line; `plain` items keep their bullet and their own checkbox.
export const taskCases = [
	{ platform: "GitHub-flavoured Markdown", html: `<ul class="contains-task-list"><li class="task-list-item" id="t1"><input type="checkbox" class="task-list-item-checkbox" disabled checked> ${line}, long enough to wrap onto a second line on an iPhone</li><li class="task-list-item" id="t2"><input type="checkbox" class="task-list-item-checkbox" disabled> ${line}</li></ul>`, tasks: ["t1", "t2"], plain: [] },
	{ platform: "Jekyll (kramdown)", html: `<ul class="task-list"><li class="task-list-item" id="t1"><input type="checkbox" class="task-list-item-checkbox" disabled="disabled" checked="checked" />${line}</li></ul>`, tasks: ["t1"], plain: [] },
	{ platform: "GitHub, loose list (box in a paragraph)", html: `<ul class="contains-task-list"><li class="task-list-item" id="t1"><p><input type="checkbox" class="task-list-item-checkbox" disabled> ${line}</p><p>${line}.</p></li></ul>`, tasks: ["t1"], plain: [] },
	{ platform: "Hugo (goldmark)", html: `<ul><li id="t1"><input checked="" disabled="" type="checkbox"> ${line}</li><li id="t2"><input disabled="" type="checkbox"> ${line}</li></ul>`, tasks: ["t1", "t2"], plain: [] },
	{ platform: "Pandoc (box in a label)", html: `<ul class="task-list"><li id="t1"><label><input type="checkbox" checked="" />${line}</label></li><li id="t2"><label><input type="checkbox" />${line}</label></li></ul>`, tasks: ["t1", "t2"], plain: [] },
	{ platform: "Ghost / markdown-it", html: `<ul class="contains-task-list"><li class="task-list-item" id="t1"><input class="task-list-item-checkbox" disabled="" type="checkbox"> ${line}</li></ul>`, tasks: ["t1"], plain: [] },
	{ platform: "Obsidian Publish", html: `<ul class="contains-task-list"><li data-task="x" class="task-list-item is-checked" id="t1"><input data-line="0" type="checkbox" class="task-list-item-checkbox" checked="">${line}</li></ul>`, tasks: ["t1"], plain: [] },
	{ platform: "MkDocs / Python-Markdown (pymdownx)", html: `<ul class="task-list"><li class="task-list-item" id="t1"><label class="task-list-control"><input type="checkbox" disabled checked/><span class="task-list-indicator"></span></label> ${line}</li></ul>`, tasks: ["t1"], plain: [] },
	{ platform: "Not a task: a plain list", html: `<ul><li id="p1">${line}</li><li id="p2">${line}</li></ul>`, tasks: [], plain: ["p1", "p2"] },
	{ platform: "Not a task: a demo's live checkbox mid-item", html: `<ul><li id="p1">Tick <input type="checkbox" id="live"> to hear it, ${line}</li></ul><p><label><input type="checkbox" id="demo" checked> radio bandwidth</label></p>`, tasks: [], plain: ["p1"], untouched: ["live", "demo"] },
];

// Captions sent as plain blocks: `captions` must look like Calm's <figcaption>
// (small, muted, sans, centred, just under the picture); `plain` must stay body text.
export const captionCases = [
	{ platform: "WordPress classic", html: `<div id="attachment_1" style="width: 1034px" class="wp-caption aligncenter"><img src="IMG" width="1024" height="560" alt="" id="img"><p class="wp-caption-text" id="c">A caption.</p></div><p id="p">${line}.</p>`, captions: ["c"], plain: ["p"] },
	{ platform: "WordPress classic (figure, Kinsta)", html: `<figure id="attachment_1" class="wp-caption alignnone"><img src="IMG" width="1024" height="560" alt="" id="img"><figcaption class="wp-caption-text" id="c">A caption.</figcaption></figure>`, captions: ["c"], plain: [] },
	{ platform: "WordPress classic (old dl)", html: `<dl class="wp-caption aligncenter"><dt class="wp-caption-dt"><img src="IMG" width="1024" height="560" alt="" id="img"></dt><dd class="wp-caption-dd" id="c">A caption.</dd></dl>`, captions: ["c"], plain: [] },
	{ platform: "Jekyll (Karpathy's imgcap)", html: `<div class="imgcap"><img src="IMG" alt="" id="img"><div class="thecap" id="c">Examples. <b>From left to right</b>: one, two.</div></div><p id="p">${line}.</p>`, captions: ["c"], plain: ["p"] },
	{ platform: "Blogger image table", html: `<table align="center" cellpadding="0" cellspacing="0" class="tr-caption-container" style="margin-left: auto; margin-right: auto;"><tbody><tr><td style="text-align: center;"><a href="IMG"><img border="0" src="IMG" width="640" height="360" id="img"></a></td></tr><tr><td class="tr-caption" id="c" style="text-align: center;">A caption.</td></tr></tbody></table>`, captions: ["c"], plain: [] },
	{ platform: "MacStories", html: `<div class="media-wrapper"><img decoding="async" src="IMG" alt="" id="img"><p class="image-caption" id="c">A caption.</p></div><p id="p">${line}.</p>`, captions: ["c"], plain: ["p"] },
	{ platform: "Squarespace (paragraph inside figcaption)", html: `<figure><img src="IMG" width="1200" height="800" alt="" id="img"><figcaption class="image-caption-wrapper"><p id="c" data-rte-preserve-empty="true">A caption.</p></figcaption></figure>`, captions: ["c"], plain: [] },
	{ platform: "Not a caption: Ghost voiceover line, a lone imgcap, a caption-ish class", html: `<div class="voiceover-caption" id="p">Listen to me read this post, or <a href="https://example.com/podcast">subscribe</a>.</div><div class="imgcap"><img src="IMG" alt=""></div><p class="caption-note" id="p2">${line}.</p><p class="wp-caption-text" id="p3">${line}, outside any caption box.</p>`, captions: [], plain: ["p", "p2", "p3"] },
];

// Bold inside a quiet block takes the block's colour: `quiet` ids must match their
// block's colour, `loud` ids keep the heading colour (bold in body text, a pull-quote).
export const quietBoldCases = [
	{ platform: "Ghost / any blockquote", html: `<blockquote><p>${line}, <strong id="q">said plainly</strong>.</p></blockquote><p>${line}, <strong id="body">in the text</strong>.</p>`, quiet: ["q"], loud: ["body"] },
	{ platform: "Interview transcript in a quote (speaker names)", html: `<blockquote><p><b id="q">Speaker</b>: ${line}.</p></blockquote>`, quiet: ["q"], loud: [] },
	{ platform: "Aside", html: `<aside><p>${line}, <strong id="q">noted</strong>.</p></aside>`, quiet: ["q"], loud: [] },
	{ platform: "figcaption", html: `<figure><img src="IMG" alt=""><figcaption>${line}. <strong id="q">Left to right</strong>: one, two.</figcaption></figure>`, quiet: ["q"], loud: [] },
	{ platform: "Jekyll (Karpathy's imgcap)", html: `<div class="imgcap"><img src="IMG" alt=""><div class="thecap">Examples. <b id="q">From left to right</b>: one, two.</div></div>`, quiet: ["q"], loud: [] },
	{ platform: "Not quiet: WordPress pull-quote", html: `<figure class="wp-block-pullquote"><blockquote><p>${line}, <strong id="loud">repeated</strong>.</p></blockquote></figure>`, quiet: [], loud: ["loud"] },
];

// Code drawn as a table of line numbers and lines inside the block (Jekyll's Rouge):
// `inner` ids are the nested <pre>s, which must take no box of their own. `sample`
// is a <pre> in an ordinary table cell, which keeps its box.
export const codeTableCases = [
	{ platform: "Jekyll highlight tag with line numbers", html: `<figure class="highlight"><pre id="outer"><code class="language-ruby" data-lang="ruby"><table class="rouge-table"><tbody><tr><td class="gutter gl"><pre class="lineno" id="gutter">1\n2</pre></td><td class="code"><pre id="lines">puts 1\nputs 2\n</pre></td></tr></tbody></table></code></pre></figure>`, inner: ["gutter", "lines"], sample: [] },
	{ platform: "Not line numbers: a table of code samples", html: `<table><tbody><tr><th>Shell</th><th>Python</th></tr><tr><td><pre id="s1">ls\npwd</pre></td><td><pre id="s2">a = 1\nb = 2</pre></td></tr></tbody></table>`, inner: [], sample: ["s1", "s2"] },
];

// Sign-up forms Calm hides: where the form says where to sign up, one pill in its
// place. `pill` is the link and label expected, or null for none; `hidden` is the
// block that must be hidden; `kept` must stay as it was. A case may set the page's
// address with `base`, as NetNewsWire does with <base href>.
export const signupCases = [
	{ platform: "Mailchimp embed (WordPress)", html: `<div id="mc_embed_signup"><form action="https://example.us5.list-manage.com/subscribe/post?u=abc&amp;id=def" method="post"><input type="email" name="EMAIL"><input type="submit" value="Join the list"></form></div>`, pill: { href: "https://example.us5.list-manage.com/subscribe?u=abc&id=def", label: "Join the list" }, hidden: "mc_embed_signup" },
	{ platform: "Substack subscribe widget", base: "https://example.substack.com/p/a-post", html: `<div class="subscription-widget-wrap-editor" id="w" data-component-name="SubscribeWidgetToDOM"><div class="subscription-widget show-subscribe"><form class="subscription-widget-subscribe"><input type="email" name="email"><input type="submit" class="button primary" value="Subscribe"></form></div></div>`, pill: { href: "https://example.substack.com/subscribe", label: "Subscribe" }, hidden: "w" },
	{ platform: "Substack sign-up frame", html: `<iframe src="https://example.substack.com/embed" id="w" width="480" height="320"></iframe>`, pill: { href: "https://example.substack.com/subscribe", label: "Subscribe" }, hidden: "w" },
	{ platform: "Ghost sign-up card", base: "https://blog.example.com/a-post/", html: `<div class="kg-card kg-signup-card" id="w"><h2 class="kg-signup-card-heading">Sign up for the newsletter</h2><form class="kg-signup-card-form" data-members-form="signup"><input type="email" required><button class="kg-signup-card-button" type="submit"><span>Get the letters</span></button></form></div>`, pill: { href: "https://blog.example.com/#/portal/signup", label: "Get the letters" }, hidden: "w" },
	{ platform: "Kit (ConvertKit) form with its landing page linked", html: `<form action="https://app.example.com/forms/1/subscriptions" class="seva-form formkit-form" method="post" id="w"><p>Prefer a page? <a href="https://example.kit.com/newsletter">Subscribe on the web</a></p><input name="email_address" type="email"><button data-element="submit" class="formkit-submit">Sign me up</button><a href="https://kit.com/features/forms" data-element="powered-by">Built with Kit</a></form>`, pill: { href: "https://example.kit.com/newsletter", label: "Sign me up" }, hidden: "w" },
	{ platform: "No usable address: Kit form whose only links are a chat invite and an unsubscribe page", html: `<form action="https://app.example.com/forms/1/subscriptions" class="seva-form formkit-form" method="post" id="w"><input name="email_address" type="email"><button data-element="submit" class="formkit-submit">Subscribe</button><p><a href="https://discord.example.com/invite">Join our Discord</a> or <a href="https://example.com/unsubscribe">unsubscribe</a>.</p></form>`, pill: null, hidden: "w" },
	{ platform: "No usable address: Kit form posting to its API only", html: `<form action="https://app.example.com/forms/1/subscriptions" class="seva-form formkit-form" method="post" id="w"><input name="email_address" type="email"><button data-element="submit" class="formkit-submit">Subscribe</button></form>`, pill: null, hidden: "w" },
	{ platform: "No usable address: Ghost card with no page address", html: `<div class="kg-card kg-signup-card" id="w"><form class="kg-signup-card-form" data-members-form="signup"><input type="email" required><button type="submit">Subscribe</button></form></div>`, pill: null, hidden: "w" },
	{ platform: "Sign-up link before the form, broken feed markup (MacRumors)", html: `<p>Lead.<br><br><div class="no-raptive"><br><br><br><h3>Deals Newsletter</h3><br><br><br>Interested in deals? <a href="https://eepurl.com/x">Sign up</a> for the newsletter and we will keep you posted.<br><br></p><p><br><br><div style="text-align:center;margin-bottom:2em;"><br><br></p><p><br><br><form action="https://example.us5.list-manage.com/subscribe/post?u=1&amp;id=2" method="post" id="w"><input type="email" name="EMAIL"><input type="submit" value="Subscribe"></form><br></p>`, pill: null, hidden: "w" },
	{ platform: "Sign-up link already beside the form (MacRumors)", html: `<h3>Deals Newsletter</h3><p id="kept">Interested? <a href="https://eepurl.com/x">Sign up</a> for the newsletter.</p><div style="text-align:center;margin-bottom:2em;"><form action="https://example.us5.list-manage.com/subscribe/post?u=1&amp;id=2" method="post" id="w"><input type="email" name="EMAIL"><input type="submit" value="Subscribe"></form></div>`, pill: null, hidden: "w", kept: ["kept"] },
	{ platform: "Not a sign-up: a search box and a contact form", html: `<form action="https://example.com/search" id="kept"><input type="search" name="q"><button>Search</button></form><form action="https://example.com/contact" method="post" id="kept2"><input type="email" name="email"><textarea name="message"></textarea><button>Send</button></form>`, pill: null, hidden: null, kept: ["kept", "kept2"] },
];

// A small inline image for every IMG placeholder.
export const withImages = (html, svg) => html.replace(/"IMG"/g, `"${svg(1200, 800)}"`);

// Video players paint black; an embedded page with no colour scheme of its own
// otherwise gets an opaque white canvas in dark mode, a white flash before the
// player draws. player: true means a black box in dark mode and no change in light.
// Players are known by host: full-screen and autoplay permissions also come with
// CodePen, Maps, Mastodon and audio embeds, which may paint no background.
export const videoFrameCases = [
	{ platform: "YouTube embed", html: `<iframe id="f" width="560" height="315" src="https://www.youtube.com/embed/abc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`, player: true },
	{ platform: "YouTube privacy-enhanced, no allow attributes", html: `<iframe id="f" src="https://www.youtube-nocookie.com/embed/abc"></iframe>`, player: true },
	{ platform: "Vimeo player", html: `<iframe id="f" src="https://player.vimeo.com/video/1" width="640" height="360"></iframe>`, player: true },
	{ platform: "Loom embed", html: `<iframe id="f" src="https://www.loom.com/embed/abc" webkitallowfullscreen mozallowfullscreen></iframe>`, player: true },
	{ platform: "Other frame asking for full screen or autoplay, e.g. CodePen, Maps, Spotify (must not trigger)", html: `<iframe id="f" srcdoc="<p>Text with no background</p>" allow="autoplay; fullscreen" allowfullscreen></iframe>`, player: false },
	{ platform: "Unstyled text iframe (must not trigger)", html: `<iframe id="f" srcdoc="<p>Plain text with no background</p>"></iframe>`, player: false },
	{ platform: "Chart embed (must not trigger)", html: `<iframe id="f" src="https://datawrapper.dwcdn.net/abc/1/" scrolling="no" height="400"></iframe>`, player: false },
	// An X or Bluesky post draws its own rounded card, so its frame only needs a clear canvas:
	// card: true means a transparent canvas and no black box.
	{ platform: "X post frame, as X's script or a feed embeds it", html: `<iframe id="f" title="X Post" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" src="https://platform.twitter.com/embed/Tweet.html?dnt=false&id=1&theme=dark"></iframe>`, player: false, card: true },
	{ platform: "Bluesky post frame", html: `<iframe id="f" data-bluesky-id="1" src="https://embed.bsky.app/embed/did:plc:abc/app.bsky.feed.post/3abc?id=1&colorMode=system" width="100%" frameborder="0" scrolling="no"></iframe>`, player: false, card: true },
	{ platform: "X follow button frame (must not trigger)", html: `<iframe id="f" src="https://platform.twitter.com/widgets/follow_button.html?screen_name=someone" scrolling="no" frameborder="0"></iframe>`, player: false },
];

// Pictures of every kind keep the page colour behind them in both modes: a
// paper backing for line art was tried and dropped, since it showed as a light
// box while a PNG loaded and could hide white logos (Raisul, 2026-11-27).
export const lineArtCases = [
	{ platform: "Chart as PNG (any CMS)", html: `<img id="i" src="https://example.com/chart.png" width="600" height="300" alt="">` },
	{ platform: "PNG through an image CDN with a query (Substack, WordPress)", html: `<img id="i" src="https://cdn.example.com/uploads/diagram.PNG?w=1200" width="600" height="300" alt="">` },
	{ platform: "SVG diagram", html: `<img id="i" src="https://example.com/flow.svg" width="600" height="300" alt="">` },
	{ platform: "Inline SVG data", html: `<img id="i" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'/%3E" width="600" height="300" alt="">` },
	{ platform: "Animated GIF", html: `<img id="i" src="https://example.com/demo.gif" width="600" height="300" alt="">` },
	{ platform: "Photo as JPEG", html: `<img id="i" src="https://example.com/photo.jpg" width="600" height="400" alt="">` },
	{ platform: "Photo as WebP", html: `<img id="i" src="https://example.com/photo.webp" width="600" height="400" alt="">` },
	{ platform: "WordPress emoji PNG in the line", html: `<p>Done <img id="i" class="wp-smiley" src="https://s.w.org/images/core/emoji/15.0.3/72x72/1f600.png" alt="😀" style="height: 1em; max-height: 1em;"> today.</p>` },
	{ platform: "Picture with its own dark-mode source", html: `<picture><source media="(prefers-color-scheme: dark)" srcset="https://example.com/diagram-dark.png"><img id="i" src="https://example.com/diagram.png" width="600" height="300" alt=""></picture>` },
	{ platform: "GitHub dark-mode-only image", html: `<img id="i" src="https://example.com/logo-white.png#gh-dark-mode-only" width="600" height="300" alt="">` },
	{ platform: "Ghost link card's site icon", html: `<figure class="kg-card kg-bookmark-card"><a class="kg-bookmark-container" href="https://example.com/b"><div class="kg-bookmark-content"><div class="kg-bookmark-title">A bookmark</div><div class="kg-bookmark-metadata"><img id="i" class="kg-bookmark-icon" src="https://example.com/favicon.png" alt=""><span>Example</span></div></div></a></figure>` },
];
