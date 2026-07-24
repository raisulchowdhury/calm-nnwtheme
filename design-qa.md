# Design QA: Calm v1.4 checkpoint 2

## Comparison target

- Source visual truth:
  `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-1/checkpoint-1-desktop-1440x1100-dark.png`
- Intended delta:
  `docs/specs/2026-07-24-v1.4-reading-craft-design.md`, checkpoint 2
- Rendered implementation:
  `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-2/checkpoint-2-desktop-dark-1440x1100.png`
- Local URL: `http://localhost:8765/preview/`
- State: top scroll position, preview article, default text size, dark appearance
- CSS viewport: `1440 × 1100`
- Source pixels: `1440 × 1100`
- Implementation pixels: `1440 × 1100`
- Density normalization: both captures at device scale factor `1`

The accepted checkpoint 1 capture is the source state. Checkpoint 2 intentionally
moves only the section rail; every other visible region should remain identical.

## Evidence

- Full dark comparison:
  `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-2/compare-desktop-dark.png`
- Focused rail comparison:
  `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-2/compare-rail-dark.png`
- Full light comparison:
  `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-2/compare-desktop-light.png`
- Required-width dark contact sheet:
  `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-2/responsive-contact-sheet-dark.png`
- Required-width light contact sheet:
  `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-2/responsive-contact-sheet-light.png`

The temporary light, WebKit, and coarse-pointer QA harness reused the shipped
preview and stylesheet, then was removed after capture.

## Findings

No actionable P0, P1, or P2 differences remain.

### Spacing and layout

- The article remains centered and exactly `665px` wide, the rendered value of
  the unchanged `41.5625rem` measure.
- At desktop `1440 × 1100`, the rail right edge is `375.5px`, the article left
  edge is `387.5px`, and the requested gap is exactly `12px` (`0.75rem`).
- At coarse iPad portrait `834 × 1194`, the rail spans `28.5–72.5px`, the
  article begins at `84.5px`, and the gap remains exactly `12px`.
- At coarse iPad landscape `1194 × 834`, the rail spans `208.5–252.5px`, the
  article begins at `264.5px`, and the gap remains exactly `12px`.
- Wide WebKit padding is symmetric at `20px`, so the old left-edge rail gutter
  no longer shifts the iPad reading column.
- Split View `744 × 1133`, iPhone `390 × 844`, and coarse landscape
  `844 × 390` show no rail and reserve no rail gutter.

### Fonts and typography

Title and body typography match checkpoint 1. The title remains `31.5px` on
wide layouts and `28px` on compact layouts; body-heading sizes, wrapping, line
height, tracking, and hierarchy are unchanged.

### Colors and visual tokens

Light and dark comparisons show no palette, opacity, contrast, border, or
surface changes. The new half-measure token affects positioning only.

### Image quality and assets

The existing article illustration keeps the same source, crop, dimensions,
sharpness, blending, and caption treatment. No asset was added or replaced.

### Copy and content

Title, metadata, article copy, rail labels, accessible names, and footer copy
are unchanged.

### States, interaction, and accessibility

- Precise-pointer rail controls remain approximately `24.8 × 16px`.
- Coarse iPad controls remain `44 × 44px`, while their visible dashes stay
  small and aligned.
- Activating the `50%` marker moved the preview from `scrollY 0` to `494` and
  selected the `50%` marker.
- Dragging through the rail settled at `scrollY 1115` with `Bottom` active;
  the scrubbing class cleared after release.
- Compact listener suppression and rail absence remain covered by the
  repository validation suite.
- Existing system focus-ring and pointer-focus-suppression rules are unchanged.
- A clean reload of the real preview produced no console warnings or errors.

## Comparison history

The first normalized comparison found no P0, P1, or P2 mismatch. No visual
fix-and-recapture iteration was required. The half-measure token was changed
from calculated division to the equivalent literal `20.78125rem` before final
validation to avoid depending on newer CSS division support; rendered geometry
remained identical.

## Open questions

None for this checkpoint.

## Implementation checklist

- [x] Keep the `41.5625rem` measure unchanged.
- [x] Add its paired `20.78125rem` half-measure token.
- [x] Position the rail with the approved column-relative formula.
- [x] Preserve precise-pointer geometry.
- [x] Preserve 44-point coarse iPad controls.
- [x] Center the WebKit reading column after removing the obsolete edge gutter.
- [x] Preserve compact rail removal and listener suppression.
- [x] Verify Tap + Scrub after repositioning.
- [x] Verify light, dark, desktop, iPad, Split View, iPhone, and coarse
  landscape states.

## Follow-up polish

- P3: Repeat the coarse-pointer checks on physical iPad hardware before release
  preparation. The in-app browser simulation exercises the shipped CSS rules
  but cannot reproduce an actual finger.

final result: passed
