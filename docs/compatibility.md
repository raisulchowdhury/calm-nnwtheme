# Compatibility across platforms

Calm reads whatever HTML a feed sends, so each feature has to hold on the markup of every major publishing platform, and must not trigger where it doesn't belong. This table is the current state.

How it's checked:

- **Real markup, locally.** `node scripts/check-platforms.mjs` runs 126 real feed items from 23 platforms (69 sites) (kept in the gitignored `.corpus/platforms/`) through NetNewsWire's page shell at 390 and 900 wide, with the network blocked. It reports script errors, sideways overflow, code labels, footnotes, credit lines, blank blocks and break cleanup per item.
- **Synthetic markup, in the tests.** `tests/platform-fixtures.mjs` holds one small case per platform, modelled on that real markup but with made-up text, plus cases where a feature must not trigger. The `every platform` tests in `tests/theme.spec.mjs` loop over them, one test per feature, and name the platform when a case fails.

**works**: checked on real items and covered by a fixture. **n.a.**: the platform doesn't send this markup. **limit**: a known gap, described below.

| Platform | Code label + Copy | Footnote popover | Credit line hidden | Stray breaks / blank blocks | Cards, embeds, math fit at 390 |
|---|---|---|---|---|---|
| WordPress (blocks, Jetpack, SyntaxHighlighter) | works | works (Jetpack, footnotes block) | works (English, German and 7 more languages; "first appeared on") | works | works (embeds, galleries, tables, pull-quotes) |
| Ghost | works (bare code: Copy, no label) | works | n.a. | works (incl. embed skeletons) | works (gallery, bookmark, toggle, callout, video, embeds) |
| Substack | works | works | n.a. | works | works (link cards, YouTube) |
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

Known limits and why they stay:

- **A feed's own stylesheet or script.** A `<link rel=stylesheet>` or a script inside the article (KaTeX feeds) makes WebKit paint before Calm's script runs. Calm can't run earlier, so such a page may show the feed's layout for a frame. Calm hides KaTeX's duplicate text in CSS, so math is correct from the first frame either way.
- **Hugo line-number tables.** Chroma puts each column's `<pre>` inside a table, and Calm skips `<pre>` in tables so a table of code samples doesn't sprout buttons. Copying from these blocks still works by selection.
- **Quarto bare footnote numbers.** With no link to follow, there is nothing to open.
- **Credit lines followed by more content.** Calm hides a credit only when it is the article's last block, so a sentence in the middle of a post that happens to match is never hidden.
- **Duplicate lead image.** The corpus saves no lead-image URL, so this check is covered by the synthetic tests only.
- **Content that changes after load.** Calm never swaps content after first paint. Two older features still change things later by design: X, Bluesky and Mastodon frames resize when the embed reports its height, and the update line appears after a fetch.
