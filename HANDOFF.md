# Handoff: Calm 1.5.0, releasing Saturday 2026-11-28

Start a fresh session here. Read `AGENTS.md` first: its rules bind every change.

## Where things are

- **Branch:** `calm-roadmap-fixes`. **PR:** https://github.com/raisulchowdhury/calm-nnwtheme/pull/31.
- **The release is prepared, not published.** Merging the PR to `main` publishes it: `release.yml` tags `v1.5.0` and uploads `Calm.nnwtheme.zip` once Validate passes, with the dated release-notes file as the release page. Raisul chose on 2026-11-27 to release Saturday Nov 28 at 8:00 Pacific and post on Monday Nov 30 ("release tomorrow/asap and then post on monday"). A scheduled task in his Claude session (`trig_013no3jcwjWp6GVXQTVLpvv8`) does the merge then.
- **Version:** 1.5.0, theme version 16, dated 2026-11-28.
  - If the merge happens on another day, change the date in the `CHANGELOG.md` heading, the release-notes filename `docs/releases/2026-11-28-calm-1.5.0.md`, the two lines that name it in `scripts/check-release-sync.mjs`, and the README link. Then run `node scripts/updates-json.mjs --write`.
  - The build number lives in `Info.plist` and in `var BUILD` in all three script copies. `check-release-sync.mjs` now fails if they differ.
- **Tests:** `npm test`, then `npx playwright test --trace off --reporter=line`. On a Mac one `@visual` failure is expected, because the reference image is Linux-only; delete the `*darwin*.png` it leaves. CI on Linux passes everything.
- **Release notes:** `docs/releases/2026-11-28-calm-1.5.0.md`. **Launch plan with post drafts:** `docs/launch/2026-11-30-calm-1.5-launch-plan.md` (posts go out Monday).
- **Before/after images:** `assets/releases/1.5.0-<slug>.jpg`, one per case in `scripts/before-after.mjs`, all remade against 1.4.4 on 2026-11-27. `assets/releases/unreleased/` is empty again for the next change.
- **Gallery of every fix:** https://claude.ai/artifact/Qy8d9ts9shZ4kTierahtM1 (Version 21). Ordered like the release notes, on Raisul's picks of 2026-11-27: Most noticed (sign-ups, podcast file names, Substack buttons, galleries, link cards, X dark mode, footnotes, cover once, captions), More fixes, Code, Reading style, Rare cases. Each picture says whether it is a real feed or a sample article. To update it from a new session, read the artifact first, then republish from that read.
- **Design pass record:** `docs/design-pass-2026-11-27.md`, with Raisul's picks and the two independent reviews.
- **iPhone test build:** branch `preview/calmdev` at b2fea65, built from the final candidate (fe6c5f1). Install by pasting this into Safari and choosing Overwrite: `netnewswire://theme/add?url=https%3A%2F%2Fraw.githubusercontent.com%2Fraisulchowdhury%2Fcalm-nnwtheme%2Fpreview%2Fcalmdev%2FCalmDev.nnwtheme.zip`. Delete the branch once the release is out; Raisul was promised this.
- **Mac test install:** `~/Library/Containers/com.ranchero.NetNewsWire-Evergreen/Data/Library/Application Support/NetNewsWire/Themes/CalmDev.nnwtheme/`, same build.

## Last changes before release (2026-11-27 evening)

- **Claims audit:** `docs/claims-audit-2026-11-28.md` checked every claim on real feeds. Raisul said "make calls"; the wording fixes are in fe6c5f1 (emoji, toggles, Ghost thumbnails, embed heights, footnote and podcast alt texts, "most changes have an image").
- **Embedded posts no longer grow after load** (476000b). Calm grew X, Bluesky and Mastodon frames when they reported a height, which moved the text after the article showed. Removed under the AGENTS.md no-swap rule; the cut-off X frame is a known limit. Bluesky and Mastodon were already the right height in 1.4.4.
- **Order:** release notes, gallery (Version 20) and post drafts follow Raisul's picks: sign-up forms, podcast file names, Substack picture buttons (labelled "since 1.4.4" in the forum draft), galleries, link cards, X dark mode, footnotes, cover once, captions; then more fixes, code, reading style, rare cases.
- **Forum picture:** `assets/releases/1.5.0-highlights.gif`, a loop of five before and after pairs at 690x500.
- **Site:** Saturday's run only bumps `RELEASE_VERSION`. A "New in 1.5" strip is an optional follow-up that needs a design study first.

## For 1.5.1 (found by a Gemini 4 Neon review on 2026-11-27, not fixed before release)

Both are theme changes, so they wait for Raisul's yes. Neither is worse than 1.4.4.

- **iPhone and iPad Dynamic Type.** The iOS block in `stylesheet.css` (`@supports (-webkit-touch-callout: none)`) sets `font-size` from `[[font-size]]` but not `--reader-font-size`. So at larger system text sizes, paragraph gaps stay at the default and an opened footnote stays 12.25px. The notes now say the gap grows "on the Mac". A fix must not move `--reader-base-size`, which also sizes titles. Check on a device at a large Dynamic Type size.
- **Ghost video thumbnail box.** NetNewsWire's `main.js` `stripStyles()` removes `aspect-ratio` from inline styles after Calm's script, so `showVideoThumbnails()`'s box guard may not hold while the thumbnail decodes. Only matters for Ghost video cards copied from the web page. Suggested fix: a custom property (`--calm-ratio`) read by CSS. Reproduce first.

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
- X frames embedded directly stay white in dark mode, and are cut to a video-shaped box (the resize was removed on 2026-11-28 under the no-swap rule).
- Hugo `table.lntable` and Pygments line-number tables get no Copy button.
- A 1 px black line may appear under a video in dark mode. It was seen in one render only.
- A broken image keeps its box: hiding it after a failed load would be a swap after load.

## Not Calm's

The next-article glitch on iPhone is NetNewsWire's. Measured on 2026-11-27 from his two 60 fps recordings in dark mode:

- **Default theme:** 8 of 11 slides had a blank incoming panel (text 17 to 100 ms late); 4 of those started with the whole panel white for one or two frames. It also happens with the up arrow.
- **Calm:** 1 of 6 slides glitched: white only behind the top and bottom bars for about 100 ms, text at about 170 ms.
- The slide itself eases in normally and doesn't stall. One Calm sample is too little to say whether Calm adds to the wait.

Raisul filed it on 2026-11-27 as https://github.com/Ranchero-Software/NetNewsWire/issues/5587, with the slow-motion clip. The text is in `docs/launch/2026-11-27-netnewswire-bug-report-draft.md`. Watch the issue for replies; any answer there is his to post.
