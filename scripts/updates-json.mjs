// updates.json tells installed copies of Calm that a newer version exists.
// It is generated from what every release already has: the version in
// package.json, the theme build in Info.plist, and the date in the release
// notes filename (docs/releases/YYYY-MM-DD-calm-VERSION.md).
//
//   node scripts/updates-json.mjs          check that updates.json is current
//   node scripts/updates-json.mjs --write  rewrite it
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const version = JSON.parse(readFileSync("package.json", "utf8")).version;
const info = readFileSync("Calm.nnwtheme/Info.plist", "utf8");
const buildMatch = /<key>Version<\/key>\s*<integer>(\d+)<\/integer>/.exec(info);
const notes = readdirSync("docs/releases").filter((name) =>
	name.endsWith(`-calm-${version}.md`),
);

if (!buildMatch) {
	console.error("Info.plist has no integer Version.");
	process.exit(1);
}
if (notes.length !== 1) {
	console.error(`Expected one release-notes file for ${version}, found ${notes.length}.`);
	process.exit(1);
}

const date = /^(\d{4}-\d{2}-\d{2})-/.exec(notes[0])?.[1];
if (!date) {
	console.error(`Release notes ${notes[0]} should start with a YYYY-MM-DD date.`);
	process.exit(1);
}

const expected = `${JSON.stringify(
	{ version, build: Number(buildMatch[1]), released: `${date}T00:00:00Z` },
	null,
	2,
)}\n`;

if (process.argv.includes("--write")) {
	writeFileSync("updates.json", expected);
	console.log(`updates.json: ${version}, build ${buildMatch[1]}, ${date}`);
} else {
	let current = "";
	try {
		current = readFileSync("updates.json", "utf8");
	} catch {}
	if (current !== expected) {
		console.error(
			"updates.json is out of date. Run: node scripts/updates-json.mjs --write",
		);
		process.exit(1);
	}
	console.log("updates.json: OK");
}
