import assert from "node:assert/strict";
import vm from "node:vm";
import { extractInlineScript } from "./extract-inline-script.mjs";

const articleTitle = "An Interview with Figma CEO Dylan Field About Design and AI";
const sectionHeadings = [
	"BACKGROUND",
	"WEBGL AND THE FOUNDATION OF FIGMA",
	"WORK IN FIGMA",
	"THE ADOBE ACQUISITION THAT WASN'T",
	"ART VS. DESIGN",
	"AI HEADWINDS",
];

class FakeClassList {
	constructor(node) {
		this.node = node;
	}

	toggle(name, force) {
		const classes = new Set(this.node.className.split(/\s+/).filter(Boolean));
		const shouldAdd = force === undefined ? !classes.has(name) : Boolean(force);
		if (shouldAdd) {
			classes.add(name);
		} else {
			classes.delete(name);
		}
		this.node.className = Array.from(classes).join(" ");
	}

	add(name) {
		this.toggle(name, true);
	}

	remove(name) {
		this.toggle(name, false);
	}
}

class FakeNode {
	constructor(tagName, textContent = "") {
		this.tagName = tagName.toUpperCase();
		this.textContent = textContent;
		this.children = [];
		this.parentElement = null;
		this.attributes = new Map();
		this.hidden = false;
		this.className = "";
		this.type = "";
		this._listeners = new Map();
		this.classList = new FakeClassList(this);
	}

	get innerText() {
		return this.textContent || this.children.map((child) => child.innerText).join(" ");
	}

	set innerText(value) {
		this.textContent = value;
	}

	appendChild(child) {
		child.parentElement = this;
		this.children.push(child);
		return child;
	}

	setAttribute(name, value) {
		this.attributes.set(name, String(value));
	}

	getAttribute(name) {
		return this.attributes.get(name) || "";
	}

	addEventListener(type, listener) {
		this._listeners.set(type, listener);
	}

	getBoundingClientRect() {
		return { top: 0, height: 16 };
	}

	querySelector(selector) {
		return this.querySelectorAll(selector)[0] || null;
	}

	querySelectorAll(selector) {
		const selectors = selector.split(",").map((part) => part.trim().toUpperCase());
		const matches = [];
		function visit(node) {
			for (const child of node.children) {
				if (selectors.includes(child.tagName)) {
					matches.push(child);
				}
				visit(child);
			}
		}
		visit(this);
		return matches;
	}
}

function makeHeading(level, text) {
	return new FakeNode(`h${level}`, text);
}

function createFixture() {
	const body = new FakeNode("div", "word ".repeat(1200));
	body.id = "bodyContainer";
	body.appendChild(makeHeading(3, articleTitle));
	for (const heading of sectionHeadings) {
		body.appendChild(makeHeading(4, heading));
	}

	const toc = new FakeNode("nav");
	toc.className = "readerToc";
	toc.hidden = true;
	const tocList = new FakeNode("ol");
	tocList.id = "readerTocList";
	toc.appendChild(tocList);

	const title = new FakeNode("h1", articleTitle);
	const header = new FakeNode("header");
	header.id = "readerTop";
	const externalLink = new FakeNode("div");
	externalLink.className = "externalLink";

	const documentElement = new FakeNode("html");
	documentElement.scrollHeight = 5000;
	documentElement.scrollTop = 0;
	const documentBody = new FakeNode("body");
	documentBody.scrollTop = 0;

	const document = {
		documentElement,
		body: documentBody,
		getElementById(id) {
			return {
				bodyContainer: body,
				readerTocList: tocList,
				readerTop: header,
			}[id] || null;
		},
		querySelector(selector) {
			return {
				".readerToc": toc,
				".articleTitle h1": title,
				".externalLink": externalLink,
			}[selector] || null;
		},
		createElement(tagName) {
			return new FakeNode(tagName);
		},
	};

	const window = {
		innerHeight: 800,
		pageYOffset: 0,
		matchMedia() {
			return { matches: false };
		},
		addEventListener() {},
		scrollTo() {},
	};

	return { document, window, toc, tocList };
}

function runScript(path) {
	const { document, window, toc, tocList } = createFixture();
	vm.runInNewContext(extractInlineScript(path), { document, window });
	const labels = tocList.querySelectorAll("button").map((button) => button.textContent);
	return { labels, tocHidden: toc.hidden };
}

for (const path of ["Calm.nnwtheme/template.html", "preview/index.html"]) {
	const { labels, tocHidden } = runScript(path);
	assert.equal(tocHidden, false, `${path} should show the rail for long structured articles`);
	assert.ok(labels.includes("BACKGROUND"), `${path} should include real h4 section headings`);
	assert.ok(!labels.includes("25%"), `${path} should not fall back to scroll-depth markers`);
}
