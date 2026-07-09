# Touch and Focus Polish Implementation Plan

**Goal:** Improve focus visibility, touch ergonomics, and footer legibility without changing Calm's responsive information architecture.

**Approach:** Add narrowly scoped CSS rules, protect them with a dedicated validation script, then rebuild and verify the theme archive. The rail remains hidden at the existing compact breakpoint and remains available at full-width iPad landscape.

## 1. Protect the interaction contract

- Add `scripts/check-interaction-polish.mjs` with assertions for keyboard-only rail focus, compact 44-point targets, touch-capable wide rail targets, and footer color.
- Run the new check and confirm it fails before the stylesheet changes.

## 2. Apply the visual polish

- Update `Calm.nnwtheme/stylesheet.css` with system-native focus styling and input-aware target sizing.
- Keep marker geometry, typography, compact spacing, and breakpoint logic unchanged.
- Raise only the reading-statistics text from faint to muted.

## 3. Package and verify

- Increment `Calm.nnwtheme/Info.plist`.
- Rebuild `Calm.nnwtheme.zip` from the theme directory.
- Run the full validation suite and inspect phone/iPad preview dimensions in light and dark appearances.
- Review the final diff for unrelated changes.
