<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchCategories } from "../api/articles";
import type { Category } from "../api/types";
import { useMeta } from "../composables/useMeta";

const categories = ref<Category[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

useMeta({
	title: "分类",
	description: "按主题浏览所有文章。",
});

async function load() {
	try {
		const data = await fetchCategories();
		categories.value = data.categories;
	} catch (e) {
		error.value = e instanceof Error ? e.message : "加载失败";
	} finally {
		loading.value = false;
	}
}

onMounted(load);
</script>

<template>
	<section class="categories-page container">
		<header class="page-header">
			<h1>分类</h1>
			<p class="lede muted">按主题浏览所有文章。</p>
		</header>

		<div v-if="loading" class="placeholder">加载中…</div>

		<div v-else-if="error" class="placeholder state--error">
			加载失败：{{ error }}
		</div>

		<div v-else-if="categories.length === 0" class="placeholder">
			暂无分类
		</div>

		<div v-else class="grid">
			<RouterLink
				v-for="c in categories"
				:key="c.id"
				:to="`/categories/${c.slug}`"
				class="category-card"
				:data-slug="c.slug"
			>
				<div class="card-body">
					<div class="card-head">
						<h2>{{ c.name }}</h2>
						<span class="count-pill">{{ c.article_count }} 篇</span>
					</div>
					<p v-if="c.description" class="desc muted">
						{{ c.description }}
					</p>
					<div class="enter-hint">
						查看文章
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M5 12h14m-7-7 7 7-7 7" />
						</svg>
					</div>
				</div>
			</RouterLink>
		</div>
	</section>
</template>

<style scoped>
.categories-page {
	padding: var(--space-8) 0 var(--space-12);
}

.page-header {
	margin-bottom: var(--space-10);
}

.page-header h1 {
	font-size: 2rem;
	margin-bottom: var(--space-2);
}

.lede {
	font-size: 1.0625rem;
}

.placeholder {
	padding: var(--space-12) var(--space-6);
	text-align: center;
	color: var(--color-text-muted);
	background: var(--color-bg-soft);
	border: 1px dashed var(--color-border);
	border-radius: var(--radius-lg);
}

.state--error {
	color: var(--color-danger);
}

.grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: var(--space-5);
}

.category-card {
	display: block;
	padding: var(--space-6);
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	color: inherit;
	transition:
		transform var(--transition),
		border-color var(--transition),
		box-shadow var(--transition);
	position: relative;
	overflow: hidden;
}

.category-card::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 4px;
	background: linear-gradient(
		90deg,
		var(--color-accent),
		var(--color-cat-life-fg)
	);
	opacity: 0;
	transition: opacity var(--transition);
}

.category-card:hover {
	transform: translateY(-4px);
	border-color: transparent;
	box-shadow: var(--shadow-lg);
}

.category-card:hover::before {
	opacity: 1;
}

.card-body {
	display: flex;
	flex-direction: column;
	gap: var(--space-3);
}

.card-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--space-3);
}

.card-head h2 {
	font-size: 1.375rem;
	font-weight: 700;
	color: var(--color-text);
}

.count-pill {
	display: inline-flex;
	padding: 3px 10px;
	background: var(--color-accent-soft);
	color: var(--color-accent);
	border-radius: var(--radius-full);
	font-size: 0.75rem;
	font-weight: 500;
	flex-shrink: 0;
}

.category-card[data-slug="programming"] .count-pill,
.category-card[data-slug="ai"] .count-pill {
	background: var(--color-cat-tech-bg);
	color: var(--color-cat-tech-fg);
}

.category-card[data-slug="life"] .count-pill {
	background: var(--color-cat-life-bg);
	color: var(--color-cat-life-fg);
}

.category-card[data-slug="projects"] .count-pill,
.category-card[data-slug="music"] .count-pill {
	background: var(--color-cat-projects-bg);
	color: var(--color-cat-projects-fg);
}

.desc {
	font-size: 0.9375rem;
	line-height: 1.6;
	min-height: 1.6em;
}

.enter-hint {
	display: inline-flex;
	align-items: center;
	gap: var(--space-1);
	margin-top: auto;
	padding-top: var(--space-3);
	font-size: 0.8125rem;
	color: var(--color-text-muted);
	transition: color var(--transition-fast);
}

.category-card:hover .enter-hint {
	color: var(--color-accent);
}

@media (max-width: 900px) {
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