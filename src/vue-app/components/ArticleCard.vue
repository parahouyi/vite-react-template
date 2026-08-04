<script setup lang="ts">
import { computed } from "vue";
import dayjs from "dayjs";
import type { Article } from "../api/types";

const props = defineProps<{ article: Article }>();

const formattedDate = computed(() =>
	dayjs(props.article.created_at).format("YYYY-MM-DD"),
);

const categoryClass = computed(() => {
	const slug = props.article.category_slug ?? "";
	if (slug === "life") return "category--life";
	if (slug === "projects") return "category--projects";
	if (slug === "tech") return "category--tech";
	return "category--default";
});
</script>

<template>
	<article class="article-card">
		<RouterLink :to="`/articles/${article.slug}`" class="cover">
			<img
				v-if="article.cover_image"
				:src="article.cover_image"
				:alt="article.title"
				loading="lazy"
			/>
			<div v-else class="cover-fallback">
				{{ article.title.charAt(0) }}
			</div>
		</RouterLink>

		<div class="body">
			<div v-if="article.category_name" class="meta-top">
				<RouterLink
					:to="`/categories/${article.category_slug}`"
					class="category"
					:class="categoryClass"
					@click.stop
				>
					{{ article.category_name }}
				</RouterLink>
			</div>

			<h3 class="title">
				<RouterLink :to="`/articles/${article.slug}`">
					{{ article.title }}
				</RouterLink>
			</h3>

			<p v-if="article.excerpt" class="excerpt">{{ article.excerpt }}</p>

			<div class="meta-bottom">
				<time :datetime="article.created_at">{{ formattedDate }}</time>
				<span class="dot">·</span>
				<span>{{ article.views }} 次阅读</span>
			</div>
		</div>
	</article>
</template>

<style scoped>
.article-card {
	display: flex;
	flex-direction: column;
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
	overflow: hidden;
	transition:
		transform var(--transition),
		border-color var(--transition),
		box-shadow var(--transition);
}

.article-card:hover {
	transform: translateY(-4px);
	border-color: transparent;
	box-shadow: var(--shadow-lg);
}

.cover {
	display: block;
	position: relative;
	aspect-ratio: 16 / 9;
	overflow: hidden;
	background: var(--color-bg-muted);
}

.cover img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: transform var(--transition-slow);
}

.article-card:hover .cover img {
	transform: scale(1.05);
}

.cover-fallback {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	font-size: 4rem;
	font-weight: 700;
	color: var(--color-text-muted);
	background:
		linear-gradient(
			135deg,
			var(--color-cat-tech-bg),
			var(--color-cat-life-bg)
		);
}

.body {
	display: flex;
	flex-direction: column;
	flex: 1;
	padding: var(--space-5);
	gap: var(--space-3);
}

.meta-top {
	display: flex;
	align-items: center;
	gap: var(--space-2);
}

.category {
	display: inline-flex;
	align-items: center;
	padding: 2px 10px;
	border-radius: var(--radius-full);
	font-size: 0.75rem;
	font-weight: 500;
	transition:
		filter var(--transition-fast),
		transform var(--transition-fast);
}

.category:hover {
	filter: brightness(0.95);
	transform: translateY(-1px);
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

.category--default {
	background: var(--color-accent-soft);
	color: var(--color-accent);
}

.title {
	font-size: 1.125rem;
	line-height: 1.4;
	font-weight: 600;
	margin: 0;
}

.title a {
	color: var(--color-text);
	transition: color var(--transition-fast);
}

.title a:hover {
	color: var(--color-accent);
}

.excerpt {
	font-size: 0.9375rem;
	color: var(--color-text-soft);
	line-height: 1.6;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.meta-bottom {
	margin-top: auto;
	display: flex;
	align-items: center;
	gap: var(--space-2);
	font-size: 0.8125rem;
	color: var(--color-text-muted);
}

.dot {
	color: var(--color-text-muted);
}
</style>