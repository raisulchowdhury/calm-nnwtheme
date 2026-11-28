# Changelog

## 1.5.0 - 2026-11-28

Footnotes

- A footnote is a plain small number. Tapping it opens the note in the text
  under that line and moves the text below down; another tap, or Escape on a
  Mac, closes it. The note opens under its line even when the line ends
  inside a link.
- Footnotes from Substack, Ghost, WordPress, Jekyll, Hugo, Pandoc, GitHub
  Markdown and Daring Fireball open this way, as do feeds read through
  FreshRSS.

Reading

- Headings step down clearly: a larger h2 over a smaller h3, and an h3 sits
  closer to its section.
- Block quotes are upright in the text colour, set off by their rule.
- Bold words in a quote, aside or caption keep the block's colour.
- On the Mac, the gap between paragraphs grows with the text size setting. The default
  size is unchanged.
- Increase Contrast gets stronger text, muted text and rules in light and
  dark.
- In light mode the tint behind code, buttons, callouts and asides, and the
  thin rules, are grey instead of cream. Dark mode is unchanged.
- Japanese, Chinese, Korean, Arabic and Hebrew articles get a fitting serif
  and line rules.

What feeds send

- An email sign-up form becomes one quiet button to the publisher's sign-up
  page, labelled with the form's own words. A form with no usable address is
  hidden, and a sign-up link already beside the form means no second button.
- Links styled as buttons (Substack, Ghost, WordPress, Jekyll, Squarespace)
  show as one tinted pill.
- Linked posts (Substack, Ghost, WordPress) show as one quiet card.
- WordPress's "appeared first on" line and Medium's "originally published"
  line are hidden when they end the post.
- Untitled posts (Mastodon, Bluesky, micro.blog) lose the empty title line.
- A lead picture that the body repeats shows once, even when the two are
  different sizes of the same file.
- Podcast captions show the length ("1 hr 24 min"), not a file name or byte
  size.
- Captions sent as plain blocks (WordPress classic, Jekyll, Blogger) are
  styled as captions.
- Ghost galleries stay rows of pictures at one height.
- Ghost toggles read as a question and its answer, callouts get a tint,
  pull quotes sit between hairlines and asides sit in a tinted box.
- Task lists get a text-size checkbox in the muted text colour.
- KaTeX math no longer shows twice.
- Mastodon's custom emoji stay in the sentence at text size instead of
  dropping onto a line of their own. Real pictures over 64px are never
  shrunk.
- Floated pictures take at most half the column, headings clear them, and
  they stack on iPhone.
- Stray line breaks at block edges, Instagram's empty placeholder rows and
  the gaps between MacRumors' deal buttons are removed.

Video and embeds

- A video player with no size stays inside its box. In dark mode the box is
  black from the first frame.
- A Ghost video card copied from the site's web page (as full-text
  extraction does) shows its thumbnail.
- X posts drawn by X's script follow dark mode. X frames embedded directly
  stay white, since making them dark needed a reload.
- In dark mode the page shows outside the rounded corners of an X or
  Bluesky post, instead of white tips.

Mac

- Code blocks get a Copy button on hover, with the block's language beside
  it. On a one-line block both sit in a cap at the line's end.
- Line-numbered code from Jekyll's Rouge is one block with muted
  numbers, on every device.
- Clicking a large picture opens it larger. Escape, Space or a click closes
  it and focus returns.

Known limits

- X posts embedded as a plain frame are cut to a video-shaped box. Growing
  them to their real height would move the text after the article shows.

Under the hood

- Each cleanup step runs on its own, so one malformed feed can't stop the
  rest.
- Calm makes its changes before an article shows. The one later change is
  the update line at the end of a long article, at most once a week. No
  article waits on Calm.
  Speed and layout-shift tests guard both.
- Theme version 16.

## 1.4.4 - 2026-11-24

- Empty paragraphs and divs that feeds leave behind, such as an editor's
  blank line or Blogger's separators, no longer add gaps. A block is hidden
  only when it has no text, no media, and nothing a link could point to.
  Blocks drawn with a border or background stay, and a clearing block keeps
  clearing floats without taking space.
- Feed blocks with a fixed width now stay inside the reading measure.
  WordPress's classic image captions (`style="width: 1034px"`) pushed images
  off the edge of an iPhone screen.
- Substack's restack and expand buttons under images are hidden, since they
  only work on Substack.
- In the two weeks after a new Calm release, long articles end with one
  faint line, "Calm 1.4.5 is out. Update", that installs it. Calm reads
  `updates.json` from GitHub at most once a week, only from articles of 250
  words or more, and sends nothing about the article.
- The README now points to Calm's release feed, so you can hear about new
  versions in NetNewsWire.
- Theme version 15.

## 1.4.3 - 2026-11-19

- The reading map now reaches the end of every article. Headings that all
  fit on the article's last screen each get their own stretch of scrolling,
  so each one can become the current section, and the "Bottom" depth marker
  scrolls to the true end instead of stopping about 96px short.
- On iPhone and iPad, article text follows the system text size (Dynamic
  Type), the way NetNewsWire's own theme does. Default sizes are unchanged.
- Theme version 14.

## 1.4.2 - 2026-11-18

- Fixed NetNewsWire footnote popovers, which rendered with every line stacked
  on top of the others because the popover inherited the superscript's zero
  line height and reduced size
  ([#13](https://github.com/raisulchowdhury/calm-nnwtheme/issues/13)). The
  popover and footnote marker now use Calm's light and dark surfaces.
- Added `template7.3.html` so NetNewsWire 7.3 and later place an article's
  primary media above the body and its other enclosures below it, inside the
  reading measure, with quiet captions.
- Shipped the compact paragraph wrapping fix from August under its own version
  number.
- The reading map now watches the whole article, including 7.3 media, so a
  late-loading cover image or enclosure refreshes its markers.
- After you click a section on the reading map, that section is now the one
  marked as current. Before, the map often highlighted and labeled the
  previous section, because the heading landed a fraction of a pixel below
  the marker line.
- Credited Flexoki for the dark palette's base values.
- Bumped the internal theme version to `13`.

## 1.4.1 - 2026-08-23

- Fixed the compact iPhone cascade so the intended one-point type bump and
  `1.48` line-height rhythm both take effect without flattening text-size
  preferences.
- Removed global light-mode image blending so illustrations, screenshots,
  transparency, and authored colors render as supplied.
- Throttled scroll-driven map updates with `requestAnimationFrame` and cached
  target offsets between layout changes.
- Recalculated map geometry after viewport changes, media loads, and observed
  article-height changes.
- Marked the active destination with `aria-current="location"` and preserved
  clean listener, observer, and animation-frame teardown across Split View.
- Hardened the existing heading-map selection around coherent hierarchy,
  removed duplicate and utility headings, capped body markers at eight, and
  hid the map below two viewport heights while watching for late content growth.
- Added WebKit browser coverage for compact typography, article length,
  heading hierarchy, image/video/audio fixtures and media growth, Split View,
  and accessibility, plus canonical Chromium screenshot comparisons.
- Bumped the internal theme version to `12`.

## 1.4.0 - 2026-07-24

- Strengthened the responsive article-title hierarchy on rail-capable layouts
  while preserving compact title sizing and spacing.
- Moved the reading map beside the centered article without changing the
  `41.5625rem` reading measure.
- Added source identity and conditional reading time to the opening metadata;
  estimates appear only at four minutes or longer.
- Normalized missing author, date, feed, and read-time fields so metadata never
  leaves orphaned or doubled separators.
- Removed the visible word count and persistent statistics footer.
- Added an intent-revealed active-section label on wide precise-pointer
  layouts, while keeping iPad marker-only and compact layouts rail-free.
- Tuned the active-section label threshold to `1080px` for normal full-window
  NetNewsWire article panes.
- Added live rail teardown and restoration across iPad Split View transitions,
  including pointer, scroll, and resize listener cleanup.
- Expanded the public screenshot set across desktop, iPad, iPhone, light, dark,
  structured, and image-first articles.
- Added macOS release validation and focused contribution, support, conduct,
  and security guidance for the public repository.
- Extended release validation and bumped the internal theme version to `11`.

## 1.3.1 - 2026-07-24

- Added system-accent keyboard focus treatment to the section rail.
- Enlarged title, metadata, disclosure, and wide iPad rail touch targets to 44 points without changing their visual weight.
- Improved reading-statistics contrast in light and dark appearances.
- Refreshed the desktop and iPhone screenshots to match the current theme.
- Added validation coverage for interaction polish and bumped the internal theme version to `10`.

## 1.3.0 - 2026-06-26

- Removed the section rail from compact mobile layouts so phone reading is quieter and no longer reserves a left rail gutter.
- Tightened compact mobile side padding so phone articles feel less inset under NetNewsWire's chrome.
- Tightened compact mobile line height for denser phone reading without changing desktop rhythm.
- Fixed structured articles whose duplicate title heading caused the desktop rail to fall back to generic scroll-depth markers.
- Kept the section rail on wider tablet and desktop layouts.
- Prevented compact mobile layouts from initializing rail interaction JavaScript.
- Added validation checks for theme/preview script parity, compact rail behavior, and package/source alignment.
- Bumped the internal theme version to `9`.

## 1.2.1 - 2026-06-25

- Restored `Calm.nnwtheme.zip` to the repository root so the installable package is visible from GitHub's file list.
- Kept the package content aligned with the `Version` 8 theme source; no theme template or stylesheet behavior changed.

## 1.2.0 - 2026-06-10

- Held pointer capture while scrubbing the section rail so a drag no longer ends early when the pointer drifts off the narrow rail.
- Added quiet styling for `mark`, `kbd`, definition lists, `details`/`summary`, and `audio` so common feed content no longer falls back to browser defaults.
- Enabled `text-wrap: pretty` on paragraphs and list items where supported.
- Removed an accidentally re-committed `Calm.nnwtheme.zip` from the repository; zips are published through GitHub Releases.
- Bumped the internal theme version to `8`.

## 1.1.4 - 2026-06-05

- Switched the section rail to hybrid targets: heading anchors for structured articles, scroll-depth markers otherwise.
- Added tap-and-drag scrubbing on the section rail.
- Tweaked mobile section marker visibility.
- Bumped the internal theme version to `7`.

## 1.1.3 - 2026-06-05

- Removed the top reading progress bar from reader views.
- Bumped the internal theme version to `6`.

## 1.1.2 - 2026-06-05

- Changed the section rail to use major headings only when an article has five or more filtered headings.
- Added a five-marker scroll-depth rail for articles with four or fewer filtered headings.
- Kept marker jumps inside the reader view with top breathing room.
- Bumped the internal theme version to `5`.

## 1.1.1 - 2026-06-05

- Updated the installer author website to `https://raisul.xyz`.
- Bumped the internal theme version to `4`.

## 1.1.0 - 2026-06-05

- Reworked the generated section rail into a lower-contrast marker stack for desktop and mobile.
- Limited section markers to the article title and major body headings so lower-level subheads do not make the rail feel random.
- Kept marker clicks inside the reader view and added scroll breathing room for section jumps.
- Bumped the internal theme version to `3`.

## 1.0.1 - 2026-05-18

- Increased the iOS article font size while preserving NetNewsWire Dynamic Type behavior.
- Bumped the internal theme version to `2`.

## 1.0.0 - 2026-05-18

- Initial Calm theme for NetNewsWire on macOS and iOS.
- Added light and dark appearances, serif article typography, desktop section rail, reading progress, and read-time footer.
