import { watchEffect, type Ref } from "vue";

export const SITE_NAME = "Simon's Blog";
export const SITE_DESC =
	"记录技术、思考与生活。一个跑在 Cloudflare 边缘网络上的个人博客。";

export interface MetaOptions {
	title?: string;
	description?: string;
	image?: string;
	url?: string;
	type?: "website" | "article";
	author?: string;
	publishedTime?: string;
	tags?: string[];
}

type MaybeRefOrGetter<T> = T | Ref<T> | (() => T);

function toValue<T>(v: MaybeRefOrGetter<T>): T {
	if (typeof v === "function") return (v as () => T)();
	if (v && typeof v === "object" && "value" in v) {
		return (v as Ref<T>).value;
	}
	return v;
}

function setMeta(
	name: string,
	content: string,
	attr: "name" | "property" = "name",
) {
	if (!content) return;
	let el = document.head.querySelector<HTMLMetaElement>(
		`meta[${attr}="${name}"]`,
	);
	if (!el) {
		el = document.createElement("meta");
		el.setAttribute(attr, name);
		document.head.appendChild(el);
	}
	el.setAttribute("content", content);
}

function ensureLink(rel: string, href: string) {
	let el = document.head.querySelector<HTMLLinkElement>(
		`link[rel="${rel}"]`,
	);
	if (!el) {
		el = document.createElement("link");
		el.setAttribute("rel", rel);
		document.head.appendChild(el);
	}
	el.setAttribute("href", href);
}

export function useMeta(options: MaybeRefOrGetter<MetaOptions>) {
	watchEffect(() => {
		const opts = toValue(options);
		const title = opts.title ? `${opts.title} · ${SITE_NAME}` : SITE_NAME;
		const desc = opts.description || SITE_DESC;
		const url =
			opts.url || (typeof window !== "undefined" ? window.location.href : "");
		const image = opts.image || "";
		const type = opts.type || "website";

		document.title = title;
		setMeta("description", desc);

		// Open Graph
		setMeta("og:title", title, "property");
		setMeta("og:description", desc, "property");
		setMeta("og:type", type, "property");
		setMeta("og:url", url, "property");
		setMeta("og:site_name", SITE_NAME, "property");
		if (image) setMeta("og:image", image, "property");

		// Twitter
		setMeta(
			"twitter:card",
			image ? "summary_large_image" : "summary",
			"name",
		);
		setMeta("twitter:title", title, "name");
		setMeta("twitter:description", desc, "name");
		if (image) setMeta("twitter:image", image, "name");

		// Article-specific
		if (type === "article") {
			if (opts.author) setMeta("article:author", opts.author, "property");
			if (opts.publishedTime)
				setMeta(
					"article:published_time",
					opts.publishedTime,
					"property",
				);
			if (opts.tags) {
				for (const t of opts.tags) {
					setMeta("article:tag", t, "property");
				}
			}
		}

		// Canonical
		if (url) ensureLink("canonical", url);
	});
}