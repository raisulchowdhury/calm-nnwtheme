# Calm 1.5.0 claims audit (2026-11-28)

Every user-facing claim in the 1.5.0 section of `CHANGELOG.md`, in
`docs/releases/2026-11-30-calm-1.5.0.md` and in the 27 gallery entries,
checked against real public feeds. Raisul decides what to reword; nothing here
has been changed in the theme or the notes.

## Reword or cut before Monday

1. **Emoji claim is broader than the evidence.** WordPress emoji
   (`img.wp-smiley`) were never broken: NetNewsWire's `removeWpSmiley` turns
   them into text (Galloway, artiss.blog: identical in 1.4.4 and 1.5.0). No
   Daring Fireball 1em icon exists in the corpus or today's DF feed. What was
   really broken: Mastodon custom emoji (`img.emojione`) dropped onto a line
   of their own with a blank gap in 1.4.4.
   - CHANGELOG: "Emoji and small inline icons stay text size; real pictures
     over 64px are never shrunk." → "Mastodon's custom emoji stay in the
     sentence at text size instead of dropping onto a line of their own."
   - Release notes: "Emoji and small icons in a sentence stay the size of the
     text." → "Mastodon's custom emoji stay in the sentence at text size
     instead of dropping onto a line of their own."
2. **"Toggles open" is not true on real feeds.** Ghost toggle content was
   already visible in 1.4.4 (Coding Horror, Citation Needed); a real WordPress
   `wp-block-details` toggle (make.wordpress.org) stays closed in both.
   - CHANGELOG: "WordPress and Ghost toggles open, callouts get a tint, pull
     quotes sit between hairlines and asides in a tinted box." → "Ghost
     toggles read as a question and its answer, callouts get a tint, pull
     quotes sit between hairlines and asides sit in a tinted box."
   - Release notes: "WordPress and Ghost toggles open, callouts get a tint,
     pull quotes sit between two thin rules and asides sit in a tinted box."
     → "Ghost toggles read as a question and its answer, callouts get a tint,
     pull quotes sit between two thin rules and asides sit in a tinted box."
   - Gallery "WordPress and Ghost cards work": "Embedded posts become link
     cards, toggles open, callouts get a tint, and videos fit." → "A
     WordPress post embed shows as a link card instead of a blank frame,
     Ghost toggles read as a question and its answer, and callouts get a
     tint."
3. **Embed heights: only X frames were wrong.** Bluesky's own embed script
   already sized its cards in 1.4.4 (Nieman Lab: 800 and 359 px in both), and
   a Mastodon frame on Six Colors was 284 px in both. X posts embedded as a
   bare frame were cut to a 201 px video box and now grow to 557 and 443 px.
   - CHANGELOG: "X, Bluesky and Mastodon embeds take their real height." →
     "X posts embedded as a frame take their real height instead of a
     cut-off video box."
   - Release notes: "X, Bluesky and Mastodon posts take their real height,
     not a wide video box." → "X posts embedded as a frame take their real
     height, not a cut-off video box."
4. **"Nothing changes after an article shows" is contradicted by item 3.**
   Calm grows the X frame when X reports its height, after the article has
   shown (`sizeEmbeddedPosts`). This also sits against the AGENTS.md rule
   "No visible swaps after load", so it is Raisul's call whether to keep the
   behaviour or the sentence.
   - CHANGELOG: "Nothing changes after an article shows, and no article
     waits on Calm." → "Calm makes its changes before an article shows,
     except that an embedded X frame grows to its real height once X reports
     it. No article waits on Calm."
5. **Ghost video thumbnail does not happen in Ghost's RSS.** All three real
   Ghost feeds with video cards (404 Media, Ghost Changelog, Citation Needed)
   already send a real `poster`. The blank box only appears in a full-text
   copy of the web page.
   - CHANGELOG: "A Ghost video card shows its thumbnail, and keeps its shape
     while the thumbnail loads." → "A Ghost video card copied from the site's
     web page (as full-text extraction does) shows its thumbnail."
   - Release notes: cut "A Ghost video shows its thumbnail instead of an
     empty box."
6. **Footnote "before" captions describe the wrong behaviour.** In 1.4.4 a
   Pandoc, GitHub or WordPress-block footnote did not do nothing and did not
   jump to the end: the tap opened the article's web page (left the app).
   On Substack, Daring Fireball, Hugo, kramdown, Buttondown and Bear Blog it
   already opened NetNewsWire's popover.
   - Release notes image alt: "before, a superscript that jumps to the end of
     the article" → "before, tapping the number opened the article's web
     page".
   - Gallery `footnote-pandoc` alt: "before, tapping the number does nothing"
     → "before, tapping the number opened the article's web page".
   - Gallery `footnote-minimal` alt: "before, plain superscripts that jump to
     the end of the article" → "before, plain superscripts that opened the
     article's web page when tapped".
   - Gallery `footnote-substack` alt: "before, the number sits on the line at
     full size like a stray digit" → "before, a tinted number that opened the
     note in a popover over the text". Real Substack (Astral Codex Ten) shows
     exactly that in 1.4.4, so this one is a change, not a fix.
7. **Dwarkesh caption.** Gallery `podcast-caption-file-name` alt: "after, just
   the length" → "after, no caption, since the feed gives no length". The
   real Dwarkesh feed has no duration, and the stored picture shows no
   caption.
8. **"Every change has a before and after image"** (release notes) is false:
   Increase Contrast, the grey tint, CJK/Arabic/Hebrew fonts, floats, the
   image viewer and embed heights have none. → "Most changes have a before
   and after image in assets/releases."
9. **Gallery framing.** About half of the 27 entries are design changes on
   markup that worked (headings, quotes, bold colour, paragraph gaps, captions,
   pull quotes, link cards, buttons, code copy). Title "Every fix, before and
   after" → "Every change, before and after"; lede "27 fixes in five groups."
   → "27 changes in five groups." Footer "Feed content shown comes from free
   public feeds." → "Pictures marked with a feed's name come from free public
   feeds; the rest are sample articles with made-up text."

Optional, not wording: the sign-up entry and the Bluesky dark picture use
sample articles, but real ones now exist (Simon Willison's Substack form;
Nieman Lab's Bluesky card). Pictures are in the audit scratchpad.

## How it was checked

`scripts/before-after-page.mjs` `buildPage` (NetNewsWire 7.3.1's `page.html`,
`core.css`, `main.js`, `newsfoot.js`; `processPage` runs on
`DOMContentLoaded` after Calm's inline script, as in the app), theme from
`git archive origin/main` (1.4.4) against the working tree. Playwright WebKit:
390x844 with touch and `isMobile` (coarse pointer, so Mac-only code stays
off; checked with `matchMedia`), 900 px desktop for Mac cases. Taps and
hovers ran in both versions. A tap that started a top-level navigation is
recorded as "opened the web page", which is what NetNewsWire does with a
link it doesn't handle. Measurements are computed styles and boxes, not only
pictures. Real articles: `.corpus/`, `.corpus/platforms/`, plus feeds fetched
on 2026-11-27 (Simon Willison and Gary Marcus Substack, Noahpinion,
Platformer, Daring Fireball, mastodon.social tag feeds, ruanyifeng.com,
staff.hatenablog.com, geektime.co.il). Primary-media "before" checked against
NetNewsWire's `mac-7.3.1` source: it hides a lead image the body repeats only
when folder and file name match, so Latent Space's duplicate is real.

Limits: rendered in Playwright WebKit, not inside NetNewsWire or on an
iPhone. The Feedbin case is simulated by stripping `class` and `style`; that
Feedbin strips them comes from a code comment, not checked. The white flash
was measured by sampling screenshots every 10 to 40 ms.

Results: **Fixed** = broken before, fixed now. **Change** = worked before,
only looks different. **Not reproduced** = no real feed found with the
problem. **Sample only** = only checked on a made-up article.

## Claims

| Claim (where) | Real feed used | Result | Evidence and wording |
|---|---|---|---|
| Footnote opens in the text under its line (CL, RN, gallery) | Six Colors, argumatronic and jaspervdj (Pandoc), sirupsen (GitHub), artiss.blog (WP footnotes block), Citation Needed (Ghost) | Fixed | 1.4.4 tap opened the web page; 1.5.0 opens the note in place, no navigation. |
| Same, on Daring Fireball, Hugo, Jekyll kramdown, Minimal Mistakes, Buttondown, Bear Blog, Substack | DF, posit, bitbash, mnot, minimalmistakes, hillel, bearblog, Astral Codex Ten | Change | 1.4.4 already opened NetNewsWire's popover. Fix alt texts, item 6. |
| Footnotes via FreshRSS (CL, RN, gallery `feed-footnotes`) | none | Sample only | Keep; "before, does nothing" unverified. |
| Note opens under its line when the line ends inside a link (CL) | none | Sample only | Keep. |
| Citation Needed's numbered source citations | Citation Needed | Not claimed | Still open the web page in both; not a regression. |
| Headings step down clearly (all) | Citation Needed, jvns | Change | h2 24.0→26.8 px, h3 22.7→20.7 px. Wording fine. |
| Quotes upright in text colour (all) | Daring Fireball | Change | italic grey → upright text colour. Fine. |
| Bold in quote/caption keeps the block's colour (all) | Astral Codex Ten, Smashing, Coding Horror (quotes); ruder.io, ByteByteGo (captions) | Change | Bold was heading colour (brightest in dark); now block colour. Fine. |
| Paragraph gaps grow with text size; default unchanged (all) | jvns | Change | Default 16 px both; largest size 16→21.2 px. Fine. |
| Increase Contrast stronger text, muted text, rules (CL, RN) | jvns `make` post | Change | Muted 112,107,100→77,72,66 light; 135,133,128→183,181,172 dark. No picture. |
| Grey tint in light mode, dark unchanged (CL, RN) | jvns | Change | Code background cream 247,240,228 → grey 243,242,240; dark identical. No picture. |
| CJK, Arabic, Hebrew serif and line rules (CL, RN) | ruanyifeng (zh), Hatena (ja), Geektime (he) | Change | `lang` set; Songti / Hiragino Mincho / Raanana serif stacks. Arabic not checked on a real feed. |
| Sign-up form becomes one quiet button (all) | Simon Willison and Gary Marcus Substack | Fixed | Unusable email field + button → one "Subscribe" pill to `/subscribe`. Also hides the widget's "Thanks for reading" line. Gallery picture is a sample; a real one exists. |
| Form with a sign-up link beside it is hidden, no second button (CL, gallery) | MacRumors deals posts (2) | Fixed | Mailchimp form hidden, no pill, link kept. |
| Real Substack "Subscribe now" | Noahpinion, One Useful Thing | Change | Sent as a button link, not a form; gets the pill style. |
| Links styled as buttons become a tinted pill (all) | Noahpinion, Squarespace, Minimal Mistakes | Change | Underlined link → 44 px pill. Platformer's Ghost button not measured (case errored). |
| Linked posts as one quiet card (all) | Pragmatic Engineer and First Round (Substack), Citation Needed and 404 Media (Ghost) | Change | Substack cards 251→125 px and 333→150 px, counts gone; Ghost bookmarks quieter, 100→126 px. |
| WordPress post embed becomes a link card (gallery `feed-cards`) | make.wordpress.org | Fixed | 1.4.4: link plus a blank 202 px frame; 1.5.0: card, frame hidden. |
| "appeared first on" / Medium "originally published" hidden at post end (all) | GitHub Blog, Yoast, Netflix TechBlog, Better Programming | Change | Hidden. David Walsh's line stays because it isn't the last block, as the claim says. |
| Untitled posts lose the empty title line (all) | Mastodon (3), micro.blog | Fixed | 34 px empty title line removed. |
| Lead picture shown once, even resized (all) | Latent Space (podcast-1) | Fixed | NetNewsWire 7.3.1 misses it (different upload folders); 1.5.0 shows one. |
| Podcast caption shows length, not file name (all) | Latent Space (2), Dwarkesh | Fixed | "uuid.mp3 · 1:23:31" → "1 hr 24 min"; Dwarkesh file name → caption hidden. Fix the alt, item 7. |
| Plain captions styled as captions (all) | Google Research (Blogger) | Change | Body size and colour → 14.4 px muted. Squarespace already right. |
| Ghost galleries stay rows (all) | First Round, 404 Media, Citation Needed (Ghost); make.wordpress, wordpress.org news (WP) | Change | Stacked full width → rows at one height. Readable before. |
| Toggles open (CL, RN, gallery) | Coding Horror, Citation Needed (Ghost); make.wordpress (WP details) | Not reproduced | Ghost content already showed; WP details closed in both. Item 2. |
| Callouts tinted, pull quotes between hairlines, asides tinted (all) | Ghost Changelog; Lenny's, wp.ru; First Round, MacStories, Jumping Rivers | Change | Fine. |
| Task lists get a checkbox (all) | none found | Sample only | bitbash's checkboxes aren't list items. Keep. |
| KaTeX no longer shows twice (all) | sirupsen, bitbash | Fixed | 9 and 55 formulas showed as MathML and as HTML; now once. |
| Emoji stay text size: WordPress emoji (CL, RN) | Galloway, artiss.blog | Not reproduced | NetNewsWire's `removeWpSmiley` already makes them text. Item 1. |
| Emoji: Mastodon custom emoji | mastodon.social #neocat posts (3) | Fixed | 20 px block on its own line → inline 19 px. |
| Emoji with class and style stripped (Feedbin) | Galloway, Mastodon, stripped | Fixed, simulated | 72 px block → inline. Stripping simulated. |
| Daring Fireball 1em icons | DF corpus, today's DF feed | Not reproduced | None found. |
| Floats at most half column, stack on iPhone (CL, RN) | Galloway (float-2), MacRumors | Change | iPhone: text beside a 160 px picture → stacked; Mac: full-width float → half. "Headings clear them" not measured. |
| Stray breaks, Instagram rows, MacRumors deal gaps (all) | MacRumors (2), Google Research; 404 Media, Nieman Lab | Fixed | MacRumors article 2,038 px shorter; 82 px gaps between deal buttons → 0; Instagram card 241→129 and 284→118 px. |
| Unsized video stays in its box (all) | Latent Space; GitHub Blog, bitbash | Fixed | Latent Space frame hung 32 px below its box over the next line; others overhung without covering text. Sized frames (Lenny's, Coding Horror) unchanged. |
| No white flash in dark mode (CL, RN, gallery) | Latent Space, Lenny's | Fixed | 1.4.4: video box 99 % white for 200 to 330 ms; 1.5.0 black from first paint. WebKit, online. |
| Ghost video shows thumbnail (all) | 404 Media, Ghost Changelog, Citation Needed | Not reproduced | Real Ghost RSS already sends a poster. Item 5. |
| X posts follow dark mode (all) | First Round, 404 Media, GitHub Blog | Fixed | White card → `theme=dark`. |
| X frames embedded directly stay white (known limit) | Latent Space (xembed-2) | As stated | Still light. |
| Page shows outside Bluesky/X card corners in dark (all) | Nieman Lab (Bluesky) | Fixed | White corner tips gone. Gallery Bluesky picture is a sample. |
| X, Bluesky, Mastodon take their real height (CL, RN) | Latent Space (X frames), Nieman Lab (Bluesky), Six Colors (Mastodon) | Fixed for X only | Items 3 and 4. |
| Copy button on hover, Mac (all) | jvns, istio, karpathy, ByteByteGo, sirupsen, Jumping Rivers | Change (new) | Present on hover; off at iPhone size. |
| Language beside Copy (all) | istio Shell, karpathy Python, sirupsen SQL, Jumping Rivers R, Minimal Mistakes CSS/SCSS/HTML | Change (new) | Works on Jekyll (Rouge) and Hugo. |
| One-line command cap (all) | none measured | Sample only | Keep. |
| Line-numbered code is one block, every device (all) | Minimal Mistakes (Rouge) | Fixed | 1.4.4: small code in a large empty nested box; 1.5.0: one block. |
| Click a large picture to enlarge, Mac (CL, RN) | Six Colors | Change (new) | Viewer opens. No picture. |
| Each cleanup step runs on its own (CL) | n/a | Not user-visible | Not checked against feeds. |
| Nothing changes after an article shows (CL) | Latent Space X frames | Contradicted | Item 4. |
| Every change has a before/after image (RN) | n/a | False | Item 8. |
