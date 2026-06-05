# Rail Tap + Scrub Design

## Status

Approved direction: Tap + Scrub.

This spec covers interaction design only. It does not change the existing rail visual style unless required to support the interaction.

## Goal

Make the Calm section rail easier to operate without making it more visually intrusive.

The visible dash should not be the required touch target. The user should be able to interact with a forgiving rail gutter, then let the rail choose the closest meaningful target.

## Current Baseline

Calm currently uses a hybrid rail:

- Articles with five or more filtered major headings use title plus heading markers.
- Articles with four or fewer filtered major headings use five scroll-depth markers.
- Markers are rendered as quiet dashes in the left gutter.
- Marker activation stays inside the reader view and preserves top breathing room.

This behavior should remain as the target model. The new work changes how users interact with those targets.

## Recommended Interaction

Use a discrete Tap + Scrub model.

- Tap anywhere inside the rail gutter to jump to the nearest marker.
- Drag inside the rail gutter to move through marker targets.
- Release to settle on the nearest marker target.
- Keep normal article scrolling everywhere outside the rail gutter.
- Keep the visible markers small and quiet. Increase the invisible input area, not the visible decoration.

This is intentionally not a full scrollbar. It should feel like a reader navigation aid, not a document editing control.

## Device Behavior

### iPhone

The primary input is touch.

- Use a generous invisible left gutter, roughly 28-36px wide.
- Tapping in the gutter snaps to the nearest target.
- Dragging vertically in the gutter updates the active target.
- Releasing settles the article at the selected target.
- The rail should not require pinpoint tapping on a dash.

### iPad

iPad should support both touch and pointer behavior.

- Touch follows the iPhone model.
- Pointer hover can raise marker contrast slightly.
- Pointer click jumps to the nearest target.
- Pointer drag scrubs through the target set.
- The rail may sit slightly farther from the article text than iPhone because the canvas is wider.

### Mac

Mac behavior should respect pointer precision but still keep the large-target idea.

- Default state stays quiet.
- Hover over the rail gutter raises confidence through slightly stronger contrast.
- Click anywhere in the gutter jumps to the nearest target.
- Click-drag scrubs through targets.
- Trackpad or mouse wheel scrolling should remain normal page scrolling. Do not hijack wheel events unless there is a later explicit reason.

## Haptics

Do not make haptics core behavior.

Theme JavaScript cannot reliably access native iOS or iPadOS haptics inside NetNewsWire. The web `navigator.vibrate()` API is limited and unsupported or no-op in important Safari/WebKit contexts. If added later, vibration must be a progressive enhancement only:

- Check `navigator.vibrate` before calling.
- Use a tiny pulse only on settled target changes.
- Never depend on it for state feedback.
- Never make unsupported haptics feel broken.

## Target Selection

The rail already has a target list. The interaction should operate against that list instead of calculating new article structure.

- Heading mode: title plus filtered heading targets.
- Depth mode: five scroll-depth targets.
- Pointer/touch Y position maps to nearest target by vertical rail position.
- Scroll destination uses the existing top breathing room offset.

The selected marker should update during drag so the user can tell which target will be used on release.

## Visual Feedback

Keep feedback quiet and functional.

- On hover or active touch, slightly increase rail opacity.
- Active marker can grow modestly, but should not become chunky.
- During drag, the active marker follows the nearest target.
- Avoid labels/tooltips by default. Previous hover labels were visually noisy and created bracket-like artifacts.
- Avoid visible handles, pills, thumb controls, or scrollbar styling.

## Accessibility

The rail remains supplemental. The article must still be readable and scrollable without it.

- Keep each marker as a `button`.
- Keep accessible labels for each target.
- Do not trap normal page scrolling.
- Support keyboard focus without adding a large visible bracket or tooltip.
- Respect reduced motion by avoiding animated scrolling when reduced motion is requested.

## Failure Modes

If pointer or touch events are unavailable, the rail should still work through normal marker clicks.

If the article is too short to need a rail, keep hiding the rail.

If haptics are unsupported, do nothing.

If drag math fails for any reason, fall back to nearest-marker click behavior.

## Testing Plan

Test with:

- A short article with no headings.
- An article with one to four filtered headings.
- An article with five or more filtered headings.
- A long article on iPhone width.
- A wide desktop view on Mac.
- Pointer hover and click-drag behavior.
- Touch drag behavior in mobile emulation or device testing.
- Reduced motion mode.

Acceptance criteria:

- Users can tap the rail gutter without hitting the exact dash.
- Users can drag the rail gutter and land on predictable targets.
- Article scrolling remains normal outside the rail.
- No marker interaction opens the source article.
- The rail remains visually quiet at rest.
- The implementation does not reintroduce the top progress bar.
