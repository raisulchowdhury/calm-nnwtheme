# Changelog

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
