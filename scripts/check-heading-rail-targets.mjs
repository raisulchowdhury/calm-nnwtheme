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
		this.rectTop = 0;
		this.type = "";
		this.style = { top: "" };
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
		return { top: this.rectTop, height: 16 };
	}

	querySelector(selector) {
		return this.querySelectorAll(selector)[0] || null;
	}

	querySelectorAll(selector) {
		const selectors = selector.split(",").map((part) => part.trim());
		const matches = [];
		function matchesSelector(node, candidate) {
			if (candidate.startsWith(".")) {
				return node.className.split(/\s+/).includes(candidate.slice(1));
			}
			return node.tagName === candidate.toUpperCase();
		}
		function visit(node) {
			for (const child of node.children) {
				if (selectors.some((candidate) => matchesSelector(child, candidate))) {
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

function createFixture(headingCount = sectionHeadings.length) {
	const body = new FakeNode("div", "word ".repeat(1200));
	body.id = "bodyContainer";
	body.appendChild(makeHeading(3, articleTitle));
	for (const [index, heading] of sectionHeadings.slice(0, headingCount).entries()) {
		const headingNode = makeHeading(4, heading);
		headingNode.rectTop = (index + 1) * 600;
		body.appendChild(headingNode);
	}

	const toc = new FakeNode("nav");
	toc.className = "readerToc";
	toc.hidden = true;
	const tocContext = new FakeNode("div");
	tocContext.className = "readerTocContext";
	toc.appendChild(tocContext);
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
		PointerEvent: function PointerEvent() {},
		matchMedia() {
			return { matches: false };
		},
		addEventListener() {},
		scrollTo() {},
	};

	return { document, window, toc, tocContext, tocList };
}

function runScript(path, headingCount) {
	const { document, window, toc, tocContext, tocList } = createFixture(headingCount);
	vm.runInNewContext(extractInlineScript(path), { document, window });
	const controls = tocList.querySelectorAll("button");
	const labels = controls.map((button) => button.textContent);
	const initialContext = tocContext.textContent;
	const initialContextTop = tocContext.style.top;
	let scrubContext = "";
	let scrubbingDuring = false;
	let scrubbingAfter = false;
	if (controls.length > 0) {
		controls.forEach((control, index) => {
			control.rectTop = 100 + index * 40;
		});
		const finalControl = controls.at(-1);
		const pointerEvent = {
			button: 0,
			clientY: finalControl.rectTop + 8,
			isPrimary: true,
			pointerId: 1,
			preventDefault() {},
		};
		toc._listeners.get("pointerdown")?.(pointerEvent);
		scrubContext = tocContext.textContent;
		scrubbingDuring = toc.className.split(/\s+/).includes("isScrubbing");
		toc._listeners.get("pointerup")?.(pointerEvent);
		scrubbingAfter = toc.className.split(/\s+/).includes("isScrubbing");
	}
	return {
		contextAfterScrub: tocContext.textContent,
		headingBased: toc.className.split(/\s+/).includes("is-heading-based"),
		initialContext,
		initialContextTop,
		labels,
		scrubContext,
		scrubbingAfter,
		scrubbingDuring,
		tocHidden: toc.hidden,
	};
}

for (const path of ["Calm.nnwtheme/template.html", "preview/index.html"]) {
	const headingRail = runScript(path, 6);
	assert.equal(headingRail.tocHidden, false, `${path} should show the rail for long structured articles`);
	assert.equal(headingRail.headingBased, true, `${path} should mark real-heading navigation`);
	assert.ok(headingRail.labels.includes("BACKGROUND"), `${path} should include real h4 section headings`);
	assert.ok(!headingRail.labels.includes("25%"), `${path} should not fall back to scroll-depth markers`);
	assert.equal(headingRail.scrubContext, sectionHeadings.at(-1), `${path} should update the label while scrubbing`);
	assert.equal(headingRail.scrubbingDuring, true, `${path} should expose the active scrubbing state`);
	assert.equal(headingRail.scrubbingAfter, false, `${path} should clear the active scrubbing state`);
	assert.equal(headingRail.contextAfterScrub, articleTitle, `${path} should restore the current section after scrubbing`);
	assert.equal(headingRail.initialContext, articleTitle, `${path} should synchronize the active heading label`);
	assert.equal(headingRail.initialContextTop, "8px", `${path} should align the label to the active marker`);

	const depthRail = runScript(path, 4);
	assert.equal(depthRail.tocHidden, false, `${path} should show depth markers for shallow long articles`);
	assert.equal(depthRail.headingBased, false, `${path} should not mark depth navigation as heading-based`);
	assert.ok(depthRail.labels.includes("25%"), `${path} should preserve scroll-depth markers`);
	assert.equal(depthRail.initialContext, "", `${path} should not expose section text for depth markers`);
}
