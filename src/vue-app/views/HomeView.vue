<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchArticles } from "../api/articles";
import type { Article } from "../api/types";
import ArticleCard from "../components/ArticleCard.vue";
import { useMeta } from "../composables/useMeta";

const articles = ref<Article[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

useMeta({
	title: "首页",
	description: "Simon 的个人博客 — 最新文章、技术笔记与生活随想。",
});

onMounted(async () => {
	try {
		const data = await fetchArticles({ limit: 12 });
		articles.value = data.articles;
	} catch (e) {
		error.value = e instanceof Error ? e.message : "Unknown error";
	} finally {
		loading.value = false;
	}
});
</script>

<template>
	<div class="home-view">
		<section class="hero container">
			<div class="hero-inner">
				<span class="eyebrow">Hello, I'm Simon</span>
				<h1>记录、思考、分享。</h1>
				<p class="lede">
					这里是 Simon 的个人博客 — 写技术笔记、项目心得与偶尔的随想。
					希望这些文字对你有用。
				</p>
				<div class="cta">
					<RouterLink to="/articles" class="btn btn-primary">浏览文章</RouterLink>
					<RouterLink to="/about" class="btn btn-ghost">关于我</RouterLink>
				</div>
			</div>
		</section>

		<section class="articles-section container">
			<header class="section-header">
				<h2>最新文章</h2>
				<RouterLink to="/articles" class="more">查看全部 →</RouterLink>
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

			<div v-else-if="error" class="state state--error">
				加载失败：{{ error }}
			</div>

			<div v-else-if="articles.length === 0" class="state">
				还没有发布的文章，去 <RouterLink to="/login">登录</RouterLink> 写第一篇吧。
			</div>

			<div v-else class="grid">
				<ArticleCard v-for="a in articles" :key="a.id" :article="a" />
			</div>
		</section>
	</div>
</template>

<style scoped>
.hero {
	position: relative;
	padding: var(--space-20) 0 var(--space-12);
}

.hero::before {
	content: "";
	position: absolute;
	inset: -10% -5% 0;
	background:
		radial-gradient(circle at 15% 30%, var(--color-mesh-1), transparent 45%),
		radial-gradient(circle at 85% 70%, var(--color-mesh-2), transparent 45%),
		radial-gradient(circle at 50% 100%, var(--color-mesh-3), transparent 50%),
		radial-gradient(circle at 80% 10%, var(--color-mesh-4), transparent 40%);
	pointer-events: none;
	z-index: -1;
	filter: blur(20px);
}

.hero-inner {
	max-width: 720px;
}

.eyebrow {
	display: inline-block;
	padding: var(--space-1) var(--space-3);
	background: var(--color-accent-soft);
	color: var(--color-accent);
	border-radius: var(--radius-full);
	font-size: 0.8125rem;
	font-weight: 500;
	margin-bottom: var(--space-6);
}

.hero h1 {
	font-size: clamp(2.5rem, 6vw, 4rem);
	letter-spacing: -0.02em;
	background: linear-gradient(
		135deg,
		var(--color-text) 0%,
		var(--color-accent) 60%,
		var(--color-cat-life-fg) 100%
	);
	-webkit-background-clip: text;
	background-clip: text;
	color: transparent;
	margin-bottom: var(--space-6);
}

.lede {
	font-size: 1.125rem;
	color: var(--color-text-soft);
	max-width: 600px;
	margin-bottom: var(--space-8);
}

.cta {
	display: flex;
	gap: var(--space-3);
	flex-wrap: wrap;
}

.articles-section {
	padding: var(--space-10) 0;
}

.section-header {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	margin-bottom: var(--space-8);
}

.section-header h2 {
	font-size: 1.5rem;
}

.more {
	color: var(--color-text-soft);
	font-size: 0.9375rem;
	font-weight: 500;
}

.more:hover {
	color: var(--color-accent);
}

.grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: var(--space-6);
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

.state {
	padding: var(--space-12) var(--space-6);
	text-align: center;
	background: var(--color-bg-soft);
	border: 1px dashed var(--color-border);
	border-radius: var(--radius-lg);
	color: var(--color-text-soft);
}

.state--error {
	color: var(--color-danger);
	border-color: var(--color-danger);
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
</style>