# Design QA: Calm v1.4 checkpoint 3

## Comparison target

- Accepted source state:
  `/Users/raisul/Documents/Codex/2026-07-24/prior-conversation-with-codex-conversation-role/work/calm-v1.4-checkpoint-2/checkpoint-2-desktop-dark-1440x1100.png`
- Intended delta:
  `docs/specs/2026-07-24-v1.4-reading-craft-design.md`, checkpoint 3
- Local URL: `http://localhost:8765/preview/`
- Preview fixture: 346-word article, below the four-minute disclosure threshold

Checkpoint 3 changes only opening metadata and the end-of-article statistics
surface. The accepted title, rail placement, reading measure, palette, media,
article typography, and compact behavior remain the comparison truth.

## Source and preview parity

- Both files place an initially hidden `#readingTime` span directly after the
  existing textual feed name.
- Both scripts estimate at 225 words per minute, disclose only four minutes or
  longer, and expose the full estimate through `aria-label`.
- Both scripts hide and clear the estimate when the article is shorter or text
  is unavailable.
- The inline scripts remain byte-for-byte identical.
- The footer markup, word count, `min read` copy, footer rule, and obsolete
  footer JavaScript are removed from both surfaces.

## Targeted evidence

- 675 words: estimate hidden.
- 676 words: `4 min`, with `Estimated reading time: 4 minutes`.
- 1,350 words: `6 min`, with matching accessible text.
- Missing article body: estimate hidden and cleared.
- Missing author/date/feed combinations are protected by a general-sibling
  separator rule that only inserts separators between non-empty metadata spans.
- The real preview response contains the source identity and reading-time slot,
  contains no statistics footer, and is served from the required local URL.

## Responsive review

- Wide layouts retain the accepted 1.8× title and 2.5rem title-to-body gap.
- Compact layouts retain the accepted 1.6× title, 44-point metadata links, and
  existing phone spacing.
- Reading-time metadata inherits the same wrapping, color, type, and touch
  behavior as the adjacent feed metadata.
- Removing the footer does not change article measure, body rhythm, media
  treatment, or rail mechanics.

The automated source, behavior, package, and live-response checks pass. The
user-facing visual decision is intentionally deferred to the combined
checkpoint 3 and 4 review requested for this staged branch.

## Follow-up polish

- P3: Repeat the coarse-pointer checks on physical iPad hardware before release
  preparation.

final result: pending combined visual review
