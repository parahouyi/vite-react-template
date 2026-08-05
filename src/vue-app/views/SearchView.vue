<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchArticles } from "../api/articles";
import type { Article } from "../api/types";
import ArticleCard from "../components/ArticleCard.vue";
import { useMeta } from "../composables/useMeta";

const route = useRoute();
const router = useRouter();

const searchInput = ref(String(route.query.q ?? "").trim());
const articles = ref<Article[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const searched = ref(false);

const query = computed(() => searchInput.value.trim());

useMeta(() => ({
	title: query.value ? `搜索：${query.value}` : "搜索",
	description: query.value
		? `在所有文章中搜索 "${query.value}" 的结果。`
		: "在所有文章中搜索标题、摘要与正文。",
}));

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function syncUrl(q: string) {
	router.replace({ query: q ? { q } : {} });
}

async function performSearch(q: string) {
	if (!q) {
		articles.value = [];
		searched.value = false;
		return;
	}
	loading.value = true;
	error.value = null;
	searched.value = true;
	try {
		const data = await fetchArticles({ search: q, limit: 50 });
		articles.value = data.articles;
	} catch (e) {
		error.value = e instanceof Error ? e.message : "搜索失败";
	} finally {
		loading.value = false;
	}
}

function onInput() {
	if (debounceTimer) clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => {
		const q = searchInput.value.trim();
		syncUrl(q);
		performSearch(q);
	}, 300);
}

function clearInput() {
	searchInput.value = "";
	if (debounceTimer) clearTimeout(debounceTimer);
	syncUrl("");
	performSearch("");
	searchInput.value = "";
	searchInputRef.value?.focus();
}

function onKeydown(e: KeyboardEvent) {
	if (e.key === "Escape" && document.activeElement === searchInputRef.value) {
		clearInput();
	}
}

const searchInputRef = ref<HTMLInputElement | null>(null);

watch(
	() => route.query.q,
	(newQ) => {
		const q = String(newQ ?? "").trim();
		if (q !== searchInput.value) {
			searchInput.value = q;
			performSearch(q);
		}
	},
);

onMounted(() => {
	document.addEventListener("keydown", onKeydown);
	if (query.value) performSearch(query.value);
});

onUnmounted(() => {
	document.removeEventListener("keydown", onKeydown);
	if (debounceTimer) clearTimeout(debounceTimer);
});
</script>

<template>
	<section class="search-page container">
		<header class="search-header">
			<h1>搜索</h1>
			<p class="lede muted">在所有文章中搜索标题、摘要与正文。</p>
		</header>

		<div class="search-box" :class="{ focused: false }">
			<svg
				class="search-icon"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="11" cy="11" r="7" />
				<path d="m20 20-3.5-3.5" />
			</svg>
			<input
				ref="searchInputRef"
				v-model="searchInput"
				type="search"
				placeholder="输入关键词...（如：Vue、Cloudflare、中医）"
				autocomplete="off"
				autofocus
				@input="onInput"
			/>
			<button
				v-if="searchInput"
				type="button"
				class="clear-btn"
				aria-label="清空"
				@click="clearInput"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M18 6 6 18M6 6l12 12" />
				</svg>
			</button>
		</div>

		<div v-if="loading" class="state">
			<div class="spinner" />
			<span>搜索中…</span>
		</div>

		<div v-else-if="error" class="state state--error">
			搜索失败：{{ error }}
		</div>

		<div v-else-if="!query && !searched" class="empty empty--hint">
			<div class="hint-grid">
				<div class="hint-item">
					<div class="hint-icon">🔍</div>
					<div class="hint-title">实时搜索</div>
					<div class="hint-text">输入关键词即可看到结果，无需按回车</div>
				</div>
				<div class="hint-item">
					<div class="hint-icon">📝</div>
					<div class="hint-title">多字段匹配</div>
					<div class="hint-text">同时搜索文章标题、摘要和正文</div>
				</div>
				<div class="hint-item">
					<div class="hint-icon">🔗</div>
					<div class="hint-title">可分享 URL</div>
					<div class="hint-text">搜索词同步在 URL 里（?q=xxx），方便分享</div>
				</div>
			</div>
		</div>

		<div v-else-if="query && articles.length === 0" class="empty">
			<h3>没找到匹配「{{ query }}」的文章</h3>
			<p class="muted">试试其他关键词，或检查拼写。</p>
		</div>

		<div v-else-if="query && articles.length > 0" class="results">
			<p class="results-meta">
				找到 <strong>{{ articles.length }}</strong>
				篇匹配「<strong>{{ query }}</strong>」的文章
			</p>
			<div class="grid">
				<ArticleCard v-for="a in articles" :key="a.id" :article="a" />
			</div>
		</div>
	</section>
</template>

<style scoped>
.search-page {
	padding: var(--space-6) 0 var(--space-12);
	min-height: 60vh;
}

.search-header {
	margin-bottom: var(--space-6);
}

.search-header h1 {
	font-size: 2rem;
	margin-bottom: var(--space-2);
}

.lede {
	font-size: 1rem;
}

.search-box {
	position: relative;
	display: flex;
	align-items: center;
	gap: var(--space-3);
	padding: var(--space-3) var(--space-4);
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-sm);
	margin-bottom: var(--space-8);
	transition:
		border-color var(--transition),
		box-shadow var(--transition);
}

.search-box:focus-within {
	border-color: var(--color-accent);
	box-shadow:
		0 0 0 3px var(--color-accent-soft),
		var(--shadow-sm);
}

.search-icon {
	color: var(--color-text-muted);
	flex-shrink: 0;
}

.search-box input {
	flex: 1;
	min-width: 0;
	padding: var(--space-2) 0;
	background: transparent;
	border: 0;
	outline: 0;
	font-size: 1.0625rem;
	color: var(--color-text);
}

.search-box input::placeholder {
	color: var(--color-text-muted);
}

/* Hide native clear button (we have our own) */
.search-box input::-webkit-search-decoration,
.search-box input::-webkit-search-cancel-button,
.search-box input::-webkit-search-results-button,
.search-box input::-webkit-search-results-decoration {
	-webkit-appearance: none;
}

.clear-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	border-radius: 50%;
	color: var(--color-text-muted);
	transition:
		background var(--transition-fast),
		color var(--transition-fast);
}

.clear-btn:hover {
	background: var(--color-bg-muted);
	color: var(--color-text);
}

.state {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: var(--space-3);
	padding: var(--space-12) var(--space-6);
	color: var(--color-text-muted);
	background: var(--color-bg-soft);
	border: 1px dashed var(--color-border);
	border-radius: var(--radius-lg);
}

.state--error {
	color: var(--color-danger);
	border-color: var(--color-danger);
}

.spinner {
	width: 24px;
	height: 24px;
	border: 2.5px solid var(--color-bg-muted);
	border-top-color: var(--color-accent);
	border-radius: 50%;
	animation: spin 0.7s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.empty {
	padding: var(--space-12) var(--space-6);
	text-align: center;
	background: var(--color-bg-soft);
	border: 1px dashed var(--color-border);
	border-radius: var(--radius-lg);
}

.empty h3 {
	font-size: 1.25rem;
	margin-bottom: var(--space-3);
}

.empty--hint {
	padding: var(--space-16) var(--space-6);
	border-style: solid;
	border-color: var(--color-border-soft);
}

.hint-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: var(--space-6);
	max-width: 720px;
	margin: 0 auto;
}

.hint-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--space-2);
	padding: var(--space-4);
	text-align: center;
}

.hint-icon {
	font-size: 2rem;
	margin-bottom: var(--space-2);
}

.hint-title {
	font-size: 1rem;
	font-weight: 600;
	color: var(--color-text);
}

.hint-text {
	font-size: 0.875rem;
	color: var(--color-text-muted);
	line-height: 1.5;
}

.results-meta {
	font-size: 0.9375rem;
	color: var(--color-text-soft);
	margin-bottom: var(--space-6);
}

.results-meta strong {
	color: var(--color-accent);
	font-weight: 600;
}

.grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: var(--space-5);
}

@media (max-width: 1024px) {
	.grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.hint-grid {
		grid-template-columns: 1fr;
		gap: var(--space-4);
	}
}

@media (max-width: 640px) {
	.grid {
		grid-template-columns: 1fr;
	}
	.search-header h1 {
		font-size: 1.5rem;
	}
}
</style>