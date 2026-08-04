<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchArticles } from "../api/articles";
import type { Article } from "../api/types";
import ArticleCard from "../components/ArticleCard.vue";
import Pagination from "../components/Pagination.vue";
import { useMeta } from "../composables/useMeta";

const route = useRoute();
const router = useRouter();

const articles = ref<Article[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const totalPages = ref(1);
const total = ref(0);

const currentPage = computed(() => {
	const p = Number(route.query.page);
	return Number.isInteger(p) && p >= 1 ? p : 1;
});

useMeta(() => ({
	title: currentPage.value > 1 ? `第 ${currentPage.value} 页 - 文章` : "所有文章",
	description: `浏览所有已发布的文章，共 ${total.value} 篇。`,
}));

async function load() {
	loading.value = true;
	error.value = null;
	try {
		const data = await fetchArticles({ page: currentPage.value, limit: 12 });
		articles.value = data.articles;
		totalPages.value = data.pagination.totalPages;
		total.value = data.pagination.total;
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

watch(() => route.query.page, load);
onMounted(load);
</script>

<template>
	<section class="articles-page container">
		<header class="page-header">
			<h1>所有文章</h1>
			<p class="lede">
				<span class="muted">共</span>
				<strong>{{ total }}</strong>
				<span class="muted">篇文章 · 每页 12 篇</span>
			</p>
		</header>

		<div v-if="loading" class="grid">
			<div v-for="i in 6" :key="i" class="skeleton-card">
				<div class="skeleton-cover shimmer" />
				<div class="skeleton-body">
					<div class="skeleton-line short shimmer" />
					<div class="skeleton-line shimmer" />
					<div class="skeleton-line medium shimmer" />
				</div>
			</div>
		</div>

		<div v-else-if="error" class="placeholder state--error">
			加载失败：{{ error }}
		</div>

		<div v-else-if="articles.length === 0" class="placeholder">
			还没有文章
		</div>

		<div v-else class="grid">
			<ArticleCard v-for="a in articles" :key="a.id" :article="a" />
		</div>

		<Pagination
			v-if="!loading && totalPages > 1"
			:current-page="currentPage"
			:total-pages="totalPages"
			@change="onPageChange"
		/>
	</section>
</template>

<style scoped>
.articles-page {
	padding: var(--space-6) 0 var(--space-12);
	min-height: 60vh;
}

.page-header {
	margin-bottom: var(--space-10);
}

.page-header h1 {
	font-size: 2rem;
	margin-bottom: var(--space-2);
}

.lede {
	font-size: 1rem;
}

.lede strong {
	color: var(--color-accent);
	font-weight: 600;
	margin: 0 4px;
}

.grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: var(--space-5);
}

.placeholder {
	padding: var(--space-16) var(--space-6);
	text-align: center;
	color: var(--color-text-muted);
	background: var(--color-bg-soft);
	border: 1px dashed var(--color-border);
	border-radius: var(--radius-lg);
}

.state--error {
	color: var(--color-danger);
}

.skeleton-card {
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
	overflow: hidden;
}

.skeleton-cover {
	aspect-ratio: 16 / 9;
	background: var(--color-bg-muted);
}

.skeleton-body {
	padding: var(--space-5);
	display: flex;
	flex-direction: column;
	gap: var(--space-3);
}

.skeleton-line {
	height: 12px;
	background: var(--color-bg-muted);
	border-radius: var(--radius-sm);
}

.skeleton-line.short {
	width: 30%;
}

.skeleton-line.medium {
	width: 60%;
}

.shimmer {
	position: relative;
	overflow: hidden;
}

.shimmer::after {
	content: "";
	position: absolute;
	inset: 0;
	background: linear-gradient(
		90deg,
		transparent 0%,
		rgba(255, 255, 255, 0.06) 50%,
		transparent 100%
	);
	animation: shimmer 1.6s infinite;
}

@keyframes shimmer {
	from {
		transform: translateX(-100%);
	}
	to {
		transform: translateX(100%);
	}
}

@media (max-width: 1024px) {
	.grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 640px) {
	.grid {
		grid-template-columns: 1fr;
	}
}
</style>