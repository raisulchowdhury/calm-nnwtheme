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

// A small inline image for every IMG placeholder.
export const withImages = (html, svg) => html.replace(/"IMG"/g, `"${svg(1200, 800)}"`);
