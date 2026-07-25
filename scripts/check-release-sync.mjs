import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const info = readFileSync("Calm.nnwtheme/Info.plist", "utf8");
const readme = readFileSync("README.md", "utf8");
const changelog = readFileSync("CHANGELOG.md", "utf8");
const specification = readFileSync(
	"docs/specs/2026-07-24-v1.4-reading-craft-design.md",
	"utf8",
);
const releaseNotes = readFileSync(
	"docs/releases/2026-07-24-calm-1.4.0.md",
	"utf8",
);

assert.match(info, /<key>Version<\/key>\s*<integer>11<\/integer>/, "theme version should be 11");
assert.match(changelog, /^## 1\.4\.0 - 2026-07-24$/m, "changelog should include v1.4.0");
assert.match(releaseNotes, /^# Calm 1\.4\.0$/m, "release notes should identify Calm 1.4.0");
assert.match(specification, /All four checkpoints were implemented and accepted/, "spec should be synchronized");
assert.match(
	readme,
	/netnewswire:\/\/theme\/add\?url=/,
	"README should include NetNewsWire's install URL",
);
assert.match(
	readme,
	/release asset must be publicly\s+accessible/,
	"README should explain the public asset requirement",
);
assert.ok(
	!readme.includes("word count and estimated read time footer"),
	"README should not advertise the removed statistics footer",
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
