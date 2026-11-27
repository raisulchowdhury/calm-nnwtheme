# Design pass, 2026-11-27

A visual pass on Calm in Read mode, aiming for precision and restraint. About 20 real articles from `.corpus/` and the `fixtures/*.json` were rendered at 390 and 900 wide, in light and dark. Calm was then judged area by area against the reader apps it competes with.

What to look at:

- **The fixes:** each one has a before/after image in `assets/releases/unreleased/`.
- **Choices for Raisul:** `docs/design-pass-options.html`. It is self-contained, so you can open it on a phone.

## How the scores were made

- **Scale:** scores are out of 10. 9 means it holds up next to the best reader in that area.
- **Benchmarks were recalled, not rendered.** The comparison set is Readwise Reader, Reeder, Matter, Instapaper, Safari Reader and Books, iA Writer, and the `.parity` themes. Of these, only the `.parity` themes were rendered side by side.
- **Who scored:** the critique followed Impeccable's critique rubric. It ran as one delegated context, so it was not a separate panel.
- **Independent review:** a second agent reviewed the commits and images without seeing these scores. Its findings are under "Review".

## Scores

| Area | Before | After | What moved it |
|---|---|---|---|
| Type | 8.0 | 8.0 | |
| Rhythm (headings, spacing) | 7.6 | 7.8 | h3 sits closer to its section than an h2 |
| Colour | 8.2 | 8.3 | task-list boxes no longer amber |
| Images and captions | 7.6 | 7.7 | bold in captions takes the caption colour |
| Code | 7.4 | 8.2 | line-numbered code is one box |
| Quotes | 7.4 | 7.6 | bold speaker names no longer jump to the heading colour |
| Lists and tasks | 8.0 | 8.3 | muted task boxes |
| Tables | 7.8 | 7.8 | no change (see "Left alone") |
| Footnotes | 7.6 | 7.6 | options in the gallery |
| Embeds and cards | 7.0 | 7.3 | video players no longer flash white in dark mode; options for link cards in the gallery |
| Buttons and forms | 7.2 | 7.5 | a hidden sign-up form now leaves one pill to the sign-up page |
| Header and ending | 8.3 | 8.3 | |
| Pictures in dark mode | 7.0 | 7.0 | options in the gallery |
| **Calm overall** | **7.6** | **7.8** | |

## Fixes

Commits on `calm-roadmap-fixes`:

**6355e29: line-numbered code, quiet bold, h3 spacing**
- Line-numbered code: Jekyll's Rouge puts a table inside the `<pre>`. That table now draws as one box at the usual code size, with muted numbers. Images: `assets/releases/unreleased/code-line-numbers.jpg` and `code-line-numbers-dark.jpg`.
- Bold in quotes, asides and captions takes the block's colour. Images: `quote-bold.jpg`, `quote-bold-dark.jpg` and `caption-bold.jpg`.
- An h3 now has 1.75em above it, against 2em for an h2. Verified by a test, with no image.
- The commit also added a table-figures rule, which cc613ff removes (below).

**87dfe33: task-list boxes in the muted text colour.** Raisul asked: "we shouldn't add color here. Should be gray or, whatever the color of the text is, or even lighter than that." `--reader-accent` is gone from the theme. Images: `task-list.jpg` and `task-list-dark.jpg`.

**c46741a: sign-up pill.** When a hidden newsletter form names a sign-up page, Calm puts one `.button` pill before it.
- Supported forms: Mailchimp, Substack widget and frame, Ghost, Kit, Beehiiv, Jetpack and MailPoet.
- No pill when there is no usable address.
- No pill when the publisher already wrote a sign-up link within a sentence or two of the form. The check reads in document order, so it also works on MacRumors' broken markup. Checked on the real MacRumors corpus items: no pill.
- Images: `signup-form-pill.jpg` and `signup-form-pill-dark.jpg`.

**1b63cf9: video players get a black box in dark mode.** Before, a YouTube embed flashed white for a frame on iPhone before the player painted. Now:
- The player frame takes `color-scheme: light`, which makes its canvas transparent, plus a black background in dark mode only. Light mode is unchanged.
- No image: a render loads the real player, so a still can't show the one-frame flash. A WebKit pixel test checks the frame's centre instead.
- After review, a follow-up commit limits the rule to known player hosts (see "Review").

**cc613ff: table-figures rule removed.** NetNewsWire's quirks-mode page already draws table cells with lining figures, so the rule showed nothing. An A/B run (`--runs 9`, run twice) measured its cost on tables x200 at about +4 ms pass and +10 ms load.

**Follow-up commit (after the review)**
- The video rule now matches player hosts only.
- The sign-up link words no longer match "join" alone, or "subscribe" inside "unsubscribe".

## Proposals for Raisul's choice

All are in `docs/design-pass-options.html`. Each area shows the same real crop at 390 wide, light and dark, with current Calm as option 0. Every option is CSS-only and costs no measurable time. The recommended option is listed first.

| Area | Recommended | Score | Others | Why |
|---|---|---|---|---|
| Link cards | Quiet card | 8.3 (now 7.0) | tint with title and source 7.8, one line with no box 7.3 | A linked post extends the article. Title at body weight, two muted lines and a hairline are enough to decide whether to open it. |
| Footnotes | Plain number, soft note | 8.4 (now 7.6) | flat tint 7.9, hairline note 7.6 | Readers know a raised number is a note, so it needs no pill. The opened note keeps its shadow and drops the border and arrow. |
| Block quotes | Upright, text colour | 8.3 (now 7.4) | italic in text colour 7.9, upright muted 7.7 | Muted italic is tiring over a paragraph-long quote; the rule and indent already say "quoted", as in Safari Reader and Instapaper. |
| Heading scale | Clearer steps | 8.3 (now 7.5) | h3 in sans 7.8 | h2 and h3 read as the same level today; readers use size to tell a section from a sub-point. |
| Paragraph spacing at large text | Scales with text | 8.2 (now 7.6) | a full line 7.4 | A reader who enlarges text wants the gaps larger too. Changes every article, so the Linux `@visual` reference must be regenerated first. |
| Pictures in dark mode | Paper backing for line art | 8.2 (now 7.0) | backing and dimmed photos 7.9, dimmed photos only 7.2 | Charts drawn for white paper vanish on a dark page; a soft paper tone behind PNG, GIF and SVG fixes that without touching photos. |
| Buttons | Visible border, full-size target | 8.1 (now 7.2) | tinted pill 7.6 | A button is the one place the publisher asks for a tap; a muted border and 44 px height make it findable and easy to hit. |

## Raisul's picks

Not built yet. Recorded as he makes them on the options page (docs/design-pass-options.html).

| Area | Pick | His words |
|---|---|---|
| Buttons | Proposal B, tinted pill (not the recommended A) | "Like this one" (2026-11-27) |

## Left alone, and why

- **Footnote back-link underline.** It belongs to NetNewsWire's own footnote markup. Changing it needs script after a tap.
- **Hugo `table.lntable` and Pygments `table.highlighttable`.** Their line numbers sit outside the `<pre>`, so they keep two boxes as before. Fixing them would need markup detection beyond this pass.
- **Paragraph spacing.** The Linux-only `@visual` snapshot pins it, and it can't be regenerated without Docker.
- **Broken-image box.** Hiding it after a failed load would be a visible swap after load.
- **A true inline or margin footnote.** It would need the popover moved by script after a tap, and NetNewsWire's footnote script owns that.
- **Table figures.** Removed (cc613ff).

## Review

An independent agent read the five commits and opened the images.

**Acted on**
- *Video rule (verified, real).* Full-screen and autoplay permissions also come with CodePen, Maps, Mastodon and audio embeds. A plain-text frame carrying them turned into black text on black. The rule now matches player hosts only, and a fixture covers that frame as a must-not-trigger case.
- *Sign-up words.* "Join our Discord" or an `/unsubscribe` link inside a form could become the pill's address. The words and path check are now tighter, with a fixture case.

**Accepted as is**
- Two Substack widgets close together each get a pill, matching the publisher's placement.

**Noted, not changed**
- A faint 1 px black line can show under a player whose height rounds short of its box in dark mode. It was seen in a render, not on a device.

## Checks

- `npm test` passes.
- `npx playwright test --trace off`: 142 passed, 2 skipped, and 1 expected `@visual` failure (the Linux snapshot).
- `node scripts/check-platforms.mjs`: no new errors. The `hljs` errors come from articles' own scripts.
- `node scripts/measure-performance.mjs --components --runs 9`: every component is within about 1 ms of the branch before this pass. Tables x200 measured 175 to 176 ms pass and 511 to 516 ms load, against 173 to 175 and 508 to 511 at HEAD.
- `offerSignupPages` costs 1 ms on the buttons page and under 1 ms elsewhere, thanks to a cheap form/iframe check before the full selector.
- The theme is copied into NetNewsWire's `CalmDev.nnwtheme`, with its own Info.plist ("Calm Dev") kept.
