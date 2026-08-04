<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import dayjs from "dayjs";
import {
	deleteComment,
	fetchAdminComments,
	type AdminCommentListItem,
} from "../../api/admin";

const comments = ref<AdminCommentListItem[]>([]);
const loading = ref(true);
const search = ref("");

async function load() {
	loading.value = true;
	try {
		const data = await fetchAdminComments();
		comments.value = data.comments;
	} finally {
		loading.value = false;
	}
}

const filtered = computed(() => {
	if (!search.value) return comments.value;
	const q = search.value.toLowerCase();
	return comments.value.filter(
		(c) =>
			c.author_name.toLowerCase().includes(q) ||
			c.content.toLowerCase().includes(q) ||
			(c.article_title || "").toLowerCase().includes(q),
	);
});

async function onDelete(c: AdminCommentListItem) {
	const ok = confirm(`确定删除 ${c.author_name} 的这条评论？`);
	if (!ok) return;
	try {
		await deleteComment(c.id);
		await load();
	} catch (e) {
		alert(e instanceof Error ? e.message : "删除失败");
	}
}

function formatDate(s: string) {
	return dayjs(s).format("YYYY-MM-DD HH:mm");
}

onMounted(load);
</script>

<template>
	<div class="comment-admin">
		<header class="toolbar">
			<input
				v-model="search"
				type="search"
				placeholder="搜索评论人、内容或文章标题…"
				class="search"
			/>
			<div class="count muted">
				共 {{ filtered.length }} 条
			</div>
		</header>

		<div v-if="loading" class="placeholder">加载中…</div>

		<ul v-else-if="filtered.length" class="list">
			<li v-for="c in filtered" :key="c.id" class="item">
				<div class="head">
					<div class="author">
						<div class="avatar">{{ c.author_name.charAt(0).toUpperCase() }}</div>
						<div class="info">
							<div class="name">{{ c.author_name }}</div>
							<div class="meta">
								评论于
								<RouterLink
									v-if="c.article_slug"
									:to="`/articles/${c.article_slug}`"
									target="_blank"
									class="article-link"
								>
									{{ c.article_title }}
								</RouterLink>
								<span v-else class="muted">已删除的文章</span>
							</div>
						</div>
					</div>
					<div class="right">
						<time class="time muted">{{ formatDate(c.created_at) }}</time>
						<button
							type="button"
							class="btn btn-ghost btn-sm btn-danger"
							@click="onDelete(c)"
						>
							删除
						</button>
					</div>
				</div>
				<div class="content">{{ c.content }}</div>
			</li>
		</ul>

		<div v-else class="placeholder">没有评论</div>
	</div>
</template>

<style scoped>
.comment-admin {
	display: flex;
	flex-direction: column;
	gap: var(--space-5);
}

.toolbar {
	display: flex;
	align-items: center;
	gap: var(--space-4);
}

.search {
	flex: 1;
	padding: var(--space-2) var(--space-3);
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
	font-size: 0.9375rem;
}

.search:focus {
	outline: none;
	border-color: var(--color-accent);
	box-shadow: 0 0 0 3px var(--color-accent-soft);
}

.count {
	font-size: 0.875rem;
}

.placeholder {
	padding: var(--space-12);
	text-align: center;
	color: var(--color-text-muted);
	background: var(--color-bg-soft);
	border: 1px dashed var(--color-border);
	border-radius: var(--radius);
}

.list {
	display: flex;
	flex-direction: column;
	gap: var(--space-3);
}

.item {
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
	padding: var(--space-4) var(--space-5);
	transition: border-color var(--transition-fast);
}

.item:hover {
	border-color: var(--color-text-muted);
}

.head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--space-3);
	margin-bottom: var(--space-3);
}

.author {
	display: flex;
	align-items: center;
	gap: var(--space-3);
}

.avatar {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: linear-gradient(
		135deg,
		var(--color-accent),
		var(--color-cat-life-fg)
	);
	color: var(--color-accent-contrast);
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	font-size: 0.9375rem;
}

.name {
	font-size: 0.9375rem;
	font-weight: 600;
	color: var(--color-text);
}

.meta {
	font-size: 0.8125rem;
	color: var(--color-text-muted);
}

.article-link {
	color: var(--color-accent);
}

.article-link:hover {
	text-decoration: underline;
}

.right {
	display: flex;
	align-items: center;
	gap: var(--space-3);
}

.time {
	font-size: 0.8125rem;
}

.btn-sm {
	padding: 4px 12px;
	font-size: 0.8125rem;
}

.btn-danger {
	color: var(--color-danger);
}

.btn-danger:hover {
	background: rgba(239, 68, 68, 0.1);
}

.content {
	font-size: 0.9375rem;
	color: var(--color-text-soft);
	line-height: 1.6;
	white-space: pre-wrap;
	word-break: break-word;
	padding-left: 48px;
}

.muted {
	color: var(--color-text-muted);
}

@media (max-width: 640px) {
	.head {
		flex-direction: column;
		align-items: flex-start;
	}
	.right {
		align-self: flex-end;
	}
	.content {
		padding-left: 0;
	}
}
</style>