# Design QA: Calm v1.4 checkpoint 1

## Scope

Responsive article-title hierarchy only. Rail position, metadata, footer,
palette, article measure, media treatment, and article-body heading sizes are
outside this checkpoint and must remain unchanged.

## Comparison evidence

- Source references:
  - `assets/screenshots/calm-dark.png`
  - `assets/screenshots/calm-light.png`
- Implementation URL: `http://localhost:8765/preview/`
- Full comparison viewport: `1440 × 1100` CSS pixels at the top scroll state
- Full dark comparison:
  `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-1/compare-desktop-dark.png`
- Focused dark header comparison:
  `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-1/compare-header-dark.png`
- Full light comparison:
  `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-1/compare-desktop-light.png`
- Required-width light contact sheet:
  `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-1/responsive-contact-sheet-light.png`
- Required-width dark contact sheet:
  `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-1/responsive-contact-sheet-dark.png`
- Long-title contact sheet:
  `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-1/long-title-contact-sheet-dark.png`

The source and implementation captures use the same article, viewport, scroll
position, and appearance. The light and coarse-pointer states were rendered
through a temporary local QA harness that reused the shipped preview and
stylesheet; that harness was removed after capture.

## Measured results

| Layout | Title size | Line height | Tracking | Header gap | Rail |
| --- | ---: | ---: | ---: | ---: | --- |
| `1440 × 1100` | `31.5px` | `36.54px` | `-0.7875px` | `40px` | present |
| `834 × 1194` | `31.5px` | `36.54px` | `-0.7875px` | `40px` | present |
| `1194 × 834` | `31.5px` | `36.54px` | `-0.7875px` | `40px` | present |
| `744 × 1133` | `28px` | `33.6px` | `-0.56px` | `32px` | absent |
| `390 × 844` | `28px` | `33.6px` | `-0.56px` | `32px` | absent |
| `844 × 390`, coarse | `28px` | `33.6px` | `-0.56px` | `32px` | absent |

The wide values resolve exactly to `1.8 ×` the `17.5px` base size, `1.16`
line height, `-0.025em` tracking, and a `2.5rem` gap. Compact values preserve
the prior `1.6 ×`, `1.2`, `-0.02em`, and `2rem` settings.

The compact title link remains 44 pixels high. The article remains 665 pixels
wide at full measure, and the sampled article-body `h2` remains `22.75px`.

## Visual findings

- The title is visibly more confident at wide widths without becoming heavier.
- The four-pixel gap increase gives the opening paragraph clearer separation
  without loosening the rest of the article.
- The long-title fixture wraps to two lines on desktop, iPad, Split View, and
  coarse landscape, and four lines on iPhone, with no clipping or horizontal
  overflow.
- Split View, iPhone, and short coarse landscape retain the compact title and
  rail-free composition.
- Source and implementation comparisons show no palette, measure, media,
  article-body heading, or rail-style drift.
- A clean reload of the real preview produced no console warnings or errors.

The in-app browser does not expose coarse-pointer emulation. The `844 × 390`
visual therefore used the real compact CSS rules through the temporary harness;
the actual coarse media query, rail absence, and listener suppression remain
covered by the repository validation suite.

## Severity review

- P0: none
- P1: none
- P2: none
- P3: coarse-pointer behavior should still receive a physical iPad check before
  release preparation.

final result: passed
