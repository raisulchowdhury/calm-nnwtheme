import assert from "node:assert/strict";
import { extractInlineScript } from "./extract-inline-script.mjs";

for (const path of ["Calm.nnwtheme/template.html", "preview/index.html"]) {
	const script = extractInlineScript(path);

	assert.match(
		script,
		/requestAnimationFrame\(runActiveUpdate\)/,
		`${path} should throttle scroll updates with requestAnimationFrame`,
	);
	assert.match(
		script,
		/cachedTargetTops/,
		`${path} should cache target offsets`,
	);
	assert.match(
		script,
		/new window\.ResizeObserver\(scheduleCallback\)/,
		`${path} should observe article-height changes`,
	);
	assert.match(
		script,
		/body\.addEventListener\("load", scheduleCallback, true\)/,
		`${path} should refresh offsets when embedded media loads`,
	);
	assert.match(
		script,
		/control\.setAttribute\("aria-current", "location"\)/,
		`${path} should expose the active marker as the current location`,
	);
	assert.match(
		script,
		/root\.scrollHeight < window\.innerHeight \* 2/,
		`${path} should hide the map below two viewport heights`,
	);
	assert.match(
		script,
		/observeLayoutChanges\(rebuildIfArticleGrows\)/,
		`${path} should keep watching initially short articles for late content growth`,
	);
	assert.match(
		script,
		/tocCleanup = initToc\(\) \|\| null/,
		`${path} should rebuild the map after a short article becomes long`,
	);
	assert.match(
		script,
		/MAX_HEADING_MARKERS = 8/,
		`${path} should cap body-heading markers`,
	);
	assert.match(
		script,
		/noisyHeadingPattern/,
		`${path} should filter common utility headings`,
	);
}
