# Changelog

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
