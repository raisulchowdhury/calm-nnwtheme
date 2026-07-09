import { readFileSync } from "node:fs";

const stylesheet = readFileSync("Calm.nnwtheme/stylesheet.css", "utf8");

function assertContains(expected, label) {
	if (!stylesheet.includes(expected)) {
		console.error(`${label} is missing: ${expected}`);
		process.exit(1);
	}
}

assertContains(
	".readerToc button:focus:not(:focus-visible) {\n\toutline: 0;\n\tbox-shadow: none;\n}",
	"pointer-focus suppression",
);
assertContains(
	".readerToc button:focus-visible {\n\toutline: 2px solid -webkit-focus-ring-color;\n\toutline-offset: -2px;\n\tborder-radius: 4px;\n}",
	"system rail focus ring",
);
assertContains(
	".articleTitle a {\n\t\tdisplay: inline-flex;\n\t\talign-items: center;\n\t\tmin-height: 44px;\n\t\tmargin-block: -5px;\n\t}",
	"compact title target",
);
assertContains(
	".articleMeta a {\n\t\tdisplay: inline-flex;\n\t\talign-items: center;\n\t\tmin-height: 44px;\n\t\tmargin-block: -12px;\n\t}",
	"compact metadata target",
);
assertContains(
	".articleMeta {\n\t\tfont-size: 0.92rem;\n\t\tmargin-top: calc(0.95rem + 2px);\n\t}",
	"compact target separation",
);
assertContains(
	".articleBody summary {\n\t\tdisplay: flex;\n\t\talign-items: center;\n\t\tmin-height: 44px;\n\t}",
	"compact disclosure target",
);
assertContains(
	"@media (any-pointer: coarse) and (min-width: 821px) {\n\t.readerToc {\n\t\tleft: 2px;\n\t\twidth: 44px;",
	"wide touch rail target",
);
assertContains(
	".readerToc button {\n\t\twidth: 44px;\n\t\theight: 44px;\n\t}\n\n\t.readerToc button::before {\n\t\tleft: 19px;\n\t}",
	"wide touch rail control and marker geometry",
);
assertContains(
	".articleBody details {\n\t\tpadding-top: 0;\n\t\tpadding-bottom: 0;\n\t}",
	"compact disclosure spacing",
);
assertContains(
	".readerFooter {\n\tmargin-top: 5rem;\n\tpadding-top: 1.25rem;\n\tborder-top: 1px solid var(--reader-rule);\n\tcolor: var(--reader-muted);",
	"readable footer color",
);
