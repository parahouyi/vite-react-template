<script setup lang="ts">
import {
	computed,
	nextTick,
	onMounted,
	onUnmounted,
	ref,
	watch,
} from "vue";
import { useRoute } from "vue-router";
import { fetchArticleBySlug, fetchArticles } from "../api/articles";
import { renderMarkdown, type TocItem } from "../utils/markdown";
import { calculateReadingTime } from "../utils/reading-time";
import type { Article, ArticleDetail } from "../api/types";
import TocSidebar from "../components/TocSidebar.vue";
import CommentList from "../components/CommentList.vue";
import ReadingProgress from "../components/ReadingProgress.vue";
import ArticleCard from "../components/ArticleCard.vue";
import { useMeta } from "../composables/useMeta";

const route = useRoute();

const article = ref<ArticleDetail | null>(null);
const related = ref<Article[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const articleBody = ref<HTMLElement | null>(null);
const activeId = ref("");

let observer: IntersectionObserver | null = null;

const html = computed(() =>
	article.value ? renderMarkdown(article.value.content).html : "",
);
const toc = computed<TocItem[]>(() =>
	article.value ? renderMarkdown(article.value.content).toc : [],
);
const readingTime = computed(() =>
	article.value ? calculateReadingTime(article.value.content) : 0,
);
const formattedDate = computed(() => {
	if (!article.value) return "";
	return new Date(article.value.created_at).toLocaleDateString("zh-CN", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
});

const categoryClass = computed(() => {
	const slug = article.value?.category_slug ?? "";
	if (slug === "life") return "category--life";
	if (slug === "projects") return "category--projects";
	return "category--tech";
});

async function load(slug: string) {
	loading.value = true;
	error.value = null;
	article.value = null;
	related.value = [];
	activeId.value = "";
	try {
		const data = await fetchArticleBySlug(slug);
		article.value = data.article;
		await nextTick();
		setupObserver();
		window.scrollTo({ top: 0 });
		if (data.article.category_slug) {
			const relatedData = await fetchArticles({
				category: data.article.category_slug,
				limit: 4,
			});
			related.value = relatedData.articles.filter(
				(a) => a.id !== data.article.id,
			);
		}
	} catch (e) {
		error.value = e instanceof Error ? e.message : "加载失败";
	} finally {
		loading.value = false;
	}
}

function setupObserver() {
	observer?.disconnect();
	if (!articleBody.value) return;
	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					activeId.value = entry.target.id;
				}
			}
		},
		{ rootMargin: "-80px 0px -70% 0px", threshold: 0 },
	);
	articleBody.value
		.querySelectorAll("h1, h2, h3")
		.forEach((el) => observer!.observe(el));
}

watch(
	() => route.params.slug,
	(slug) => {
		if (typeof slug === "string" && slug) load(slug);
	},
);

useMeta(() => {
	if (!article.value) return {};
	const a = article.value;
	return {
		title: a.title,
		description: a.excerpt || a.content.replace(/[#*`>]+/g, "").slice(0, 160),
		image: a.cover_image || undefined,
		url: typeof window !== "undefined" ? window.location.href : undefined,
		type: "article",
		author: a.author,
		publishedTime: a.created_at,
		tags: a.tags,
	};
});

onMounted(() => {
	const slug = route.params.slug;
	if (typeof slug === "string" && slug) load(slug);
});

onUnmounted(() => observer?.disconnect());
</script>

<template>
	<article v-if="article" class="article-page">
		<ReadingProgress />
		<header v-if="article.cover_image" class="cover">
			<img :src="article.cover_image" :alt="article.title" />
		</header>

		<div class="container-narrow hero-text">
			<div class="meta-row">
				<RouterLink
					v-if="article.category_name"
					:to="`/categories/${article.category_slug}`"
					class="category"
					:class="categoryClass"
				>
					{{ article.category_name }}
				</RouterLink>
			</div>
			<h1>{{ article.title }}</h1>
			<div class="meta-info">
				<span>{{ article.author }}</span>
				<span class="dot">·</span>
				<time :datetime="article.created_at">{{ formattedDate }}</time>
				<span class="dot">·</span>
				<span>{{ readingTime }} 分钟阅读</span>
				<span class="dot">·</span>
				<span>{{ article.views }} 次浏览</span>
			</div>
		</div>

		<div class="container body-grid">
			<main ref="articleBody" class="article-content" v-html="html" />
			<TocSidebar v-if="toc.length > 0" :items="toc" :active-id="activeId" />
		</div>

		<div class="container-narrow article-footer">
			<div v-if="article.tags.length" class="tags">
				<RouterLink
					v-for="tag in article.tags"
					:key="tag"
					:to="`/tags/${encodeURIComponent(tag)}`"
					class="tag-pill"
				>
					#{{ tag }}
				</RouterLink>
			</div>
			<div class="footer-nav">
				<RouterLink to="/" class="btn btn-ghost">← 返回首页</RouterLink>
				<RouterLink to="/articles" class="btn btn-ghost">所有文章 →</RouterLink>
			</div>
		</div>

		<section
			v-if="related.length > 0"
			class="container related-section"
		>
			<header class="related-header">
				<h3>
					更多「
					<span class="hl">{{ article.category_name }}</span>
					」文章
				</h3>
				<RouterLink
					v-if="article.category_slug"
					:to="`/categories/${article.category_slug}`"
					class="link"
				>
					查看分类 →
				</RouterLink>
			</header>
			<div class="related-grid">
				<ArticleCard
					v-for="r in related"
					:key="r.id"
					:article="r"
				/>
			</div>
		</section>

		<div v-if="article" class="container-narrow comments-wrap">
			<CommentList :article-id="article.id" />
		</div>
	</article>

	<div v-else-if="loading" class="container-narrow placeholder">
		<div class="spinner" />
		<p class="muted">加载中…</p>
	</div>

	<div v-else-if="error" class="container-narrow placeholder">
		<h1>出错了</h1>
		<p class="muted">{{ error }}</p>
		<RouterLink to="/" class="btn btn-primary">返回首页</RouterLink>
	</div>
</template>

<style scoped>
.article-page {
	margin-top: calc(-1 * var(--space-10));
}

.cover {
	width: 100%;
	aspect-ratio: 21 / 9;
	max-height: 420px;
	overflow: hidden;
	background: var(--color-bg-muted);
}

.cover img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.hero-text {
	text-align: center;
	padding: var(--space-10) var(--space-6) var(--space-8);
}

.meta-row {
	display: flex;
	justify-content: center;
	margin-bottom: var(--space-5);
}

.category {
	display: inline-flex;
	padding: 4px 14px;
	border-radius: var(--radius-full);
	font-size: 0.8125rem;
	font-weight: 500;
	transition: filter var(--transition-fast);
}

.category:hover {
	filter: brightness(0.95);
}

.category--tech {
	background: var(--color-cat-tech-bg);
	color: var(--color-cat-tech-fg);
}

.category--life {
	background: var(--color-cat-life-bg);
	color: var(--color-cat-life-fg);
}

.category--projects {
	background: var(--color-cat-projects-bg);
	color: var(--color-cat-projects-fg);
}

h1 {
	font-size: clamp(1.875rem, 4vw, 2.75rem);
	line-height: 1.25;
	letter-spacing: -0.02em;
	margin-bottom: var(--space-6);
}

.meta-info {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: var(--space-2);
	flex-wrap: wrap;
	font-size: 0.875rem;
	color: var(--color-text-muted);
}

.dot {
	color: var(--color-text-muted);
}

.body-grid {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 240px;
	gap: var(--space-12);
	padding-top: var(--space-8);
	padding-bottom: var(--space-12);
	align-items: start;
}

.article-content {
	min-width: 0;
	max-width: 100%;
}

.article-footer {
	padding: var(--space-8) var(--space-6);
	border-top: 1px solid var(--color-border-soft);
}

.tags {
	display: flex;
	flex-wrap: wrap;
	gap: var(--space-2);
	margin-bottom: var(--space-6);
}

.tag-pill {
	display: inline-flex;
	padding: 5px 12px;
	background: var(--color-bg-muted);
	color: var(--color-text-soft);
	border-radius: var(--radius-full);
	font-size: 0.8125rem;
	font-family: var(--font-mono);
	transition:
		background var(--transition-fast),
		color var(--transition-fast),
		transform var(--transition-fast);
}

.tag-pill:hover {
	background: var(--color-accent-soft);
	color: var(--color-accent);
	transform: translateY(-1px);
}

.footer-nav {
	display: flex;
	justify-content: space-between;
	gap: var(--space-4);
	flex-wrap: wrap;
}

.related-section {
	margin-top: var(--space-12);
}

.related-header {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: var(--space-4);
	margin-bottom: var(--space-6);
	padding-bottom: var(--space-4);
	border-bottom: 1px solid var(--color-border-soft);
}

.related-header h3 {
	font-size: 1.25rem;
}

.related-header .hl {
	color: var(--color-accent);
}

.related-header .link {
	font-size: 0.9375rem;
	color: var(--color-text-soft);
	font-weight: 500;
}

.related-header .link:hover {
	color: var(--color-accent);
}

.related-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: var(--space-5);
}

.placeholder {
	padding: var(--space-20) 0;
	text-align: center;
}

.placeholder h1 {
	margin-bottom: var(--space-3);
}

.placeholder .btn {
	margin-top: var(--space-6);
}

.spinner {
	width: 36px;
	height: 36px;
	margin: 0 auto var(--space-4);
	border: 3px solid var(--color-bg-muted);
	border-top-color: var(--color-accent);
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

@media (max-width: 1024px) {
	.body-grid {
		grid-template-columns: 1fr;
		gap: var(--space-8);
	}
	.related-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 640px) {
	.cover {
		aspect-ratio: 16 / 10;
	}
	.meta-info {
		font-size: 0.8125rem;
	}
	.dot:nth-child(odd) {
		display: none;
	}
	.related-grid {
		grid-template-columns: 1fr;
	}
}
</style>