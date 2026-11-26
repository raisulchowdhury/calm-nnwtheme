# Calm roadmap

> "The goal is to truly make Calm the world's best NetNewsWire theme, without sacrificing our own identity." (Raisul, 2026-11-26)

**Identity test for every item.** Raisul's words from the forum: Calm is for "long reads I want to enjoy and not rush". It is serif, quiet and soothing, and it stays out of the way on iPhone. A feature that adds chrome, color or noise has to earn its place against that.

**Sources** (researched 2026-11-26):
- Forum threads: [Ringo](https://discourse.netnewswire.com/t/438), [Calm](https://discourse.netnewswire.com/t/509), [7.3 tags](https://discourse.netnewswire.com/t/494), [in-paragraph images](https://discourse.netnewswire.com/t/71), [table gaps](https://discourse.netnewswire.com/t/440), [image gaps](https://discourse.netnewswire.com/t/175), [view menu](https://discourse.netnewswire.com/t/470), [Ember](https://discourse.netnewswire.com/t/339), [YouTube in 7.3](https://discourse.netnewswire.com/t/510).
- Other: NetNewsWire GitHub issues, `Technotes/Themes.md`, and the feature pages of Ringo, Ember, Daisy and Prayer Book.

**Evidence labels:**
- **Checked**: measured on a test page, or read in NetNewsWire's code.
- **Suspected**: inferred from Calm's CSS; open the real feed before fixing.

## 1. Bugs Calm has today

1. **Small inline images blow up.** *Checked.*
   - Calm sets `.articleBody img { display: block; height: auto !important; margin: 2.15em auto }`. NetNewsWire keeps an image's inline `height` (`main.js`, `stripStyles`), but Calm's `!important` overrides it. This undoes the app's fix for Daring Fireball's 1em icons and WordPress emoji images.
   - On a test page, a `style="height:1em"` icon rendered 120×120 on its own line, and a 1em emoji sat alone between paragraphs.
   - Fix: images with a small inline height stay inline at text size. Also match `img.wp-smiley`, `img.emoji` and `src*="/images/core/emoji/"`, because Feedbin strips the style and class.
2. **Floated images crowd the text.** *Checked* (CSS behavior).
   - Images with `align="left"` or `float` keep their full width and have no gap on the text side. A 400px float in the 665px column left a 265px strip of text touching the image, which is the n-tv complaint.
   - Fix: cap floats at half the column, add a gap on the text side, and unfloat them on iPhone.
3. **Faint text fails contrast.** *Checked.* `--reader-faint` measures 2.4:1 in light and 2.6:1 in dark, below the 4.5:1 minimum. Calm uses it for the update line, the "no article selected" message and the dot separators. Fix: raise it to at least 4.5:1, or keep it only on decorative marks.
4. **Posts with no title show no heading.** *Checked in template.*
   - Bluesky and Mastodon posts get an empty `<h1>`, and the date is the only link to the post.
   - Fix: when there's no title, show the post's first words as a quiet, linked lead line. Keep the date link.
5. **No Increase Contrast mode.** *Checked* (no `prefers-contrast` rule). Add `@media (prefers-contrast: more)` with darker muted and faint colors.

## 2. Complaints to check on real feeds

| Case | Why it's suspected | Feed to test |
|---|---|---|
| Footnote popover | Ringo's broke on it; Calm resets popover styles | Six Colors |
| Footnotes inside tables clipped on iPhone | Open app issue [#5449](https://github.com/Ranchero-Software/NetNewsWire/issues/5449), hits most themes | any footnoted table |
| Footnote formats NetNewsWire misses (Substack, Kramdown) | [#3564](https://github.com/Ranchero-Software/NetNewsWire/issues/3564); Ember and Ringo add them in JS | Substack posts |
| X, Bluesky and Mastodon embeds cut off or too wide | Ringo had both bugs; Calm caps blocks at 100% | MacRumors, any Bluesky feed |
| Stray `<br>` between blocks, `<h2>` inside `<p>` | Calm hides empty `p` and `div`, not stray `br` | MacRumors |
| Code inside tables (line-number tables) | [#1459](https://github.com/Ranchero-Software/NetNewsWire/issues/1459) | any blog with numbered code |
| YouTube "Error 153" | The app needs JavaScript on; a "Watch on YouTube" link would help when it fails | c't 3003 |
| 7.3 podcast caption shows a raw filename and size | [Forum, 7.3 tags](https://discourse.netnewswire.com/t/494) | The Talk Show |
| Text size: "some themes ... too small for my middle aged eyes" | Calm follows the Mac setting and Dynamic Type; check the extra-large and largest sizes | any |

## 3. Features that fit Calm

Ordered by value to long reads.

1. **Quiet podcast and media block** for 7.3 enclosures: the title, a native player and the duration, with no filename.
2. **Language-aware text.** Set `lang` and `dir="auto"` so hyphenation and curly quotes work and right-to-left text flows correctly ([#4688](https://github.com/Ranchero-Software/NetNewsWire/issues/4688), [#2148](https://github.com/Ranchero-Software/NetNewsWire/issues/2148)). Add serif fallbacks for Chinese, Japanese, Korean, Arabic and Hebrew, since Iowan has none.
3. **More footnote formats** in a popover, with Calm's existing popover style.
4. **Tap an image to view it large.** A plain dark backdrop and its caption, with no carousel chrome.
5. **Gallery and card layouts** for Ghost and WordPress galleries, bookmark cards and portrait video. These look broken today, so this is about restoring calm.
6. **Quiet callouts.** Note and warning blocks from Ghost, WordPress and GitHub get Calm's left rule, not colored bars.
7. **Code copy button,** shown on hover only. No syntax colors, or at most one muted accent.
8. **Grayscale feed icon** via the `Info.plist` key from 7.3 ([forum](https://discourse.netnewswire.com/t/496)). One line, and it matches the quiet look.
9. **Abbreviation tooltips** (`abbr[title]`): a dotted underline and the native title.

## 4. Deliberately not adopting

- **Rail or contents menu on iPhone.** It clutters the reading view, and no good phone design exists yet (decision, 2026-11-26).
- **Logo badge or update dot.** Calm keeps its one faint update line, checked weekly, only in the 14 days after a release (decision, 2026-11-24).
- **Syntax-colored code, drop caps, accent-colored headings, full-bleed magazine images.** These suit Ember and Ringo, not a soothing long-read page.
- **Relative dates ("3 days ago").** A long read is not a news ticker; keep the calendar date.

## 5. Not fixable by a theme (app-level)

- Switching themes from the article view ([forum](https://discourse.netnewswire.com/t/470)).
- Per-feed themes.
- Cmd +/- zoom.
- Offline image caching.
- YouTube when JavaScript is off.
- The white flash between articles in dark mode (Calm already sets dark backgrounds).
- An accent-color macro ([#5571](https://github.com/Ranchero-Software/NetNewsWire/issues/5571)).

## Competitor features

- **Ringo**: San Francisco font; contrast checked against accessibility rules, with Increase Contrast; full-bleed images; image viewer on Mac; footnote popovers; colored code with a copy button; contents menu; podcast cards; relative dates; callouts; update dot.
- **Ember**: magazine style; drop cap; vermilion accent; full-bleed images; footnotes on many sites; podcast cards; gallery of attached photos.
- **Daisy**: 30+ languages and right-to-left text; titles hidden when the body repeats them; relative datelines; update notices.
- **Prayer Book**: embedded EB Garamond; justified, hyphenated text; drop cap; running head; tested against fixtures from real feeds.
