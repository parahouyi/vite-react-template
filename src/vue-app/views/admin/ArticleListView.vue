<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import {
	deleteArticle,
	fetchAdminArticles,
	type AdminArticleListItem,
} from "../../api/admin";

const router = useRouter();
const articles = ref<AdminArticleListItem[]>([]);
const loading = ref(true);
const search = ref("");
const filter = ref<"all" | "pub" | "draft">("all");

async function load() {
	loading.value = true;
	try {
		const data = await fetchAdminArticles();
		articles.value = data.articles;
	} finally {
		loading.value = false;
	}
}

const filtered = computed(() => {
	let list = articles.value;
	if (filter.value === "pub") list = list.filter((a) => a.published);
	if (filter.value === "draft") list = list.filter((a) => !a.published);
	if (search.value) {
		const q = search.value.toLowerCase();
		list = list.filter(
			(a) =>
				a.title.toLowerCase().includes(q) ||
				(a.excerpt || "").toLowerCase().includes(q),
		);
	}
	return list;
});

async function onDelete(a: AdminArticleListItem) {
	const ok = confirm(
		`确定删除「${a.title}」？\n关联的所有评论也会被删除。`,
	);
	if (!ok) return;
	try {
		await deleteArticle(a.id);
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
	<div class="article-list">
		<header class="toolbar">
			<input
				v-model="search"
				type="search"
				placeholder="搜索标题或摘要…"
				class="search"
			/>
			<div class="filters">
				<button
					type="button"
					class="filter"
					:class="{ active: filter === 'all' }"
					@click="filter = 'all'"
				>
					全部 ({{ articles.length }})
				</button>
				<button
					type="button"
					class="filter"
					:class="{ active: filter === 'pub' }"
					@click="filter = 'pub'"
				>
					已发布 ({{ articles.filter((a) => a.published).length }})
				</button>
				<button
					type="button"
					class="filter"
					:class="{ active: filter === 'draft' }"
					@click="filter = 'draft'"
				>
					草稿 ({{ articles.filter((a) => !a.published).length }})
				</button>
			</div>
			<button
				type="button"
				class="btn btn-primary"
				@click="router.push('/admin/articles/new')"
			>
				+ 新建文章
			</button>
		</header>

		<div v-if="loading" class="placeholder">加载中…</div>

		<table v-else-if="filtered.length" class="table">
			<thead>
				<tr>
					<th class="th-title">标题</th>
					<th>分类</th>
					<th>状态</th>
					<th>浏览</th>
					<th>更新时间</th>
					<th class="th-actions">操作</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="a in filtered" :key="a.id">
					<td>
						<RouterLink
							:to="`/admin/articles/${a.id}/edit`"
							class="title-link"
						>
							{{ a.title }}
						</RouterLink>
						<div v-if="a.excerpt" class="excerpt">{{ a.excerpt }}</div>
					</td>
					<td>
						<span v-if="a.category_name" class="category-tag">
							{{ a.category_name }}
						</span>
						<span v-else class="muted">—</span>
					</td>
					<td>
						<span
							class="status"
							:class="a.published ? 'status--pub' : 'status--draft'"
						>
							{{ a.published ? "已发布" : "草稿" }}
						</span>
					</td>
					<td class="num">{{ a.views }}</td>
					<td class="time">{{ formatDate(a.updated_at) }}</td>
					<td>
						<div class="actions">
							<RouterLink
								v-if="a.published"
								:to="`/articles/${a.slug}`"
								target="_blank"
								class="btn btn-ghost btn-sm"
							>
								查看
							</RouterLink>
							<RouterLink
								:to="`/admin/articles/${a.id}/edit`"
								class="btn btn-ghost btn-sm"
							>
								编辑
							</RouterLink>
							<button
								type="button"
								class="btn btn-ghost btn-sm btn-danger"
								@click="onDelete(a)"
							>
								删除
							</button>
						</div>
					</td>
				</tr>
			</tbody>
		</table>

		<div v-else class="placeholder">没有匹配的文章</div>
	</div>
</template>

<style scoped>
.article-list {
	display: flex;
	flex-direction: column;
	gap: var(--space-5);
}

.toolbar {
	display: flex;
	align-items: center;
	gap: var(--space-3);
	flex-wrap: wrap;
}

.search {
	flex: 1;
	min-width: 200px;
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

.filters {
	display: inline-flex;
	gap: var(--space-1);
	padding: 4px;
	background: var(--color-bg-muted);
	border-radius: var(--radius);
}

.filter {
	padding: var(--space-2) var(--space-3);
	border-radius: var(--radius-sm);
	font-size: 0.8125rem;
	color: var(--color-text-soft);
	font-weight: 500;
	transition: all var(--transition-fast);
}

.filter:hover {
	color: var(--color-text);
}

.filter.active {
	background: var(--color-bg);
	color: var(--color-text);
	box-shadow: var(--shadow-sm);
}

.placeholder {
	padding: var(--space-12);
	text-align: center;
	color: var(--color-text-muted);
	background: var(--color-bg-soft);
	border: 1px dashed var(--color-border);
	border-radius: var(--radius);
}

.table {
	width: 100%;
	border-collapse: collapse;
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
	overflow: hidden;
	font-size: 0.9375rem;
}

.table th,
.table td {
	padding: var(--space-3) var(--space-4);
	text-align: left;
	border-bottom: 1px solid var(--color-border-soft);
	vertical-align: top;
}

.table th {
	background: var(--color-bg-soft);
	font-size: 0.8125rem;
	font-weight: 600;
	color: var(--color-text-soft);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.table tbody tr:last-child td {
	border-bottom: 0;
}

.table tbody tr:hover {
	background: var(--color-bg-soft);
}

.th-title {
	width: 40%;
}

.th-actions {
	width: 1%;
	white-space: nowrap;
}

.title-link {
	font-weight: 600;
	color: var(--color-text);
}

.title-link:hover {
	color: var(--color-accent);
}

.excerpt {
	font-size: 0.8125rem;
	color: var(--color-text-muted);
	margin-top: var(--space-1);
	max-width: 400px;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.category-tag {
	display: inline-flex;
	padding: 2px 8px;
	background: var(--color-accent-soft);
	color: var(--color-accent);
	border-radius: var(--radius-full);
	font-size: 0.75rem;
}

.status {
	display: inline-flex;
	padding: 2px 10px;
	border-radius: var(--radius-full);
	font-size: 0.75rem;
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

.num {
	text-align: right;
	color: var(--color-text-soft);
}

.time {
	color: var(--color-text-muted);
	font-size: 0.8125rem;
	white-space: nowrap;
}

.actions {
	display: inline-flex;
	gap: var(--space-1);
}

.btn-sm {
	padding: 4px 10px;
	font-size: 0.8125rem;
}

.btn-danger {
	color: var(--color-danger);
}

.btn-danger:hover {
	background: rgba(239, 68, 68, 0.1);
}

.muted {
	color: var(--color-text-muted);
}
</style>