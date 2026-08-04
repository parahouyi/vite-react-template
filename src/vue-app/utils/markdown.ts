import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import python from "highlight.js/lib/languages/python";
import yaml from "highlight.js/lib/languages/yaml";
import sql from "highlight.js/lib/languages/sql";
import markdown from "highlight.js/lib/languages/markdown";
import DOMPurify from "dompurify";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("tsx", typescript);
hljs.registerLanguage("jsx", javascript);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("vue", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("scss", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("yml", yaml);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("md", markdown);

const md = new Marked(
	markedHighlight({
		langPrefix: "hljs language-",
		highlight(code, lang) {
			const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
			try {
				return hljs.highlight(code, { language, ignoreIllegals: true }).value;
			} catch {
				return code;
			}
		},
	}),
	{ gfm: true, breaks: false },
);

export interface TocItem {
	id: string;
	text: string;
	level: number;
}

export interface RenderResult {
	html: string;
	toc: TocItem[];
}

const usedIds = new Set<string>();

function resetSlugger() {
	usedIds.clear();
}

function slugify(text: string): string {
	let base = text
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^\w\u4e00-\u9fff-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "");
	if (!base) base = "heading";
	let id = base;
	let i = 1;
	while (usedIds.has(id)) {
		id = `${base}-${i++}`;
	}
	usedIds.add(id);
	return id;
}

function stripTags(html: string): string {
	return html.replace(/<[^>]+>/g, "").trim();
}

export function renderMarkdown(content: string): RenderResult {
	resetSlugger();
	const toc: TocItem[] = [];

	const rawHtml = md.parse(content, { async: false }) as string;

	const html = rawHtml.replace(
		/<h([1-3])>(.*?)<\/h\1>/g,
		(_match, levelStr, inner) => {
			const level = Number(levelStr);
			const text = stripTags(inner);
			const id = slugify(text);
			if (level <= 3) {
				toc.push({ level, id, text });
			}
			return `<h${level} id="${id}">${inner}</h${level}>`;
		},
	);

	const clean = DOMPurify.sanitize(html, {
		ADD_ATTR: ["id", "target", "rel"],
	});

	return { html: clean, toc };
}