#!/usr/bin/env bash
set -euo pipefail

plutil -lint Calm.nnwtheme/Info.plist
node --check <(sed -n '/<script>/,/<\/script>/p' Calm.nnwtheme/template.html | sed '1d;$d')
node --check <(sed -n '/<script>/,/<\/script>/p' preview/index.html | sed '1d;$d')
node scripts/check-scripts.mjs
node scripts/check-compact-rail.mjs

tmpdir="$(mktemp -d)"
cleanup() {
	rm -rf "$tmpdir"
}
trap cleanup EXIT

unzip -q Calm.nnwtheme.zip -d "$tmpdir"
diff -qr Calm.nnwtheme "$tmpdir/Calm.nnwtheme"
