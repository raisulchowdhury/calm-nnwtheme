# Rail-Free Compact Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Calm 1.3.0 with a rail-free compact mobile reader layout while preserving the existing hybrid Tap + Scrub section rail on wider screens.

**Architecture:** Treat compact rail behavior as a shared breakpoint contract used by CSS and JavaScript: `(max-width: 820px), (pointer: coarse) and (max-height: 500px)`. CSS removes the compact rail and left gutter; JavaScript skips rail initialization when the same media query matches. Validation scripts enforce source/preview script parity, compact rail rules, and package/source alignment before release.

**Tech Stack:** NetNewsWire theme bundle (`Info.plist`, `stylesheet.css`, `template.html`), inline browser JavaScript, static HTML preview, Node.js validation scripts, Bash validation runner, macOS `plutil`, `ditto`, GitHub CLI.

## Global Constraints

- Compact rail breakpoint: `(max-width: 820px), (pointer: coarse) and (max-height: 500px)`.
- Compact mobile behavior: no section rail, no invisible rail gutter, no extra left padding, and no rail interaction listeners.
- Wider-screen behavior: keep the existing hybrid rail model, with heading targets for structured articles and five scroll-depth markers for simpler articles.
- Release version: changelog `1.3.0 - 2026-06-26`; internal `Info.plist` `Version` must be `9`.
- Keep `Calm.nnwtheme/template.html` and `preview/index.html` inline scripts byte-identical after trimming the wrapping `<script>` tags.
- Keep `Calm.nnwtheme.zip` committed at the repository root and publish the same file through GitHub Releases.
- Do not change desktop rail typography, colors, heading filtering, scrubbing math, reduced-motion behavior, or footer behavior in this pass.
- Do not publish or push unless the active user has approved execution of the release step.

---

## File Structure

- Modify `docs/superpowers/specs/2026-06-05-rail-tap-scrub-design.md`: update the product rule so compact phone-width layouts hide the rail instead of improving touch operation.
- Create `scripts/extract-inline-script.mjs`: shared helper that extracts and trims the single inline `<script>` block from an HTML file.
- Create `scripts/check-scripts.mjs`: compares the theme and preview inline scripts for exact parity.
- Create `scripts/check-compact-rail.mjs`: static regression checks for the compact breakpoint, no compact left gutter, no compact rail display, and JavaScript init guard in both script copies.
- Create `scripts/validate.sh`: one command for plist lint, script syntax checks, script parity, compact behavior checks, and zip/source alignment.
- Modify `Calm.nnwtheme/stylesheet.css`: replace the compact rail styling with rail-free compact CSS and adjust the WebKit block so it does not restore the phone gutter.
- Modify `Calm.nnwtheme/template.html`: add the compact media-query guard and skip `initToc()` setup on compact layouts.
- Modify `preview/index.html`: apply the same inline script changes as `template.html`; update preview copy where it implies the rail appears on compact layouts.
- Modify `Calm.nnwtheme/Info.plist`: bump internal `Version` from `8` to `9`.
- Modify `CHANGELOG.md`: add `1.3.0 - 2026-06-26` release notes.
- Modify `README.md`: describe wider-screen rail and rail-free compact mobile behavior; update validation command references.
- Modify `.github/pull_request_template.md`: include checklist items for script parity, compact rail behavior, and rebuilt zip.
- Modify `Calm.nnwtheme.zip`: rebuild from the final `Calm.nnwtheme/` source with `ditto`.

---

### Task 1: Update The Rail Design Spec

**Files:**
- Modify: `docs/superpowers/specs/2026-06-05-rail-tap-scrub-design.md:38-58`

**Interfaces:**
- Consumes: Existing rail spec sections `Device Behavior`, `Accessibility`, `Testing Plan`.
- Produces: A documented compact mobile contract used by CSS and JavaScript tasks: compact layouts hide the rail entirely; wider tablet and desktop layouts keep Tap + Scrub.

- [ ] **Step 1: Confirm the current spec still says iPhone gets a gutter**

Run:

```bash
rg -n "### iPhone|28-36px|The rail remains supplemental" docs/superpowers/specs/2026-06-05-rail-tap-scrub-design.md
```

Expected output includes:

```text
40:### iPhone
44:- Use a generous invisible left gutter, roughly 28-36px wide.
104:The rail remains supplemental. The article must still be readable and scrollable without it.
```

- [ ] **Step 2: Replace the iPhone and iPad device behavior sections**

Edit `docs/superpowers/specs/2026-06-05-rail-tap-scrub-design.md` so the `## Device Behavior` section reads:

```markdown
## Device Behavior

### Compact Mobile

On phone-width layouts, Calm hides the section rail entirely.

Rationale:

- The rail is supplemental, not required for reading.
- A usable touch target requires a visible or invisible gutter that competes with the article.
- Compact reading should prioritize uninterrupted vertical flow.

Compact mobile layouts must not render the rail, reserve an invisible rail gutter, or initialize rail interaction listeners.

### Larger Tablet

Larger tablets keep the rail when there is enough room for it to sit outside the reader column without becoming visually dominant.

- Touch follows the same Tap + Scrub model as wider screens.
- Pointer hover can raise marker contrast slightly.
- Pointer click jumps to the nearest target.
- Pointer drag scrubs through the target set.
- The rail may sit slightly farther from the article text than compact phone layouts because the canvas is wider.

### Mac

Mac behavior should respect pointer precision but still keep the large-target idea.

- Default state stays quiet.
- Hover over the rail gutter raises confidence through slightly stronger contrast.
- Click anywhere in the gutter jumps to the nearest target.
- Click-drag scrubs through targets.
- Trackpad or mouse wheel scrolling should remain normal page scrolling. Do not hijack wheel events unless there is a later explicit reason.
```

- [ ] **Step 3: Update the testing plan wording**

In the same spec, replace the testing bullets for iPhone and desktop with:

```markdown
- A long article on phone-width portrait: no rail, no reserved left gutter, normal vertical scrolling.
- A long article on phone-width landscape with coarse pointer and short height: no rail, no reserved left gutter.
- A long article on wider tablet or desktop: rail appears when the article is long enough.
```

Replace the acceptance criteria with:

```markdown
Acceptance criteria:

- Compact mobile layouts show no rail and reserve no rail gutter.
- Compact mobile layouts do not initialize rail interaction listeners.
- Wider layouts can tap the rail gutter without hitting the exact dash.
- Wider layouts can drag the rail gutter and land on predictable targets.
- Article scrolling remains normal outside the rail.
- No marker interaction opens the source article.
- The rail remains visually quiet at rest on wider screens.
- The implementation does not reintroduce the top progress bar.
```

- [ ] **Step 4: Verify the spec no longer instructs iPhone rail behavior**

Run:

```bash
rg -n "28-36px|iPhone model|Compact Mobile|no rail|interaction listeners" docs/superpowers/specs/2026-06-05-rail-tap-scrub-design.md
```

Expected:

```text
No matches for 28-36px or iPhone model.
Matches for Compact Mobile, no rail, and interaction listeners.
```

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-06-05-rail-tap-scrub-design.md
git commit -m "Document compact mobile rail behavior"
```

---

### Task 2: Add Validation Scripts

**Files:**
- Create: `scripts/extract-inline-script.mjs`
- Create: `scripts/check-scripts.mjs`
- Create: `scripts/validate.sh`
- Modify: `README.md:69-84`
- Modify: `.github/pull_request_template.md`

**Interfaces:**
- Produces: `extractInlineScript(path: string): string` exported by `scripts/extract-inline-script.mjs`.
- Produces: `scripts/check-scripts.mjs`, a Node executable that exits `0` when theme and preview scripts are identical and `1` when they differ.
- Produces: `scripts/validate.sh`, a Bash executable that runs the repo validation suite.
- Consumes: `Calm.nnwtheme/template.html`, `preview/index.html`, `Calm.nnwtheme/Info.plist`, `Calm.nnwtheme.zip`.

- [ ] **Step 1: Run the missing validation command to establish the failing baseline**

Run:

```bash
bash scripts/validate.sh
```

Expected:

```text
bash: scripts/validate.sh: No such file or directory
```

- [ ] **Step 2: Create the inline script extractor**

Create `scripts/extract-inline-script.mjs`:

```javascript
import { readFileSync } from "node:fs";

export function extractInlineScript(path) {
	const html = readFileSync(path, "utf8");
	const matches = Array.from(html.matchAll(/<script>\s*([\s\S]*?)\s*<\/script>/g));
	if (matches.length !== 1) {
		throw new Error(`${path} must contain exactly one inline script; found ${matches.length}`);
	}
	return matches[0][1].trim();
}
```

- [ ] **Step 3: Create the script parity check**

Create `scripts/check-scripts.mjs`:

```javascript
import { extractInlineScript } from "./extract-inline-script.mjs";

const themeScript = extractInlineScript("Calm.nnwtheme/template.html");
const previewScript = extractInlineScript("preview/index.html");

if (themeScript !== previewScript) {
	console.error("Template and preview scripts differ.");
	process.exit(1);
}
```

- [ ] **Step 4: Create the validation runner**

Create `scripts/validate.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

plutil -lint Calm.nnwtheme/Info.plist
node --check <(sed -n '/<script>/,/<\/script>/p' Calm.nnwtheme/template.html | sed '1d;$d')
node --check <(sed -n '/<script>/,/<\/script>/p' preview/index.html | sed '1d;$d')
node scripts/check-scripts.mjs

tmpdir="$(mktemp -d)"
cleanup() {
	rm -rf "$tmpdir"
}
trap cleanup EXIT

unzip -q Calm.nnwtheme.zip -d "$tmpdir"
diff -qr Calm.nnwtheme "$tmpdir/Calm.nnwtheme"
```

- [ ] **Step 5: Make the validation runner executable**

Run:

```bash
chmod +x scripts/validate.sh
```

Expected: command exits `0`.

- [ ] **Step 6: Run validation**

Run:

```bash
scripts/validate.sh
```

Expected:

```text
Calm.nnwtheme/Info.plist: OK
```

No output from `node --check`, `check-scripts.mjs`, or `diff` means those checks passed.

- [ ] **Step 7: Update README validation instructions**

Replace the current manual validation command block in `README.md` with:

````markdown
Validate changes:

```sh
scripts/validate.sh
```

The validation runner checks:

- `Info.plist` syntax
- theme and preview inline JavaScript syntax
- theme and preview inline JavaScript parity
- root zip content against `Calm.nnwtheme/`
```
````

- [ ] **Step 8: Update the PR checklist**

Edit `.github/pull_request_template.md` so its validation checklist includes these exact items:

```markdown
- [ ] `scripts/validate.sh`
- [ ] Phone-width preview has no rail and no left gutter
- [ ] Desktop preview still has the section rail
- [ ] Changelog and `Info.plist` version updated
- [ ] `Calm.nnwtheme.zip` rebuilt if releasing
```

- [ ] **Step 9: Verify README and PR template mention the validation runner**

Run:

```bash
rg -n "scripts/validate.sh|Phone-width preview has no rail|Desktop preview still has the section rail" README.md .github/pull_request_template.md
```

Expected output includes one README match and PR template checklist matches.

- [ ] **Step 10: Commit**

```bash
git add scripts/extract-inline-script.mjs scripts/check-scripts.mjs scripts/validate.sh README.md .github/pull_request_template.md
git commit -m "Add Calm validation scripts"
```

---

### Task 3: Implement Rail-Free Compact Layout

**Files:**
- Create: `scripts/check-compact-rail.mjs`
- Modify: `scripts/validate.sh`
- Modify: `Calm.nnwtheme/stylesheet.css:754-838`
- Modify: `Calm.nnwtheme/template.html:56-110`
- Modify: `preview/index.html:71-125`

**Interfaces:**
- Consumes: `extractInlineScript(path: string): string` from `scripts/extract-inline-script.mjs`.
- Produces: `shouldDisableRail(): boolean` in both inline scripts.
- Produces: `compactRailQuery: MediaQueryList | null` in both inline scripts.
- Produces: Compact CSS contract: `@media (max-width: 820px), (pointer: coarse) and (max-height: 500px)`.

- [ ] **Step 1: Add the compact rail regression check**

Create `scripts/check-compact-rail.mjs`:

```javascript
import { readFileSync } from "node:fs";
import { extractInlineScript } from "./extract-inline-script.mjs";

const stylesheet = readFileSync("Calm.nnwtheme/stylesheet.css", "utf8");
const templateScript = extractInlineScript("Calm.nnwtheme/template.html");
const previewScript = extractInlineScript("preview/index.html");
const compactQuery = "(max-width: 820px), (pointer: coarse) and (max-height: 500px)";

function assertContains(source, expected, label) {
	if (!source.includes(expected)) {
		console.error(`${label} is missing: ${expected}`);
		process.exit(1);
	}
}

function assertNotContains(source, forbidden, label) {
	if (source.includes(forbidden)) {
		console.error(`${label} still contains forbidden text: ${forbidden}`);
		process.exit(1);
	}
}

assertContains(stylesheet, `@media ${compactQuery}`, "stylesheet.css");
assertContains(stylesheet, ".readerToc,\n\t.readerToc:not([hidden]) {\n\t\tdisplay: none !important;\n\t}", "stylesheet.css compact rail rule");
assertContains(stylesheet, "@media (min-width: 821px) and (min-height: 501px)", "stylesheet.css WebKit wide-screen guard");
assertContains(stylesheet, "padding: 34px 20px 56px;", "stylesheet.css compact body padding");
assertContains(stylesheet, "padding: 30px 20px 56px;", "stylesheet.css WebKit compact body padding");
assertNotContains(stylesheet, "@media (max-width: 760px)", "stylesheet.css");
assertNotContains(stylesheet, "padding: 34px 20px 56px 42px", "stylesheet.css");
assertNotContains(stylesheet, "padding: 30px 20px 56px 42px", "stylesheet.css");

for (const [label, script] of [
	["template.html script", templateScript],
	["preview/index.html script", previewScript],
]) {
	assertContains(script, `window.matchMedia("${compactQuery}")`, label);
	assertContains(script, "function shouldDisableRail() {", label);
	assertContains(script, "shouldDisableRail()", label);
	assertContains(script, "if (!body || !toc || !tocList || shouldDisableRail())", label);
}
```

- [ ] **Step 2: Wire the compact rail check into validation**

Modify `scripts/validate.sh` so it includes `node scripts/check-compact-rail.mjs` after `node scripts/check-scripts.mjs`:

```bash
node scripts/check-scripts.mjs
node scripts/check-compact-rail.mjs
```

- [ ] **Step 3: Run the compact rail check to verify it fails before implementation**

Run:

```bash
node scripts/check-compact-rail.mjs
```

Expected:

```text
stylesheet.css is missing: @media (max-width: 820px), (pointer: coarse) and (max-height: 500px)
```

- [ ] **Step 4: Replace the compact CSS block**

In `Calm.nnwtheme/stylesheet.css`, replace the entire `@media (max-width: 760px) { ... }` block with:

```css
@media (max-width: 820px), (pointer: coarse) and (max-height: 500px) {
	body {
		padding: 34px 20px 56px;
	}

	.readerToc,
	.readerToc:not([hidden]) {
		display: none !important;
	}

	.articleHeader {
		margin-bottom: 2rem;
	}

	.articleTitle h1 {
		font-size: calc(var(--reader-base-size) * 1.6);
	}

	.articleMeta {
		font-size: 0.92rem;
	}

	.articleBody {
		--reader-font-size: 18.5px;
		max-width: 100%;
	}

	.articleBody img,
	.articleBody video,
	.articleBody figure,
	.articleBody iframe {
		margin-top: 2rem;
		margin-bottom: 2rem;
	}
}
```

- [ ] **Step 5: Replace the WebKit support block**

In `Calm.nnwtheme/stylesheet.css`, replace the existing `@supports (-webkit-touch-callout: none) { ... }` block with:

```css
@supports (-webkit-touch-callout: none) {
	body {
		padding: 30px 20px 56px;
		word-break: break-word;
		-webkit-hyphens: auto;
	}

	@media (min-width: 821px) and (min-height: 501px) {
		body {
			padding-left: 42px;
		}
	}

	.articleBody {
		line-height: 1.6;
	}
}
```

- [ ] **Step 6: Add the compact rail media-query guard to the theme script**

In `Calm.nnwtheme/template.html`, insert this block after the `externalLinkAnchor` variable:

```javascript
	var compactRailQuery = window.matchMedia ?
		window.matchMedia("(max-width: 820px), (pointer: coarse) and (max-height: 500px)") :
		null;

	function shouldDisableRail() {
		return compactRailQuery && compactRailQuery.matches;
	}
```

Then replace the start of `initToc()` with:

```javascript
	function initToc() {
		if (!body || !toc || !tocList || shouldDisableRail()) {
			if (toc) {
				toc.hidden = true;
			}
			return;
		}
```

- [ ] **Step 7: Apply the same script changes to the preview**

Make the identical `compactRailQuery`, `shouldDisableRail()`, and `initToc()` guard changes in `preview/index.html`.

- [ ] **Step 8: Update preview article copy so it does not imply compact rail availability**

In `preview/index.html`, replace:

```html
<p>Deeper headings should still appear in the generated section rail when the viewport has enough room for it.</p>
```

With:

```html
<p>Deeper headings still appear in the generated section rail on wider screens, while compact mobile keeps the page rail-free.</p>
```

- [ ] **Step 9: Run compact behavior validation**

Run:

```bash
node scripts/check-compact-rail.mjs
```

Expected: no output and exit `0`.

- [ ] **Step 10: Run full validation**

Run:

```bash
scripts/validate.sh
```

Expected:

```text
Calm.nnwtheme/Info.plist: OK
```

No output from Node checks or `diff` means those checks passed.

- [ ] **Step 11: Commit**

```bash
git add scripts/check-compact-rail.mjs scripts/validate.sh Calm.nnwtheme/stylesheet.css Calm.nnwtheme/template.html preview/index.html
git commit -m "Hide section rail on compact mobile"
```

---

### Task 4: Update Version, Public Docs, And Package

**Files:**
- Modify: `Calm.nnwtheme/Info.plist:13-14`
- Modify: `CHANGELOG.md:1-12`
- Modify: `README.md:5-52`
- Modify: `Calm.nnwtheme.zip`

**Interfaces:**
- Consumes: Final `Calm.nnwtheme/` bundle from Task 3.
- Produces: Root package `Calm.nnwtheme.zip` that expands exactly to the final `Calm.nnwtheme/` directory.
- Produces: Public version metadata: changelog `1.3.0 - 2026-06-26`, internal bundle `Version` `9`.

- [ ] **Step 1: Update internal theme version**

In `Calm.nnwtheme/Info.plist`, replace:

```xml
	<key>Version</key>
	<integer>8</integer>
```

With:

```xml
	<key>Version</key>
	<integer>9</integer>
```

- [ ] **Step 2: Add the changelog entry**

Insert this entry at the top of `CHANGELOG.md`, immediately after `# Changelog`:

```markdown
## 1.3.0 - 2026-06-26

- Removed the section rail from compact mobile layouts so phone reading is quieter and no longer reserves a left rail gutter.
- Kept the section rail on wider tablet and desktop layouts.
- Prevented compact mobile layouts from initializing rail interaction JavaScript.
- Added validation checks for theme/preview script parity, compact rail behavior, and package/source alignment.
- Bumped the internal theme version to `9`.
```

- [ ] **Step 3: Update README theme description**

Replace the README opening description:

```markdown
Calm is tuned for long-form reading: a narrow article column, strong editorial headings, soft metadata, restrained links, light and dark appearances, and a quiet section rail that adapts to article structure.
```

With:

```markdown
Calm is tuned for long-form reading: a narrow article column, strong editorial headings, soft metadata, restrained links, light and dark appearances, a quiet section rail on wider screens, and a rail-free compact mobile layout.
```

- [ ] **Step 4: Update README feature bullets**

Replace the README feature bullet:

```markdown
- responsive section rail that uses major headings for highly structured articles and scroll-depth markers for simpler articles
```

With these two bullets:

```markdown
- section rail on wider screens, using major headings for highly structured articles and scroll-depth markers for simpler articles
- rail-free compact mobile layout for uninterrupted phone reading
```

- [ ] **Step 5: Rebuild the root zip**

Run:

```bash
ditto -c -k --norsrc --keepParent Calm.nnwtheme Calm.nnwtheme.zip
```

Expected: command exits `0` and updates `Calm.nnwtheme.zip`.

- [ ] **Step 6: Run validation after the package rebuild**

Run:

```bash
scripts/validate.sh
```

Expected:

```text
Calm.nnwtheme/Info.plist: OK
```

No output from Node checks or `diff` means those checks passed.

- [ ] **Step 7: Verify package metadata**

Run:

```bash
tmpdir="$(mktemp -d)"
unzip -q Calm.nnwtheme.zip -d "$tmpdir"
plutil -p "$tmpdir/Calm.nnwtheme/Info.plist"
rm -rf "$tmpdir"
```

Expected output contains:

```text
"Version" => 9
```

- [ ] **Step 8: Commit**

```bash
git add Calm.nnwtheme/Info.plist CHANGELOG.md README.md Calm.nnwtheme.zip
git commit -m "Release Calm 1.3.0 package"
```

---

### Task 5: Manual Preview Verification

**Files:**
- Read: `preview/index.html`
- Read: `Calm.nnwtheme/stylesheet.css`
- Read: `Calm.nnwtheme/template.html`

**Interfaces:**
- Consumes: Final CSS and preview from Tasks 3 and 4.
- Produces: Manual evidence that compact viewports are rail-free and desktop viewports still show the rail.

- [ ] **Step 1: Start a local static server**

Run:

```bash
python3 -m http.server 8765
```

Expected:

```text
Serving HTTP on :: port 8765
```

Keep this process running until the end of this task.

- [ ] **Step 2: Inspect phone-width preview**

Open:

```text
http://localhost:8765/preview/
```

Use a viewport of `390x844`.

Expected:

```text
No section rail is visible.
The article left and right padding feel balanced.
There is no dead rail gutter on the left.
Vertical scrolling works normally.
```

- [ ] **Step 3: Inspect phone landscape preview**

Use a viewport of `844x390` with touch/coarse-pointer emulation if available.

Expected:

```text
No section rail is visible.
There is no left rail gutter.
Vertical scrolling works normally.
```

- [ ] **Step 4: Inspect desktop preview**

Use a viewport of `1280x900`.

Expected:

```text
The section rail is visible on the left when the preview article is long enough.
Rail markers respond to click.
Drag scrubbing still updates the active marker.
The page does not show a top progress bar.
```

- [ ] **Step 5: Stop the local server**

Stop the `python3 -m http.server 8765` process with `Ctrl-C`.

Expected:

```text
Keyboard interrupt received, exiting.
```

- [ ] **Step 6: Record manual verification in the final implementation report**

Use this exact wording in the implementation report after the checks pass:

```markdown
Manual preview checks:
- `390x844`: no rail, no left gutter, normal vertical scrolling.
- `844x390` coarse-pointer landscape: no rail, no left gutter, normal vertical scrolling.
- `1280x900`: rail visible, click and drag interactions still work, no top progress bar.
```

---

### Task 6: Publish The 1.3.0 Release

**Files:**
- Push: current branch `main`
- Tag: `v1.3.0`
- Release asset: `Calm.nnwtheme.zip`

**Interfaces:**
- Consumes: Final committed package from Task 4 and manual evidence from Task 5.
- Produces: GitHub release `Calm 1.3.0` with `Calm.nnwtheme.zip` asset matching the committed root zip.

- [ ] **Step 1: Verify the working tree is clean before publishing**

Run:

```bash
git status --short --branch
```

Expected:

```text
## main...origin/main [ahead 4]
```

The exact ahead count may differ if commits were squashed during implementation. There must be no unstaged or untracked files other than ignored `.DS_Store` or `.superpowers/`.

- [ ] **Step 2: Run final validation**

Run:

```bash
scripts/validate.sh
```

Expected:

```text
Calm.nnwtheme/Info.plist: OK
```

No output from Node checks or `diff` means those checks passed.

- [ ] **Step 3: Push main**

Run only after the active user approves release execution:

```bash
git push origin main
```

Expected output includes:

```text
main -> main
```

- [ ] **Step 4: Create the GitHub release**

Run:

```bash
notes="$(awk '/^## 1\.3\.0 /{flag=1; next} /^## /{flag=0} flag{print}' CHANGELOG.md | sed '/^[[:space:]]*$/d')"
gh release create v1.3.0 Calm.nnwtheme.zip \
	--repo raisulchowdhury/calm-nnwtheme \
	--target "$(git rev-parse HEAD)" \
	--title "Calm 1.3.0" \
	--notes "$notes"
```

Expected output:

```text
https://github.com/raisulchowdhury/calm-nnwtheme/releases/tag/v1.3.0
```

- [ ] **Step 5: Verify GitHub release metadata and asset digest**

Run:

```bash
local_digest="$(shasum -a 256 Calm.nnwtheme.zip | awk '{print $1}')"
release_json="$(gh release view --repo raisulchowdhury/calm-nnwtheme --json tagName,name,targetCommitish,url,assets)"
echo "$release_json"
echo "local sha256:$local_digest"
```

Expected:

```text
The JSON tagName is v1.3.0.
The JSON name is Calm 1.3.0.
The release asset name is Calm.nnwtheme.zip.
The release asset digest equals sha256:$local_digest.
```

- [ ] **Step 6: Verify default latest release download**

Run:

```bash
tmpdir="$(mktemp -d)"
gh release download --repo raisulchowdhury/calm-nnwtheme --pattern "Calm.nnwtheme.zip" --dir "$tmpdir" >/dev/null
shasum -a 256 "$tmpdir/Calm.nnwtheme.zip"
unzip -q "$tmpdir/Calm.nnwtheme.zip" -d "$tmpdir/unzipped"
plutil -p "$tmpdir/unzipped/Calm.nnwtheme/Info.plist"
diff -qr Calm.nnwtheme "$tmpdir/unzipped/Calm.nnwtheme"
rm -rf "$tmpdir"
```

Expected output contains:

```text
"Version" => 9
```

No output from `diff` means the downloaded release zip matches source.

- [ ] **Step 7: Verify the root zip exists in the remote repo tree**

Run:

```bash
git fetch --prune --tags origin
git ls-tree --name-only origin/main Calm.nnwtheme.zip
gh api repos/raisulchowdhury/calm-nnwtheme/contents/Calm.nnwtheme.zip --jq '{name:.name, size:.size, html_url:.html_url}'
```

Expected output includes:

```text
Calm.nnwtheme.zip
{"html_url":"https://github.com/raisulchowdhury/calm-nnwtheme/blob/main/Calm.nnwtheme.zip","name":"Calm.nnwtheme.zip","size":
```

---

## Self-Review

**Spec coverage:** The plan covers compact mobile spec changes, CSS rail removal, JavaScript initialization guard, theme/preview script parity, README wording, changelog, internal version bump, package rebuild, manual preview checks, root zip, and GitHub release verification.

**Placeholder scan:** A red-flag phrase search was run against this plan; remaining matches are intentional file paths or checklist wording, not incomplete implementation instructions.

**Type consistency:** `extractInlineScript(path: string): string`, `compactRailQuery`, and `shouldDisableRail()` names are consistent across validation scripts and inline script tasks.
