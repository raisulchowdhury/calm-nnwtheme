# Handoff: Calm 1.5.0, ready to release (2026-11-27)

Start a fresh session here. Read `AGENTS.md` first: its rules bind every change.

## Where things are

- **Branch:** `calm-roadmap-fixes`. **PR:** https://github.com/raisulchowdhury/calm-nnwtheme/pull/31.
- **The release is prepared, not published.** Merging the PR to `main` publishes it: `release.yml` tags `v1.5.0` and uploads `Calm.nnwtheme.zip` once Validate passes. Raisul said on 2026-11-27: "Release on Monday Nov 30". Merge on that day, not before.
- **Version:** 1.5.0, theme version 16, dated 2026-11-30.
  - If the merge happens on another day, change the date in three places: the `CHANGELOG.md` heading, the release-notes filename `docs/releases/2026-11-30-calm-1.5.0.md`, and the two lines that name it in `scripts/check-release-sync.mjs`. Then run `node scripts/updates-json.mjs --write`.
  - The build number lives in `Info.plist` and in `var BUILD` in all three script copies. `check-release-sync.mjs` now fails if they differ.
- **Tests:** `npm test`, then `npx playwright test --trace off --reporter=line`. On a Mac one `@visual` failure is expected, because the reference image is Linux-only; delete the `*darwin*.png` it leaves. CI on Linux passes everything.
- **Release notes:** `docs/releases/2026-11-30-calm-1.5.0.md`. **Launch plan with post drafts:** `docs/launch/2026-11-30-calm-1.5-launch-plan.md`.
- **Before/after images:** `assets/releases/1.5.0-<slug>.jpg`, one per case in `scripts/before-after.mjs`, all remade against 1.4.4 on 2026-11-27. `assets/releases/unreleased/` is empty again for the next change.
- **Gallery of every fix:** https://claude.ai/artifact/Qy8d9ts9shZ4kTierahtM1. Its source was in the old session's scratchpad. To update it from a new session, read the artifact first, then republish from that read.
- **Design pass record:** `docs/design-pass-2026-11-27.md`, with Raisul's picks and the two independent reviews.
- **iPhone test build:** branch `preview/calmdev`, built from the 1.5.0 candidate. Install by pasting this into Safari and choosing Overwrite: `netnewswire://theme/add?url=https%3A%2F%2Fraw.githubusercontent.com%2Fraisulchowdhury%2Fcalm-nnwtheme%2Fpreview%2Fcalmdev%2FCalmDev.nnwtheme.zip`. Delete the branch once testing is done; Raisul was promised this.
- **Mac test install:** `~/Library/Containers/com.ranchero.NetNewsWire-Evergreen/Data/Library/Application Support/NetNewsWire/Themes/CalmDev.nnwtheme/`, same build.

## Decided by Raisul on 2026-11-27

- **Sign-up forms:** hidden forms become one quiet button.
- **Task-list boxes:** muted grey, not amber.
- **Picks from the design options:** quiet link card; upright quotes in the text colour; clearer heading steps; paragraph gaps that scale with text size; tinted pill buttons (Proposal B).
- **Footnotes:** a plain number; tapping it opens the note in mono below the line and pushes the text down. Chosen after an overlay version kept cutting the line underneath.
- **Dark-mode paper backing for line art:** dropped, because it flashed a light box while PNGs loaded.
- **Late updates:** articles never wait on Calm. This is a rule in `AGENTS.md`.
- **No yellow:** "i don't love the yellow color you're using as placeholder/ accent. Should be some version of light/dark grey depending on light/dark theme". The light-mode tint and hairlines are grey (3b129fa). The selection and `<mark>` highlight stay amber: he said to keep them as they are.
- **CI speed budget:** the headings step gets 100 ms on Linux; the Mac stays at 30 ms.

## After the merge

1. Check the release page has `Calm.nnwtheme.zip`, and that the install link works on a Mac and an iPhone.
2. In the raisul.xyz repo, bump `RELEASE_VERSION` in `src/app/(site)/projects/calm/page.tsx`.
3. Follow the launch plan. Every post is Raisul's to send.
4. Delete the `preview/calmdev` branch.

## Known limits (also in the release notes)

- Black line art on a transparent background still disappears in dark mode.
- X frames embedded directly stay white in dark mode.
- Hugo `table.lntable` and Pygments line-number tables get no Copy button.
- A 1 px black line may appear under a video in dark mode. It was seen in one render only.
- A broken image keeps its box: hiding it after a failed load would be a swap after load.

## Not Calm's

The next-article glitches on iPhone (a black panel, a stalled slide, pictures popping in) also happen in NetNewsWire's default theme. Measured on his recording: the next article's panel is blank for the first 170 ms of the slide, with white strips under the bars at the start; the slide itself eases in normally and doesn't stall. He asked for a draft bug report: `docs/launch/2026-11-27-netnewswire-bug-report-draft.md`. He posts it; it still needs his versions and a Default-theme recording.
