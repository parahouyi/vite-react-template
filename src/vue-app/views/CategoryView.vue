<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchArticles, fetchCategories } from "../api/articles";
import type { Article, Category } from "../api/types";
import ArticleCard from "../components/ArticleCard.vue";
import Pagination from "../components/Pagination.vue";
import { useMeta } from "../composables/useMeta";

const route = useRoute();
const router = useRouter();

const articles = ref<Article[]>([]);
const categories = ref<Category[]>([]);
const category = ref<Category | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const totalPages = ref(1);
const total = ref(0);

const currentPage = computed(() => {
	const p = Number(route.query.page);
	return Number.isInteger(p) && p >= 1 ? p : 1;
});

useMeta(() => ({
	title: category.value ? `${category.value.name} 分类` : "分类",
	description:
		category.value?.description || `查看 ${category.value?.name ?? ""} 分类下的所有文章。`,
}));

async function load() {
	loading.value = true;
	error.value = null;
	category.value = null;
	const slug = String(route.params.slug);
	try {
		const [articlesData, categoriesData] = await Promise.all([
			fetchArticles({
				category: slug,
				page: currentPage.value,
				limit: 12,
			}),
			fetchCategories(),
		]);
		articles.value = articlesData.articles;
		categories.value = categoriesData.categories;
		category.value =
			categoriesData.categories.find((c) => c.slug === slug) ?? null;
		totalPages.value = articlesData.pagination.totalPages;
		total.value = articlesData.pagination.total;
	} catch (e) {
		error.value = e instanceof Error ? e.message : "加载失败";
	} finally {
		loading.value = false;
	}
}

function onPageChange(page: number) {
	router.push({ query: { ...route.query, page: String(page) } });
	window.scrollTo({ top: 0, behavior: "smooth" });
}

watch(() => [route.params.slug, route.query.page], load, { immediate: false });
watch(
	() => route.params.slug,
	() => {
		router.replace({ query: {} });
	},
);
onMounted(load);
</script>

<template>
	<section class="category-page container">
		<header v-if="category" class="banner" :data-slug="category.slug">
			<div class="banner-bg" />
			<div class="banner-inner">
				<nav class="crumb" aria-label="breadcrumb">
					<RouterLink to="/categories">所有分类</RouterLink>
					<span class="sep">›</span>
					<span class="current">{{ category.name }}</span>
				</nav>
				<h1>{{ category.name }}</h1>
				<p v-if="category.description" class="desc">
					{{ category.description }}
				</p>
				<div class="meta">
					<span class="badge">
						共 {{ articles.length }} 篇文章
					</span>
				</div>
			</div>
		</header>

		<div v-else-if="loading" class="placeholder">
			<div class="banner-skeleton" />
			<p class="muted">加载中…</p>
		</div>

		<div v-else-if="error" class="placeholder error">
			加载失败：{{ error }}
		</div>

		<div v-else class="placeholder">
			<h2>分类不存在</h2>
			<p class="muted">
				没有找到 slug 为
				<code>{{ route.params.slug }}</code>
				的分类。
			</p>
			<RouterLink to="/categories" class="btn">查看所有分类</RouterLink>
		</div>

		<div
			v-if="articles.length > 0"
			class="grid"
		>
			<ArticleCard v-for="a in articles" :key="a.id" :article="a" />
		</div>

		<div v-else-if="!loading && category" class="empty">
			<h3>此分类下还没有文章</h3>
			<p class="muted">
				试试
				<RouterLink to="/categories" class="link">浏览其他分类</RouterLink>
				，或在后台发布新文章。
			</p>
		</div>

		<Pagination
			v-if="!loading && category && totalPages > 1"
			:current-page="currentPage"
			:total-pages="totalPages"
			@change="onPageChange"
		/>
	</section>
</template>

<style scoped>
.category-page {
	padding: var(--space-6) 0 var(--space-12);
}

.banner {
	position: relative;
	margin-bottom: var(--space-10);
	padding: var(--space-10) var(--space-8);
	border-radius: var(--radius-lg);
	border: 1px solid var(--color-border);
	overflow: hidden;
	background: var(--color-bg-soft);
}

.banner-bg {
	position: absolute;
	inset: 0;
	background:
		radial-gradient(circle at 12% 30%, var(--color-mesh-1), transparent 50%),
		radial-gradient(circle at 88% 70%, var(--color-mesh-2), transparent 50%),
		radial-gradient(circle at 50% 100%, var(--color-mesh-3), transparent 50%);
	opacity: 0.55;
	pointer-events: none;
}

.banner[data-slug="programming"] .banner-bg,
.banner[data-slug="tech"] .banner-bg {
	background: radial-gradient(
		circle at 15% 40%,
		var(--color-cat-tech-bg),
		transparent 60%
	);
	opacity: 0.85;
}

.banner[data-slug="life"] .banner-bg {
	background: radial-gradient(
		circle at 85% 30%,
		var(--color-cat-life-bg),
		transparent 60%
	);
	opacity: 0.85;
}

.banner[data-slug="projects"] .banner-bg,
.banner[data-slug="music"] .banner-bg {
	background: radial-gradient(
		circle at 80% 60%,
		var(--color-cat-projects-bg),
		transparent 60%
	);
	opacity: 0.85;
}

.banner-inner {
	position: relative;
}

.crumb {
	display: flex;
	align-items: center;
	gap: var(--space-2);
	font-size: 0.8125rem;
	color: var(--color-text-muted);
	margin-bottom: var(--space-3);
}

.crumb a {
	color: var(--color-accent);
	font-weight: 500;
}

.crumb a:hover {
	text-decoration: underline;
}

.crumb .sep {
	opacity: 0.5;
}

.crumb .current {
	color: var(--color-text-soft);
}

h1 {
	font-size: clamp(2rem, 5vw, 3rem);
	letter-spacing: -0.02em;
	margin-bottom: var(--space-3);
	background: linear-gradient(
		135deg,
		var(--color-text) 0%,
		var(--color-accent) 100%
	);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
	line-height: 1.1;
}

.banner[data-slug="life"] h1 {
	background: linear-gradient(
		135deg,
		var(--color-text) 0%,
		var(--color-cat-life-fg) 100%
	);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
}

.banner[data-slug="projects"] h1,
.banner[data-slug="music"] h1 {
	background: linear-gradient(
		135deg,
		var(--color-text) 0%,
		var(--color-cat-projects-fg) 100%
	);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
}

.desc {
	font-size: 1.0625rem;
	color: var(--color-text-soft);
	max-width: 640px;
	margin-bottom: var(--space-4);
	line-height: 1.6;
}

.meta {
	display: flex;
	align-items: center;
	gap: var(--space-2);
}

.badge {
	display: inline-flex;
	align-items: center;
	padding: var(--space-1) var(--space-3);
	background: var(--color-accent-soft);
	color: var(--color-accent);
	border-radius: var(--radius-full);
	font-size: 0.875rem;
	font-weight: 500;
}

.banner[data-slug="life"] .badge {
	background: var(--color-cat-life-bg);
	color: var(--color-cat-life-fg);
}

.banner[data-slug="projects"] .badge,
.banner[data-slug="music"] .badge {
	background: var(--color-cat-projects-bg);
	color: var(--color-cat-projects-fg);
}

.grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: var(--space-5);
}

.placeholder {
	padding: var(--space-12) var(--space-6);
	text-align: center;
	color: var(--color-text-muted);
	background: var(--color-bg-soft);
	border: 1px dashed var(--color-border);
	border-radius: var(--radius-lg);
	margin-bottom: var(--space-6);
}

.placeholder.error {
	color: var(--color-danger);
}

.placeholder h2 {
	margin-bottom: var(--space-3);
}

.placeholder .btn {
	margin-top: var(--space-4);
}

.banner-skeleton {
	height: 180px;
	background: linear-gradient(
		90deg,
		var(--color-bg-muted),
		var(--color-border-soft),
		var(--color-bg-muted)
	);
	background-size: 200% 100%;
	border-radius: var(--radius-lg);
	margin-bottom: var(--space-6);
	animation: shimmer 1.6s infinite;
}

@keyframes shimmer {
	from {
		background-position: 200% 0;
	}
	to {
		background-position: -200% 0;
	}
}

.empty {
	padding: var(--space-16) var(--space-6);
	text-align: center;
	background: var(--color-bg-soft);
	border: 1px dashed var(--color-border);
	border-radius: var(--radius-lg);
}

.empty h3 {
	font-size: 1.25rem;
	margin-bottom: var(--space-3);
}

.link {
	color: var(--color-accent);
	text-decoration: underline;
	text-underline-offset: 3px;
}

code {
	padding: 2px 6px;
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-sm);
	font-family: var(--font-mono);
	font-size: 0.875em;
	color: var(--color-accent);
}

@media (max-width: 1024px) {
	.grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 640px) {
	.banner {
		padding: var(--space-6) var(--space-5);
	}
	h1 {
		font-size: 1.75rem;
	}
	.grid {
		grid-template-columns: 1fr;
	}
}
</style>