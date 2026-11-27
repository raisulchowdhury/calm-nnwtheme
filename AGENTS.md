# Rules for every change to Calm

These hold for people and agents alike. A change that breaks one doesn't ship.

## Works across websites and feed readers

Every feature has to hold on the markup of all the major publishing platforms (WordPress, Ghost, Substack, Medium, Jekyll, Hugo, Pandoc, GitHub, Blogger, Buttondown and the rest in `docs/compatibility.md`) and of feeds passed through readers such as FreshRSS and Feedbin. It must also not trigger where it doesn't belong: a poem keeps its line breaks, a paragraph that mentions "appeared first on" stays.

- Detect by what the markup means, not by one site's class names.
- A change ships with a case in `tests/platform-fixtures.mjs` for each platform it affects, including a case where it must not trigger.
- Check it on real markup with `node scripts/check-platforms.mjs` and update `docs/compatibility.md`.

## Never worsens performance

- No rise in the first script pass or in any component's budget, and no added layout shift.
- The performance tests in `tests/theme.spec.mjs` are the gate. A budget changes only with a measured reason in the commit message (`node scripts/measure-performance.mjs`, `--components` for each part).
- Read the page first, then change it. Reading layout (sizes, `innerText`) between changes lays the page out once per element.

## No visible swaps after load

Raisul, 2026-11-26: "It's become glitchy. Takes a second before it shows up. We should avoid making changes like this."

- Never reload, redraw or swap content after it has rendered.
- Every change happens before first paint: in CSS, or in the theme's existing first script pass.
- No handlers that wait for an image to load or fail, a third-party script, a timer or a MutationObserver and then change what's shown.
- If a fix needs a swap after load, leave the flaw and note it.

## House conventions

- One inline `<script>` per template. `template.html`, `template7.3.html` and `preview/index.html` carry the same script; change all three together.
- Rebuild the zip after any change to `Calm.nnwtheme/`: `rm -f Calm.nnwtheme.zip && ditto -c -k --norsrc --keepParent Calm.nnwtheme Calm.nnwtheme.zip`.
- Visible changes get before/after images in `assets/releases/unreleased/` (`node scripts/before-after.mjs`), made from free feeds or synthetic fixtures. Open each one to check it shows the change.
- Never commit corpus items (`.corpus/`) or paid-feed content. Fixtures use made-up text.
- Never commit `tests/theme.spec.mjs-snapshots/*darwin*.png`; the visual reference is Linux-only.
- Each commit message ends with `Verified: <what ran>`, true for that commit's tree.
