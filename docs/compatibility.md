# Compatibility across platforms

Calm reads whatever HTML a feed sends, so each feature has to hold on the markup of every major publishing platform, and must not trigger where it doesn't belong. This table is the current state.

How it's checked:

- **Real markup, locally.** `node scripts/check-platforms.mjs` runs 126 real feed items from 23 platforms (69 sites) (kept in the gitignored `.corpus/platforms/`) through NetNewsWire's page shell at 390 and 900 wide, with the network blocked. It reports script errors, sideways overflow, code labels, footnotes, credit lines, blank blocks and break cleanup per item.
- **Synthetic markup, in the tests.** `tests/platform-fixtures.mjs` holds one small case per platform, modelled on that real markup but with made-up text, plus cases where a feature must not trigger. The `every platform` tests in `tests/theme.spec.mjs` loop over them, one test per feature, and name the platform when a case fails.

**works**: checked on real items and covered by a fixture. **n.a.**: the platform doesn't send this markup. **limit**: a known gap, described below.

| Platform | Code label + Copy | Footnote opens in the text | Credit line hidden | Stray breaks / blank blocks | Cards, embeds, math fit at 390 |
|---|---|---|---|---|---|
| WordPress (blocks, Jetpack, SyntaxHighlighter) | works | works (Jetpack, footnotes block) | works (English, German and 7 more languages; "first appeared on") | works | works (embeds, galleries, tables, pull-quotes) |
| Ghost | works (bare code: Copy, no label) | works | n.a. | works (incl. embed skeletons) | works (gallery, bookmark, toggle, callout, video, embeds) |
| Substack | works | works (a bare number with no `<sup>`; Calm raises it) | n.a. | works | works (link cards, YouTube) |
| Medium | Copy, no label (Medium sends none) | n.a. | works (credit and its rule) | works (code lines kept) | works |
| Jekyll (kramdown + Rouge) | works (incl. line-number tables, copies code only) | works | n.a. | works | works (KaTeX); limit: page paints before Calm when the feed embeds a stylesheet |
| Hugo (goldmark + Chroma) | works; limit: `table.lntable` line numbers get no Copy | works | n.a. | works | works |
| Pandoc / Quarto | works | works (Pandoc); limit: Quarto's bare `<sup>1</sup>` has no link | n.a. | works | works |
| GitHub-flavoured Markdown | works | works (`user-content-` ids) | n.a. | works | works |
| Blogger | Copy, no label (prettyprint names none) | n.a. | n.a. | works (separator divs) | works (image tables, Google Docs pictures) |
| Buttondown | Copy, no label | works | n.a. | works (spacers) | works |
| Bear Blog | Copy, no label | works | n.a. | works | works |
| Daring Fireball (MultiMarkdown) | n.a. | works | n.a. | works | works |
| Beehiiv | n.a. | n.a. | n.a. | works | works |
| Tumblr | n.a. | n.a. | n.a. | works | works |
| Squarespace | n.a. | n.a. | n.a. | works (in-text breaks kept) | works |
| Write.as / WriteFreely | Copy, no label | n.a. | n.a. | works | works (PeerTube) |
| David Walsh (bare `pre.javascript`) | works | n.a. | limit: an ad image follows the credit, so it isn't last and stays | works | works |
| OMG! Ubuntu, WPBeginner | n.a. | n.a. | works | works | works |
| Mastodon, Micro.blog | n.a. | n.a. | n.a. | works | works |
| YouTube channel feeds | n.a. | n.a. | n.a. | n.a. | limit: the video is in `media:` tags, not the body; NetNewsWire shows it |

Buttons, sign-up forms, task lists and captions sent as plain blocks (Calm 1.5). `check-platforms.mjs` lists, per item, the links drawn as pills, every form and the ones hidden, task items and restyled captions. The corpus holds no task list, so that column rests on synthetic fixtures only.

| Platform | Button as pill | Sign-up form hidden | Task list | Plain-block caption |
|---|---|---|---|---|
| WordPress | works (buttons block) | works (Mailchimp, Jetpack, MailPoet; any email form posting to a mailing address) | n.a. | works (classic `.wp-caption-text`, old `dd.wp-caption-dd`) |
| Ghost | works (button card, call-to-action card, even with inline white text) | works (sign-up card) | works (markdown-it) | n.a. (sends `<figcaption>`) |
| Substack | works (`.button-wrapper a.button`) | works (subscribe widget) | n.a. | n.a. (sends `<figcaption>`) |
| Jekyll | works (Minimal Mistakes `a.btn`) | works (any form posting to a mailing address) | works (kramdown) | works (`.imgcap .thecap`) |
| Hugo | n.a. | n.a. | works (bare disabled box) | works (paragraph inside `<figcaption>`) |
| Pandoc | n.a. | n.a. | works (box in a label) | n.a. |
| GitHub-flavoured Markdown | n.a. | n.a. | works (tight and loose lists) | n.a. |
| Obsidian Publish, MkDocs | n.a. | n.a. | works | n.a. |
| Blogger | n.a. | n.a. | n.a. | works (`td.tr-caption`) |
| Squarespace | works | n.a. | n.a. | works (paragraph inside `<figcaption>`) |
| MacRumors, MacStories | n.a. | works (Mailchimp form; the sign-up link stays) | n.a. | works (MacStories `.media-wrapper .image-caption`) |
| Kit (ConvertKit), Beehiiv and Substack embeds | n.a. | works (synthetic only) | n.a. | n.a. |
| Buttondown | n.a. | its embed divs arrive empty and are hidden as blank blocks | n.a. | n.a. |

Design pass of 2026-11-27 (CSS only, `quietBoldCases` and `codeTableCases` in `tests/platform-fixtures.mjs`):

- **Line-numbered code** (Jekyll's Rouge `{% highlight linenos %}`, a table inside the code block): one box at the usual code size, numbers in the muted colour. Checked on the corpus's Minimal Mistakes item. Must not trigger: a table of code samples (a `<pre>` in a cell) keeps its boxes. Hugo's `table.lntable` sits outside any `<pre>`, so it is untouched and keeps the limit below.
- **Bold in quiet blocks** (blockquote, aside, figcaption and the plain-block captions): the block's colour, not the heading colour. Every platform; checked on Coding Horror, Citation Needed and the captions fixture. Must not trigger: bold in body text, and pull-quotes, which are drawn in the heading colour.

Sign-up pill (first script pass, `signupCases` in `tests/platform-fixtures.mjs`): a newsletter form stays hidden, and when it says where to sign up Calm puts one `.button` pill before it, labelled with the form's submit text or "Subscribe". Mailchimp `list-manage.com/subscribe/post` becomes the GET `/subscribe` page; a Substack widget or frame links to the publication's `/subscribe`; Ghost, Kit, Beehiiv, Jetpack and MailPoet use an inner sign-up link, and Ghost falls back to the site's `/#/portal/signup`. Checked on the corpus's MacRumors items, where the publisher's own "Sign up" sentence sits just before the form, so no pill is added. Must not trigger: a form with no usable address (Kit with no landing link, Ghost with no site address), a sign-up link already within a sentence or two of the form, and search or contact forms.

Must not trigger, each a fixture: a search box, a tutorial's email field posting nowhere, a contact form with a message field, a plain "subscribe here" link, an interactive demo's sliders, buttons and live checkboxes (as in the corpus's Bitbash post), a plain list, Citation Needed's "Listen to me read this post" line, a `.wp-caption-text` outside a caption box, and any other class that merely contains "caption".

Feed readers: the corpus holds only platform feeds read directly, none passed through a reader service yet. Reader cases covered by synthetic tests: footnotes whose ids FreshRSS renamed or Feedly removed (`fixtures/feed-footnotes.json` and the FreshRSS test in `tests/theme.spec.mjs`) and classes FreshRSS moves into `data-sanitized-class` (Substack's image buttons). Other Feedbin, Feedly and Inoreader markup is untested.

Footnotes in links (Calm 1.5): when the line that holds a footnote number ends inside a link, Calm ends the link at the line's end, opens the note, and carries the link on after it; closing joins the link again exactly. Two numbers on such a line are covered too. Tests: "ends inside a link" and "first of two open notes" in `tests/theme.spec.mjs`.

Known limits and why they stay:

- **A feed's own stylesheet or script.** A `<link rel=stylesheet>` or a script inside the article (KaTeX feeds) makes WebKit paint before Calm's script runs. Calm can't run earlier, so such a page may show the feed's layout for a frame. Calm hides KaTeX's duplicate text in CSS, so math is correct from the first frame either way.
- **Hugo line-number tables.** Chroma puts each column's `<pre>` inside a table, and Calm skips `<pre>` in tables so a table of code samples doesn't sprout buttons. Copying from these blocks still works by selection.
- **Quarto bare footnote numbers.** With no link to follow, there is nothing to open.
- **Credit lines followed by more content.** Calm hides a credit only when it is the article's last block, so a sentence in the middle of a post that happens to match is never hidden.
- **Duplicate lead image.** The corpus saves no lead-image URL, so this check is covered by the synthetic tests only.
- **Classes FreshRSS renames.** FreshRSS moves classes into `data-sanitized-class`. The button, caption and task-list rules go by class, so through FreshRSS those stay at the feed's default look (a sign-up form is still hidden when it has an email field and posts to a mailing address). Calm covers `data-sanitized-class` only for Substack's image buttons so far.
- **Space a hidden form's wrapper leaves.** MacRumors wraps its form in a `div` with its own `margin-bottom: 2em` and break runs, so a little more space than a paragraph gap stays where the form was.
- **Captions cost a little layout.** Captions in Calm's sans face take about 3 ms more of the first pass on 200 captions (WebKit, `measure-performance.mjs`), the same cost a `<figcaption>` has. A real article holds a handful.
- **Content that changes after load.** Calm never swaps content after first paint. Two older features still change things later by design: X, Bluesky and Mastodon frames resize when the embed reports its height, and the update line appears after a fetch.
