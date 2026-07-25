# Contributing to Calm

Calm is intentionally small. Contributions should improve reading quality,
accessibility, compatibility, or maintainability without turning the theme into
a second layer of NetNewsWire interface.

## Before opening an issue

1. Check whether the problem also appears with a built-in NetNewsWire theme.
2. Update to the latest Calm release.
3. Capture the device, OS version, NetNewsWire version, window mode,
   appearance, text size, article URL, and a screenshot.

Use the [Calm theme issue form](https://github.com/raisulchowdhury/calm-nnwtheme/issues/new?template=theme_issue.yml)
for theme-specific problems. Problems that affect every theme belong in the
[NetNewsWire issue tracker](https://github.com/Ranchero-Software/NetNewsWire/issues/new/choose).

## Design constraints

Please preserve Calm's core reading contract:

- a centered `41.5625rem` maximum article measure
- quiet serif typography and the existing light and dark palettes
- normal article scrolling outside the reading map
- keyboard access and reduced-motion behavior
- 44-point targets on coarse-pointer layouts
- no reading map, reserved gutter, or rail listeners in compact layouts
- source and preview script parity

Proposals that add persistent chrome or NetNewsWire controls should begin with
an issue so the interaction can be discussed before implementation.

## Pull requests

1. Create a focused branch from `main`.
2. Change the source in `Calm.nnwtheme/`.
3. Mirror template behavior in `preview/index.html`.
4. Add or update a behavior-focused check in `scripts/`.
5. Rebuild `Calm.nnwtheme.zip` whenever the theme source changes:

   ```sh
   ditto -c -k --norsrc --keepParent Calm.nnwtheme Calm.nnwtheme.zip
   ```

6. Run the full suite:

   ```sh
   scripts/validate.sh
   git diff --check
   ```

7. Include before-and-after screenshots for visual changes.

Do not edit the zip directly. The committed package must match
`Calm.nnwtheme/` exactly.

## Visual review

For responsive changes, review at least:

- desktop: `1440 × 1100`
- iPad portrait: `834 × 1194`
- iPad landscape: `1194 × 834`
- Split View: `744 × 1133`
- iPhone portrait: `390 × 844`
- short coarse landscape: `844 × 390`

Check light and dark appearance where the change applies. Interaction changes
should also be exercised with keyboard focus, precise pointer, coarse pointer,
and reduced motion.
