# Task 3 Report

## Status

Completed.

## Scope implemented

- Added `scripts/check-compact-rail.mjs` with the exact compact rail assertions from the brief.
- Wired `node scripts/check-compact-rail.mjs` into `scripts/validate.sh` immediately after `node scripts/check-scripts.mjs`.
- Replaced the compact CSS block in [Calm.nnwtheme/stylesheet.css](/Users/raisul/Documents/Projects/calm-nnwtheme/Calm.nnwtheme/stylesheet.css) with the exact `@media (max-width: 820px), (pointer: coarse) and (max-height: 500px)` contract and rail-hiding rule.
- Replaced the WebKit support block in [Calm.nnwtheme/stylesheet.css](/Users/raisul/Documents/Projects/calm-nnwtheme/Calm.nnwtheme/stylesheet.css) with the exact compact padding and wide-screen guard.
- Added identical `compactRailQuery`, `shouldDisableRail()`, and `initToc()` guard changes to both inline scripts in [Calm.nnwtheme/template.html](/Users/raisul/Documents/Projects/calm-nnwtheme/Calm.nnwtheme/template.html) and [preview/index.html](/Users/raisul/Documents/Projects/calm-nnwtheme/preview/index.html).
- Updated the preview copy in [preview/index.html](/Users/raisul/Documents/Projects/calm-nnwtheme/preview/index.html) to describe wider-screen rail behavior and rail-free compact mobile.
- Rebuilt [Calm.nnwtheme.zip](/Users/raisul/Documents/Projects/calm-nnwtheme/Calm.nnwtheme.zip) so the packaged artifact matches source and `scripts/validate.sh` passes.

## Baseline verification

I confirmed the pre-implementation failure against the `HEAD` snapshot using the new checker logic and the repo's pre-task source state.

Command:

```bash
node scripts/check-compact-rail.mjs
```

Representative result against the `HEAD` snapshot:

```text
stylesheet.css is missing: @media (max-width: 820px), (pointer: coarse) and (max-height: 500px)
```

## Validation run

Commands run:

```bash
cd /Users/raisul/Documents/Projects/calm-nnwtheme
node scripts/check-compact-rail.mjs
scripts/validate.sh
unzip -q -d /tmp/calm-task3-zip-check Calm.nnwtheme.zip
diff -qr Calm.nnwtheme /tmp/calm-task3-zip-check/Calm.nnwtheme
rm -rf /tmp/calm-task3-zip-check
```

Representative results:

- `node scripts/check-compact-rail.mjs`: no output, exit `0`
- `scripts/validate.sh`:

```text
Calm.nnwtheme/Info.plist: OK
```

- `diff -qr Calm.nnwtheme /tmp/calm-task3-zip-check/Calm.nnwtheme`: no output, exit `0`

## Self-review

- The compact CSS contract matches the brief exactly, including the literal media query string and padding values.
- Both inline scripts carry the same compact rail guard and `shouldDisableRail()` function.
- The regression checker enforces both the new required strings and removal of the old `760px` compact rail behavior.
- The packaged zip was the only extra artifact needed beyond the brief's listed files because the repo validation contract requires source and bundle parity.

## Commit

- `2ae53a8` `Hide section rail on compact mobile`

## Concerns

- The task brief's file list and commit step did not mention [Calm.nnwtheme.zip](/Users/raisul/Documents/Projects/calm-nnwtheme/Calm.nnwtheme.zip), but `scripts/validate.sh` failed until the root package was rebuilt. I included the rebuilt zip in the commit so the repository remains validation-clean.
