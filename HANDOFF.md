# Handoff: Calm 1.5 (2026-11-27)

Start a fresh session here. Read `AGENTS.md` first: its rules bind every change.

## Where things are

- **Branch:** `calm-roadmap-fixes`. **Draft PR:** https://github.com/raisulchowdhury/calm-nnwtheme/pull/31. Last theme commit: 80d69b1.
- **Tests at that commit:** 170 passed and 2 skipped. 1 `@visual` failure is expected on Mac, because the reference image is Linux-only.
- **Design pass:**
  - Report, with Raisul's picks table and known limits: `docs/design-pass-2026-11-27.md`.
  - Options he chose from: `docs/design-pass-options.html`, published at https://claude.ai/artifact/6UZX4Kqv5EC1ZQhLyEMHNE.
- **Before/after:**
  - Images for the release notes are in `assets/releases/unreleased/`.
  - Gallery of all 27 fixes, ordered by value to readers, every image regenerated against the branch on 2026-11-27: https://claude.ai/artifact/Qy8d9ts9shZ4kTierahtM1. Its source is in the old session's scratchpad (`calm-gallery/`). To update it from a new session, read the artifact first, then republish from that read.
- **iPhone test build:**
  - Branch `preview/calmdev`, rebuilt at 80d69b1.
  - Install by pasting this link into Safari and choosing Overwrite: `netnewswire://theme/add?url=https%3A%2F%2Fraw.githubusercontent.com%2Fraisulchowdhury%2Fcalm-nnwtheme%2Fpreview%2Fcalmdev%2FCalmDev.nnwtheme.zip`.
  - Delete the branch once testing is done; Raisul was promised this.
- **Mac test install:** `~/Library/Containers/com.ranchero.NetNewsWire-Evergreen/Data/Library/Application Support/NetNewsWire/Themes/CalmDev.nnwtheme/`. It matches 80d69b1.

## Decided by Raisul on 2026-11-27

- **Sign-up forms:** hidden forms become one quiet button.
- **Task-list boxes:** muted grey, not amber.
- **Picks from the design options:**
  - Link cards: quiet card.
  - Quotes: upright, in the text colour.
  - Headings: clearer steps.
  - Paragraph gaps: scale with text size.
  - Buttons: tinted pill (Proposal B).
- **Footnotes:**
  - The marker is a plain number.
  - Tapping it opens the note in mono below the line, pushing the text down. This was chosen after an overlay version kept cutting the line underneath.
- **Dark-mode paper backing for line art:** dropped, because it flashed a light box while PNGs loaded.
- **Late updates:** articles never wait on Calm. "Avoid loading delays because of calm" is a rule in `AGENTS.md`.
- **Next-article glitches on iPhone:** the black panel, the stalled slide and pictures popping in also happen in the Default theme. They are NetNewsWire's, not Calm's. A bug report for NetNewsWire's GitHub was offered and not yet answered; posting it needs his OK.

## Open

1. Raisul tests the iPhone build and reports anything slow or off.
2. Nothing from the design pass has been checked inside NetNewsWire itself. Look at it in the Mac app.
3. Known limits are listed in the report:
   - When a line breaks inside a link, the note opens after the paragraph.
   - Black line art on a transparent background still disappears in dark mode.
   - A 1 px black line may appear under video in dark mode. It was seen in one render only.
4. The plain-caption style costs +3 ms on 200 captions, against `AGENTS.md`'s "no rise". The cost equals a figcaption's. Raisul hasn't ruled on it.
5. When testing is done: mark PR #31 ready, update `CHANGELOG.md`, and move the release images out of `unreleased/`.
