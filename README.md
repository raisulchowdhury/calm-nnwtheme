# Calm

![Calm, a quiet serif theme for NetNewsWire](assets/social-preview.jpg)

A quiet serif theme for NetNewsWire on macOS, iPhone, and iPad.

Calm is tuned for long-form reading: a narrow article column, strong editorial
headings, soft source metadata, restrained links, light and dark appearances,
and a quiet reading map beside the article on wider screens. Compact layouts
stay rail-free.

[Install](#install) ·
[Latest release](https://github.com/raisulchowdhury/calm-nnwtheme/releases/latest) ·
[Report a theme issue](https://github.com/raisulchowdhury/calm-nnwtheme/issues/new?template=theme_issue.yml) ·
[Contribute](CONTRIBUTING.md)

## Screenshots

| Desktop light | Desktop dark |
| --- | --- |
| <img src="assets/screenshots/calm-light.png" alt="Calm light theme showing a long-form article with an opening image" width="520"> | <img src="assets/screenshots/calm-dark.png" alt="Calm dark theme showing the intent-revealed section label beside the article" width="520"> |

| Structured article | iPad |
| --- | --- |
| <img src="assets/screenshots/calm-structured-light.png" alt="Calm light theme showing source identity, reading time, and a structured article" width="520"> | <img src="assets/screenshots/calm-ipad-light.png" alt="Calm on iPad with the marker-only reading map beside the article" width="400"> |

| iPhone light | iPhone dark |
| --- | --- |
| <img src="assets/screenshots/calm-ios-light.png" alt="Calm rail-free compact layout on iPhone in light mode" width="195"> | <img src="assets/screenshots/calm-ios-dark.png" alt="Calm rail-free compact layout on iPhone in dark mode" width="195"> |

Screenshots use
[“If You’re So Smart, Why Aren’t You Happy?”](https://navalsarchive.substack.com/p/if-youre-so-smart-why-arent-you-happy)
from Naval’s Archive and
[“You Can’t Max a Life”](https://yewjin.substack.com/p/you-cant-max-a-life)
by Yew Jin Lim.

## Install

### iPhone and iPad

Open this link on the device with NetNewsWire installed:

[Install Calm in NetNewsWire](netnewswire://theme/add?url=https%3A%2F%2Fgithub.com%2Fraisulchowdhury%2Fcalm-nnwtheme%2Freleases%2Flatest%2Fdownload%2FCalm.nnwtheme.zip)

If the link is not tappable in your current app, copy the full URL into Safari:

```text
netnewswire://theme/add?url=https%3A%2F%2Fgithub.com%2Fraisulchowdhury%2Fcalm-nnwtheme%2Freleases%2Flatest%2Fdownload%2FCalm.nnwtheme.zip
```

NetNewsWire fetches the package itself, so the release asset must be publicly
accessible without a GitHub login. Opening the raw zip in Safari or the GitHub
app only downloads it; the `netnewswire://` link invokes NetNewsWire's theme
installer.

### macOS

Use the same one-tap install link above, or download the latest package and open
the bundle manually:

[Calm.nnwtheme.zip](https://github.com/raisulchowdhury/calm-nnwtheme/releases/latest/download/Calm.nnwtheme.zip)

```sh
unzip Calm.nnwtheme.zip
open Calm.nnwtheme
```

The repository also keeps the current package at
[Calm.nnwtheme.zip](Calm.nnwtheme.zip). NetNewsWire documents the bundle format
and installer URL in its
[theme technote](https://github.com/Ranchero-Software/NetNewsWire/blob/main/Technotes/Themes.md).

## Compatibility

Calm follows NetNewsWire's documented theme bundle format and uses only the
HTML, CSS, and JavaScript supported by that reader surface. Automated checks
cover the theme on macOS runners, while the preview matrix covers desktop,
iPad, Split View, iPhone, light, dark, precise-pointer, and coarse-pointer
layouts.

NetNewsWire and WebKit updates can still affect rendering. When reporting an
issue, include your device, OS version, NetNewsWire version, Calm version,
window mode, text size, and a screenshot.

## Design Notes

Calm uses the system serif stack that best matches Apple's reader surfaces:

```css
"Iowan Old Style", "Charter", "Bitstream Charter", "Sitka Text", Cambria, Georgia, "Times New Roman", Times, serif
```

The theme includes:

- system light and dark mode
- iOS Dynamic Type support with a small Calm-specific size bump
- a reading map beside the centered article on wider screens
- major-heading markers for highly structured articles and scroll-depth markers
  for simpler articles
- an intent-revealed active-section label on wide, precise-pointer layouts
- 44-point marker targets and marker-only feedback on iPad
- a rail-free compact layout for phone, Split View, and short coarse landscape
- textual source identity and conditional reading time in the opening metadata
- no persistent statistics footer or visible word count
- image blending in light mode
- restrained code, table, blockquote, and figure styling

## Development

The source theme lives in:

```text
Calm.nnwtheme/
```

The bundle must contain exactly:

```text
Info.plist
stylesheet.css
template.html
```

Validate changes:

```sh
scripts/validate.sh
```

The validator uses standard macOS tools (`plutil`, `ditto`, and `unzip`) plus
Node.js. GitHub Actions runs the same suite for every pull request and every
push to `main`.

The validation runner checks:

- `Info.plist` syntax
- theme and preview inline JavaScript syntax
- theme and preview inline JavaScript parity
- responsive title hierarchy and article-relative rail geometry
- compact rail removal, touch-capable interaction targets, and keyboard focus
- conditional reading time, robust metadata separators, and footer removal
- heading-only intent labels, coarse-pointer suppression, and reduced motion
- release version, documentation, and shipped screenshot synchronization
- root zip content against `Calm.nnwtheme/`

Build an installable zip:

```sh
ditto -c -k --norsrc --keepParent Calm.nnwtheme Calm.nnwtheme.zip
```

The root `Calm.nnwtheme.zip` is committed for direct access. GitHub Releases
publish that same rebuilt file.

## Preview

The local preview page is only for screenshots and quick visual checks:

```text
preview/index.html
```

It uses the real theme stylesheet from `Calm.nnwtheme/stylesheet.css`.

## Support

Use the
[Calm issue form](https://github.com/raisulchowdhury/calm-nnwtheme/issues/new?template=theme_issue.yml)
for theme-specific rendering or interaction problems. If the same problem
appears in NetNewsWire's built-in themes, report it to the
[NetNewsWire project](https://github.com/Ranchero-Software/NetNewsWire/issues/new/choose).

Pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the
project's design constraints, test matrix, and packaging rules.

## Credits

Made by Raisul Chowdhury.

Calm is not affiliated with NetNewsWire or Ranchero Software.

## License

MIT. See [LICENSE](LICENSE). Community participation is covered by the
[Code of Conduct](CODE_OF_CONDUCT.md), and security reports should follow
[SECURITY.md](SECURITY.md).
