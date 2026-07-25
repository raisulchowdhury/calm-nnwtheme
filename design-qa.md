# Design QA: Calm v1.4 checkpoint 4

## Comparison target

- Source visual truth:
  `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-2/checkpoint-2-desktop-dark-1440x1100.png`
- Intended delta:
  `docs/specs/2026-07-24-v1.4-reading-craft-design.md`, checkpoint 4
- Implementation URL: `http://localhost:8765/preview/`
- Implementation screenshots:
  - `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-4-revised/nnw-pane-1136x697-hover.png`
  - `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-4-revised/nnw-pane-1136x697-hover-dark.png`
  - `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-4-revised/boundary-1080-long-label.png`
- Captured desktop states: light and dark appearance with the active heading
  label revealed by hover
- Source pixels: `1440 × 1100`
- Implementation pixels: `1136 × 697`, matching the observed full-window
  NetNewsWire article pane, plus the `1080 × 697` boundary
- Density normalization: device scale factor `1`

## Findings

- [Resolved P1] The original `1180px` threshold excluded the approximately
  `1136px` article pane in a normal full-window NetNewsWire layout.
  Location: the precise-pointer media query for `.readerTocContext`.
  Evidence: the label was absent at the observed app width before the revision;
  the revised preview reports `display: block`, `opacity: 1`, and a `175.5px`
  label width at `1136px`.
  Fix: lower only the heading-label threshold to `1080px`; keep the base rail,
  coarse-pointer suppression, and compact-layout rules unchanged.
- [Pass] At the `1080px` boundary, the label remains within the viewport with a
  `147.5px` content width and a `5.6px` outer margin. The real preview heading
  truncates with an ellipsis without colliding with the rail or article.
- [Pass] At `1079px`, the label returns to `display: none`, so the enhancement
  does not leak below the revised wide-layout threshold.
- [Pass] Light and dark captures preserve the intended muted text, visual
  hierarchy, reading measure, media treatment, and rail alignment.

## Implemented behavior

- The rail is marked `is-heading-based` only when it uses five or more real
  heading targets.
- The preview now has five major headings so its live rail exercises heading
  mode rather than depth markers.
- On `1080px+` precise-pointer layouts, the active heading appears as plain,
  right-aligned, truncated text to the left of the rail.
- Hover, `focus-within`, and active scrubbing reveal the text with a 120ms
  opacity transition.
- The label has no background, border, arrow, bracket, shadow, or pointer hit
  area.
- Any coarse-pointer environment hides the label, preserving iPad marker-only
  feedback.
- Depth-marker rails keep the label empty and remain text-free.
- Compact phone, Split View, and short coarse landscape layouts retain complete
  rail removal and listener suppression.
- Reduced motion removes the opacity transition.

## Automated evidence

- Theme and preview scripts remain byte-for-byte identical.
- Heading mode receives the heading-only class and synchronizes label text and
  vertical position to the active marker.
- Simulated scrubbing updates the label to the scrubbed heading, exposes the
  active scrubbing class, clears it on release, and restores the current section.
- Four-heading fixtures preserve `25%` depth markers, omit the heading-only
  class, and expose no section text.
- Source assertions cover the `1080px+` precise-pointer query, hover, keyboard
  focus, scrubbing, coarse-pointer suppression, plain-text styling,
  truncation, and reduced motion.
- The full validation suite and rebuilt package comparison pass.

## Fidelity review

- Fonts and typography: the existing tokens are unchanged; label weight,
  truncation, and optical balance remain quiet in both appearances.
- Spacing and layout: the label fits at both the observed NetNewsWire pane width
  and the exact `1080px` boundary without article or rail collision.
- Colors and tokens: the existing muted token remains legible without becoming
  article chrome in light or dark appearance.
- Image quality: no image source, crop, or treatment changed.
- Copy and content: the label mirrors the real active heading and truncates
  cleanly at the boundary.
- States and accessibility: semantics, focus selector, coarse suppression,
  reduced-motion CSS, hover rendering, and boundary behavior are covered.

## Comparison history

The initial checkpoint 4 review was blocked because a rendered implementation
capture was unavailable. The revised pass uses the actual observed NetNewsWire
pane width, captures light and dark hover states, and exercises both sides of
the new boundary. There are no known automated or visual P0, P1, or P2
failures.

## Implementation checklist

- [x] Keep checkpoint 4 isolated from checkpoint 3.
- [x] Mark only real-heading navigation.
- [x] Reveal plain active-section text on wide precise-pointer layouts.
- [x] Support hover, keyboard focus, and active scrubbing.
- [x] Preserve coarse-pointer marker-only feedback.
- [x] Preserve depth-marker, compact, and reduced-motion behavior.
- [x] Rebuild and compare the installable package.
- [x] Capture and compare matching browser-rendered responsive states.

## Follow-up polish

- P3: Repeat coarse-pointer behavior on physical iPad hardware before release
  preparation.
- P3: Reinstall the revised bundle in NetNewsWire when desktop app control is
  available and repeat the hover capture in the app.

final result: passed
