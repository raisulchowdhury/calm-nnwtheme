# Calm

A quiet serif theme for NetNewsWire on macOS and iOS.

Calm is tuned for long-form reading: a narrow article column, strong editorial headings, soft metadata, restrained links, light and dark appearances, and a quiet section rail that adapts to article structure.

## Screenshots

| Light | Dark |
| --- | --- |
| <img src="assets/screenshots/calm-light.png" alt="Calm light theme screenshot" width="520"> | <img src="assets/screenshots/calm-dark.png" alt="Calm dark theme screenshot" width="520"> |

<img src="assets/screenshots/calm-ios-light.png" alt="Calm compact iOS preview" width="320">

## Install

Download the latest release:

[Calm.nnwtheme.zip](https://github.com/raisulchowdhury/calm-nnwtheme/releases/latest/download/Calm.nnwtheme.zip)

Then open the zip with NetNewsWire, or use NetNewsWire's theme URL scheme after this repository is public:

```text
netnewswire://theme/add?url=https%3A%2F%2Fgithub.com%2Fraisulchowdhury%2Fcalm-nnwtheme%2Freleases%2Flatest%2Fdownload%2FCalm.nnwtheme.zip
```

On macOS, you can also install the bundle manually:

```sh
unzip Calm.nnwtheme.zip
open Calm.nnwtheme
```

## Design Notes

Calm uses the system serif stack that best matches Apple's reader surfaces:

```css
"Iowan Old Style", "Charter", "Bitstream Charter", "Sitka Text", Cambria, Georgia, "Times New Roman", Times, serif
```

The theme includes:

- system light and dark mode
- iOS Dynamic Type support with a small Calm-specific size bump
- responsive section rail that uses major headings for highly structured articles and scroll-depth markers for simpler articles
- word count and estimated read time footer
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
plutil -lint Calm.nnwtheme/Info.plist
node --check <(sed -n '/<script>/,/<\/script>/p' Calm.nnwtheme/template.html | sed '1d;$d')
```

Build an installable zip:

```sh
ditto -c -k --norsrc --keepParent Calm.nnwtheme Calm.nnwtheme.zip
```

Generated zips are published through GitHub Releases, not committed to the repository.

## Preview

The local preview page is only for screenshots and quick visual checks:

```text
preview/index.html
```

It uses the real theme stylesheet from `Calm.nnwtheme/stylesheet.css`.

## Credits

Made by Raisul Chowdhury.

Calm is not affiliated with NetNewsWire, Ranchero Software, or Obsidian.

## License

MIT. See [LICENSE](LICENSE).
