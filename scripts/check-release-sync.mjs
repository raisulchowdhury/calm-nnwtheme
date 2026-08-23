import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";

const info = readFileSync("Calm.nnwtheme/Info.plist", "utf8");
const readme = readFileSync("README.md", "utf8");
const changelog = readFileSync("CHANGELOG.md", "utf8");
const specification = readFileSync(
	"docs/specs/2026-07-24-v1.4-reading-craft-design.md",
	"utf8",
);
const releaseNotes = readFileSync(
	"docs/releases/2026-08-23-calm-1.4.1.md",
	"utf8",
);
const workflow = readFileSync(".github/workflows/validate.yml", "utf8");
const releaseWorkflow = readFileSync(".github/workflows/release.yml", "utf8");

assert.match(info, /<key>Version<\/key>\s*<integer>12<\/integer>/, "theme version should be 12");
assert.match(changelog, /^## 1\.4\.1 - 2026-08-23$/m, "changelog should include v1.4.1");
assert.match(releaseNotes, /^# Calm 1\.4\.1$/m, "release notes should identify Calm 1.4.1");
assert.match(
	specification,
	/All four checkpoints were implemented, accepted, and synchronized/,
	"spec should be synchronized",
);
assert.ok(
	!specification.includes("codex/calm-v1.4-staged") &&
		!specification.includes("localhost:8765"),
	"public specification should not include local review instructions",
);
assert.match(
	readme,
	/https:\/\/raisul\.xyz\/calm/,
	"README should lead with the dedicated installation page",
);
assert.match(
	readme,
	/netnewswire:\/\/theme\/add\?url=/,
	"README should include NetNewsWire's install URL",
);
assert.ok(
	!readme.includes("](netnewswire://"),
	"README should not use a custom-scheme Markdown link that GitHub strips",
);
assert.match(
	readme,
	/copy the full installer\s+URL/i,
	"README should explain how to open the installer URL from GitHub",
);
assert.match(
	readme,
	/release asset must be\s+publicly accessible/,
	"README should explain the public asset requirement",
);
assert.ok(
	!readme.includes("word count and estimated read time footer"),
	"README should not advertise the removed statistics footer",
);
assert.match(
	workflow,
	/actions\/checkout@v7[\s\S]*actions\/setup-node@v7[\s\S]*scripts\/validate\.sh/,
	"GitHub Actions should run the release validator with current actions",
);
assert.match(
	workflow,
	/playwright install --with-deps webkit chromium[\s\S]*npm run test:browser/,
	"GitHub Actions should run the WebKit and visual regression suite",
);
assert.match(
	releaseWorkflow,
	/permissions:\s*\n\s*contents: write/,
	"the release workflow should request only the repository write permission it needs",
);
assert.match(
	releaseWorkflow,
	/workflows:\s*\n\s*- Validate theme[\s\S]*workflow_run\.conclusion == 'success'/,
	"the release workflow should run only after the main validation workflow passes",
);
assert.match(
	releaseWorkflow,
	/scripts\/validate\.sh[\s\S]*gh release (?:upload|create)[\s\S]*Calm\.nnwtheme\.zip/,
	"the release workflow should validate and publish the installable package",
);
assert.match(
	releaseWorkflow,
	/gh release download[\s\S]*cmp -s Calm\.nnwtheme\.zip[\s\S]*gh release upload[\s\S]*--clobber/,
	"the release workflow should reconcile a missing or stale existing asset",
);

const communityFiles = [
	"CONTRIBUTING.md",
	"CODE_OF_CONDUCT.md",
	"SECURITY.md",
	".github/ISSUE_TEMPLATE/theme_issue.yml",
	".github/pull_request_template.md",
	"docs/qa/2026-07-24-calm-v1.4.md",
	"docs/specs/2026-06-05-rail-tap-scrub-design.md",
];

for (const file of communityFiles) {
	assert.ok(statSync(file).size > 0, `${file} should not be empty`);
}

assert.ok(
	!existsSync("design-qa.md") &&
		!existsSync("docs/superpowers/plans/2026-06-26-rail-free-compact-mobile.md") &&
		!existsSync("docs/superpowers/specs/2026-06-05-rail-tap-scrub-design.md"),
	"obsolete root and agent-workflow documents should be removed",
);

const socialPreview = "assets/social-preview.jpg";
const jpegSignature = Buffer.from([0xff, 0xd8, 0xff]);
assert.ok(readme.includes(socialPreview), "README should reference the social preview");
assert.ok(statSync(socialPreview).size < 1_000_000, "social preview should be under 1 MB");
assert.deepEqual(
	readFileSync(socialPreview).subarray(0, jpegSignature.length),
	jpegSignature,
	"social preview should be a JPEG",
);

const screenshots = [
	"assets/screenshots/calm-light.png",
	"assets/screenshots/calm-dark.png",
	"assets/screenshots/calm-structured-light.png",
	"assets/screenshots/calm-ipad-light.png",
	"assets/screenshots/calm-ios-light.png",
	"assets/screenshots/calm-ios-dark.png",
];
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

for (const screenshot of screenshots) {
	assert.ok(readme.includes(screenshot), `README should reference ${screenshot}`);
	assert.ok(statSync(screenshot).size > pngSignature.length, `${screenshot} should not be empty`);
	assert.deepEqual(
		readFileSync(screenshot).subarray(0, pngSignature.length),
		pngSignature,
		`${screenshot} should be a PNG`,
	);
}
