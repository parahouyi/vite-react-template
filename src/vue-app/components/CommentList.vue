<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { fetchComments } from "../api/comments";
import type { Comment } from "../api/types";
import CommentItem from "./CommentItem.vue";
import CommentForm from "./CommentForm.vue";

interface CommentNode extends Comment {
	children: CommentNode[];
}

const props = defineProps<{ articleId: number }>();

const comments = ref<Comment[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function load() {
	loading.value = true;
	error.value = null;
	try {
		const data = await fetchComments(props.articleId);
		comments.value = data.comments;
	} catch (e) {
		error.value = e instanceof Error ? e.message : "加载失败";
	} finally {
		loading.value = false;
	}
}

const tree = computed<CommentNode[]>(() => {
	const map = new Map<number, CommentNode>();
	const roots: CommentNode[] = [];

	for (const c of comments.value) {
		map.set(c.id, { ...c, children: [] });
	}
	for (const c of comments.value) {
		const node = map.get(c.id);
		if (!node) continue;
		if (c.parent_id && map.has(c.parent_id)) {
			map.get(c.parent_id)!.children.push(node);
		} else {
			roots.push(node);
		}
	}
	return roots;
});

async function handleReplied() {
	await load();
}

onMounted(load);
</script>

<template>
	<section class="comments">
		<h3 class="title">
			评论
			<span class="count">({{ comments.length }})</span>
		</h3>

		<div class="form-wrap">
			<CommentForm :article-id="articleId" @submitted="handleReplied" />
		</div>

		<div v-if="loading" class="state">加载评论中…</div>
		<div v-else-if="error" class="state state--error">加载失败：{{ error }}</div>
		<div v-else-if="comments.length === 0" class="state">
			还没有评论，来留下第一条吧。
		</div>
		<div v-else class="list">
			<CommentItem
				v-for="c in tree"
				:key="c.id"
				:comment="c"
				:article-id="articleId"
				@replied="handleReplied"
			/>
		</div>
	</section>
</template>

<style scoped>
.comments {
	margin-top: var(--space-12);
	padding-top: var(--space-8);
	border-top: 1px solid var(--color-border);
}

.title {
	font-size: 1.5rem;
	margin-bottom: var(--space-6);
	display: flex;
	align-items: baseline;
	gap: var(--space-2);
}

.count {
	font-size: 1rem;
	color: var(--color-text-muted);
	font-weight: 400;
}

.form-wrap {
	margin-bottom: var(--space-8);
}

.state {
	padding: var(--space-10) var(--space-4);
	text-align: center;
	color: var(--color-text-soft);
	background: var(--color-bg-soft);
	border: 1px dashed var(--color-border);
	border-radius: var(--radius);
}

.state--error {
	color: var(--color-danger);
	border-color: var(--color-danger);
}
</style>