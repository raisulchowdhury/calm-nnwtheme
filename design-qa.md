# Design QA: Calm v1.4 release candidate

## Review target

- Specification:
  `docs/specs/2026-07-24-v1.4-reading-craft-design.md`
- Live preview: `http://localhost:8765/preview/`
- Public screenshot set:
  - `assets/screenshots/calm-light.png`
  - `assets/screenshots/calm-dark.png`
  - `assets/screenshots/calm-structured-light.png`
  - `assets/screenshots/calm-ipad-light.png`
  - `assets/screenshots/calm-ios-light.png`
  - `assets/screenshots/calm-ios-dark.png`
- Reviewed viewports:
  - desktop, `1440 × 1100`
  - iPad portrait, `834 × 1194`
  - iPad landscape, `1194 × 834`
  - Split View, `744 × 1133`
  - iPhone portrait, `390 × 844`
  - short coarse-pointer landscape, `844 × 390`

## Release findings

- [Pass] Rail-capable layouts use the stronger title scale and separation while
  compact layouts retain their existing title rhythm and touch target.
- [Pass] The reading map sits beside the unchanged centered article measure.
- [Pass] Structured articles use real heading targets; simpler long articles
  retain scroll-depth markers.
- [Pass] Source identity stays textual. Reading time appears in opening metadata
  only at four minutes or longer, with an accessible label.
- [Pass] Empty or unresolved author, date, and feed fields are hidden before
  separator placement; all-empty metadata rows collapse.
- [Pass] The visible word count and statistics footer are removed.
- [Pass] At `1080px+` on precise-pointer layouts, heading-based rails can reveal
  a plain, truncated active-section label through hover, keyboard focus, or
  scrubbing.
- [Pass] iPad keeps 44-point rail targets and marker-only feedback. Compact
  phone, Split View, and short coarse landscape layouts remain rail-free.
- [Pass] Entering Split View removes rail controls and pointer, scroll, and
  resize listeners; returning to full iPad width rebuilds them without reload.
- [Pass] Compact WebKit body padding is `16px` on both sides. Apparent variation
  in prose edges comes from natural ragged-right line wrapping, not asymmetric
  layout padding.
- [Pass] Light and dark palettes, the `41.5625rem` article measure, body-heading
  scale, media treatment, keyboard focus, reduced motion, and Tap + Scrub
  mechanics remain intact.

## Screenshot coverage

The public images use two attributed long-form articles:

- Naval’s Archive,
  [“If You’re So Smart, Why Aren’t You Happy?”](https://navalsarchive.substack.com/p/if-youre-so-smart-why-arent-you-happy)
- Yew Jin Lim,
  [“You Can’t Max a Life”](https://yewjin.substack.com/p/you-cant-max-a-life)

Together they cover image-first and structured content, short and long titles,
desktop light and dark appearance, the wide active-section label, iPad’s
marker-only rail, and rail-free iPhone light and dark layouts.

## Automated evidence

- `Info.plist` parses and reports internal version `11`.
- Theme and preview inline scripts parse and remain byte-for-byte identical.
- Focused checks cover responsive titles, article-relative rail geometry,
  44-point iPad targets, compact rail absence and listener suppression,
  heading/depth targeting, conditional reading time, robust metadata
  separators, footer removal, heading-only labels, coarse-pointer suppression,
  keyboard focus, scrubbing, and reduced motion.
- Release-sync checks cover version, documentation, screenshot presence and PNG
  integrity, release notes, and install guidance.
- The rebuilt installable archive matches `Calm.nnwtheme/` exactly.

## Remaining release check

- P3: Repeat the coarse-pointer interaction pass on physical iPad hardware
  before publishing the GitHub release.

final result: passed
