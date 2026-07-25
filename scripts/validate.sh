#!/usr/bin/env bash
set -euo pipefail

plutil -lint Calm.nnwtheme/Info.plist
node --check <(sed -n '/<script>/,/<\/script>/p' Calm.nnwtheme/template.html | sed '1d;$d')
node --check <(sed -n '/<script>/,/<\/script>/p' preview/index.html | sed '1d;$d')
node scripts/check-scripts.mjs
node scripts/check-compact-rail.mjs
node scripts/check-heading-rail-targets.mjs
node scripts/check-interaction-polish.mjs
node scripts/check-reading-time.mjs
node scripts/check-rail-context.mjs
node scripts/check-release-sync.mjs

social_width="$(sips -g pixelWidth assets/social-preview.jpg 2>/dev/null | awk '/pixelWidth/ { print $2 }')"
social_height="$(sips -g pixelHeight assets/social-preview.jpg 2>/dev/null | awk '/pixelHeight/ { print $2 }')"
test "$social_width" = "1280"
test "$social_height" = "640"

tmpdir="$(mktemp -d)"
cleanup() {
	rm -rf "$tmpdir"
}
trap cleanup EXIT

unzip -q Calm.nnwtheme.zip -d "$tmpdir"
diff -qr Calm.nnwtheme "$tmpdir/Calm.nnwtheme"
