## Summary

What changed, and why does it belong in Calm?

## Visual evidence

Add before-and-after screenshots for visual changes. Include relevant desktop,
iPad, Split View, and iPhone layouts.

## Validation

- [ ] `scripts/validate.sh`
- [ ] `git diff --check`
- [ ] Theme and preview behavior remain synchronized
- [ ] Compact layouts have no rail, reserved gutter, or rail listeners
- [ ] Coarse-pointer controls retain 44-point targets
- [ ] Keyboard focus and reduced motion were checked when relevant
- [ ] Light and dark appearances were checked when relevant
- [ ] `Calm.nnwtheme.zip` was rebuilt if theme source changed
- [ ] `CHANGELOG.md`, release notes, and `Info.plist` were updated if releasing
