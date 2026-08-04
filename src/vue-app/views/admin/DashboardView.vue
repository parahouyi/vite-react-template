<script setup lang="ts">
import { onMounted, ref } from "vue";
import dayjs from "dayjs";
import {
	fetchAdminStats,
	type AdminStatsResponse,
} from "../../api/admin";

const data = ref<AdminStatsResponse | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

function formatDate(s: string) {
	return dayjs(s).format("MM-DD HH:mm");
}

onMounted(async () => {
	try {
		data.value = await fetchAdminStats();
	} catch (e) {
		error.value = e instanceof Error ? e.message : "加载失败";
	} finally {
		loading.value = false;
	}
});
</script>

<template>
	<div v-if="loading" class="placeholder">加载中…</div>

	<div v-else-if="error" class="placeholder error">加载失败：{{ error }}</div>

	<div v-else-if="data" class="dashboard">
		<div class="stats">
			<div class="stat-card stat-card--primary">
				<div class="stat-label">文章总数</div>
				<div class="stat-value">{{ data.stats.total_articles }}</div>
				<div class="stat-foot">
					已发布 {{ data.stats.published_articles }} ·
					草稿 {{ data.stats.draft_articles }}
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-label">评论数</div>
				<div class="stat-value">{{ data.stats.total_comments }}</div>
				<div class="stat-foot muted">来自所有文章</div>
			</div>
			<div class="stat-card">
				<div class="stat-label">总浏览量</div>
				<div class="stat-value">{{ data.stats.total_views }}</div>
				<div class="stat-foot muted">累计</div>
			</div>
			<div class="stat-card stat-card--accent">
				<div class="stat-label">草稿</div>
				<div class="stat-value">{{ data.stats.draft_articles }}</div>
				<div class="stat-foot">
					<RouterLink to="/admin/articles/new">去写一篇 →</RouterLink>
				</div>
			</div>
		</div>

		<div class="columns">
			<section class="card-panel">
				<header class="panel-header">
					<h3>最近文章</h3>
					<RouterLink to="/admin/articles" class="link">全部 →</RouterLink>
				</header>
				<ul v-if="data.recent_articles.length" class="list">
					<li
						v-for="a in data.recent_articles"
						:key="a.id"
						class="list-item"
					>
						<RouterLink :to="`/admin/articles/${a.id}/edit`" class="row">
							<span class="title">
								<span
									class="status"
									:class="a.published ? 'status--pub' : 'status--draft'"
								>
									{{ a.published ? "已发布" : "草稿" }}
								</span>
								{{ a.title }}
							</span>
							<span class="meta">{{ formatDate(a.created_at) }}</span>
						</RouterLink>
					</li>
				</ul>
				<p v-else class="muted empty">还没有文章</p>
			</section>

			<section class="card-panel">
				<header class="panel-header">
					<h3>最近评论</h3>
					<RouterLink to="/admin/comments" class="link">全部 →</RouterLink>
				</header>
				<ul v-if="data.recent_comments.length" class="list">
					<li
						v-for="c in data.recent_comments"
						:key="c.id"
						class="list-item comment-row"
					>
						<div class="meta-top">
							<strong>{{ c.author_name }}</strong>
							<span class="muted">
								在
								<RouterLink
									v-if="c.article_slug"
									:to="`/articles/${c.article_slug}`"
									class="link"
								>
									{{ c.article_title }}
								</RouterLink>
								<span v-else>已删除文章</span>
							</span>
						</div>
						<div class="content">{{ c.content }}</div>
						<div class="time muted">{{ formatDate(c.created_at) }}</div>
					</li>
				</ul>
				<p v-else class="muted empty">还没有评论</p>
			</section>
		</div>
	</div>
</template>

<style scoped>
.placeholder {
	padding: var(--space-12);
	text-align: center;
	color: var(--color-text-muted);
}

.placeholder.error {
	color: var(--color-danger);
}

.dashboard {
	display: flex;
	flex-direction: column;
	gap: var(--space-8);
}

.stats {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: var(--space-4);
}

.stat-card {
	padding: var(--space-5);
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
	transition:
		transform var(--transition),
		box-shadow var(--transition);
}

.stat-card:hover {
	transform: translateY(-2px);
	box-shadow: var(--shadow);
}

.stat-card--primary {
	background: linear-gradient(
		135deg,
		var(--color-accent-soft),
		var(--color-bg)
	);
	border-color: var(--color-accent);
}

.stat-card--accent {
	background: linear-gradient(
		135deg,
		var(--color-cat-life-bg),
		var(--color-bg)
	);
}

.stat-label {
	font-size: 0.8125rem;
	color: var(--color-text-muted);
	font-weight: 500;
}

.stat-value {
	font-size: 2rem;
	font-weight: 700;
	color: var(--color-text);
	line-height: 1.2;
}

.stat-foot {
	font-size: 0.8125rem;
	color: var(--color-text-soft);
	margin-top: auto;
}

.stat-foot a {
	color: var(--color-accent);
	font-weight: 500;
}

.columns {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: var(--space-6);
}

.card-panel {
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
	overflow: hidden;
}

.panel-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: var(--space-4) var(--space-5);
	border-bottom: 1px solid var(--color-border-soft);
}

.panel-header h3 {
	font-size: 0.9375rem;
	font-weight: 600;
}

.link {
	color: var(--color-accent);
	font-size: 0.8125rem;
	font-weight: 500;
}

.list {
	display: flex;
	flex-direction: column;
}

.list-item {
	border-bottom: 1px solid var(--color-border-soft);
}

.list-item:last-child {
	border-bottom: 0;
}

.row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--space-3);
	padding: var(--space-4) var(--space-5);
	transition: background var(--transition-fast);
}

.row:hover {
	background: var(--color-bg-soft);
}

.title {
	display: flex;
	align-items: center;
	gap: var(--space-3);
	font-size: 0.9375rem;
	font-weight: 500;
	color: var(--color-text);
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.status {
	display: inline-flex;
	padding: 2px 8px;
	border-radius: var(--radius-full);
	font-size: 0.6875rem;
	font-weight: 500;
}

.status--pub {
	background: var(--color-cat-life-bg);
	color: var(--color-cat-life-fg);
}

.status--draft {
	background: var(--color-bg-muted);
	color: var(--color-text-muted);
}

.meta {
	font-size: 0.8125rem;
	color: var(--color-text-muted);
	flex-shrink: 0;
}

.comment-row {
	padding: var(--space-4) var(--space-5);
}

.meta-top {
	display: flex;
	align-items: center;
	gap: var(--space-2);
	margin-bottom: var(--space-2);
	font-size: 0.875rem;
}

.content {
	font-size: 0.9375rem;
	color: var(--color-text-soft);
	line-height: 1.5;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.time {
	font-size: 0.75rem;
	margin-top: var(--space-2);
}

.empty {
	padding: var(--space-8);
	text-align: center;
}

.muted {
	color: var(--color-text-muted);
}

@media (max-width: 900px) {
	.stats {
		grid-template-columns: repeat(2, 1fr);
	}
	.columns {
		grid-template-columns: 1fr;
	}
}
</style>