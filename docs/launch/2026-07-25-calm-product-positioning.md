# Calm product positioning

Status: launch source for Calm 1.4.0

Last reviewed: 2026-07-25

## Product truth

Calm is a NetNewsWire theme for people who read long articles in their feed
reader. It combines an editorial serif reading surface with an adaptive,
scrubbable map that sits outside the article column on wide layouts and
disappears on compact ones.

The typography is part of Calm's character. The reading map is its distinctive
product idea.

## Audience

Primary:

- NetNewsWire users who regularly read essays, analysis, newsletters, and other
  long-form feeds on Mac or iPad
- readers who want orientation inside a long article without a persistent
  progress bar or an inline table of contents

Secondary:

- typography-conscious readers who want a consistent light and dark reading
  surface across Mac, iPad, and iPhone

Calm is not trying to turn NetNewsWire into a separate read-later app. It
improves the article surface and leaves the rest of the app alone.

## Positioning

### Tagline

Long-form navigation without reader chrome.

### One-line description

Calm is a NetNewsWire theme with an adaptive, scrubbable reading map on wide
layouts and a rail-free compact reading surface.

### Repository description

A NetNewsWire theme with an adaptive, scrubbable reading map on Mac and iPad,
and a rail-free iPhone layout.

## Message hierarchy

1. **The map adapts to the article.** Structured articles use major headings as
   destinations. Simpler articles use five depth markers, so Calm never invents
   a table of contents the source does not support.
2. **Navigation is direct.** Readers can click or tap a marker, use the keyboard,
   or scrub the rail to move through an article. Wide Mac layouts reveal the
   active heading only during interaction.
3. **The interface earns its space.** The rail stays outside the reading measure,
   uses coarse-pointer targets on iPad, and disappears with its listeners on
   phone, Split View, and short landscape layouts.
4. **Everything else stays quiet.** Source identity is visible. Reading time
   appears only when it is useful. Persistent progress, word count, and
   statistics chrome are absent.
5. **The reading craft is consistent.** The narrow measure, serif rhythm, media
   treatment, light and dark palettes, Dynamic Type behavior, focus states, and
   reduced-motion behavior work as one system.

## Competitive frame and claim guardrails

Most public NetNewsWire themes lead with typeface, color, density, or a visual
reference. Examples include
[MiaoYan](https://github.com/tw93/MiaoYan-NetNewsWire-Theme),
[Ember](https://github.com/dave-atx/ember-nnw-theme),
[Compakt](https://github.com/bmndc/Compakt.nnwtheme), and NetNewsWire's
[built-in themes](https://github.com/Ranchero-Software/NetNewsWire/tree/main/Themes).

A 2026-07-25 GitHub search audit covered 64 `template.html` files across 41
public repositories returned for NetNewsWire themes. One other project,
[nnw-toc-theme](https://github.com/victorlin/nnw-toc-theme), generates an inline
table of contents with heading links. In that audited set, Calm was the only
theme found with all of the following:

- a side rail outside the article measure
- heading targets for structured articles and depth targets for simpler ones
- pointer-based scrubbing with active-section tracking
- live removal and restoration across compact layout changes

This is strong evidence for distinctiveness, not proof that no unpublished,
private, unindexed, or future theme has similar behavior.

Safe public language:

- "An adaptive, scrubbable reading map built for NetNewsWire."
- "A reading map that adapts to the article, then gets out of the way."
- "Distinct among the public NetNewsWire themes we reviewed."

Avoid:

- "The first NetNewsWire theme..."
- "The only NetNewsWire theme..."
- "No other theme..."

## Launch surfaces

### GitHub repository

- Lead the README with the tagline and adaptive-map explanation.
- Keep the install action and latest release above the fold.
- Use the dark desktop screenshot as proof of the transient section label.
- Use the iPad and iPhone screenshots together to show deliberate adaptation,
  not a desktop layout squeezed onto smaller devices.
- Set the repository description to the one-line copy above.
- Upload `assets/social-preview.jpg` as GitHub's custom social preview.
- Keep topics centered on `netnewswire-theme`, `netnewswire`, `rss`, `reading`,
  `typography`, `macos`, `ios`, and `ipad`.

### Release

Lead the 1.4.0 notes with the product change:

> Calm now adapts its reading map to the article, then removes it when the
> layout cannot support it.

Follow with the implementation details and device-specific behavior.

### Discovery

Calm is not listed in the actively maintained
[NetNewsWire themes collection](https://github.com/PaiJi/NetNewsWire-themes-collection),
which already includes newer themes such as Ember. A focused pull request to
that directory is the clearest next distribution step after the owned GitHub
surfaces are aligned.

Any community forum post, directory pull request, or outreach should be
reviewed before it is sent because it acts outside the Calm repository.

## Missing launch asset

Static screenshots show the rail and active heading, but they cannot prove
scrubbing. The highest-value remaining asset is a short, silent loop that:

1. starts on a structured article in a wide Mac layout
2. presses the rail and scrubs through two or three headings
3. shows the active heading label change
4. ends on the article, not on a title card

Keep it under eight seconds. Use the real NetNewsWire app, crop tightly to the
article pane, and place it immediately after "What makes Calm different" in the
README.
