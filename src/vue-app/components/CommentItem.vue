<script setup lang="ts">
import { computed, ref } from "vue";
import dayjs from "dayjs";
import type { Comment } from "../api/types";
import CommentForm from "./CommentForm.vue";

interface CommentNode extends Comment {
	children: CommentNode[];
}

const props = withDefaults(
	defineProps<{
		comment: CommentNode;
		articleId: number;
		depth?: number;
	}>(),
	{ depth: 0 },
);

const emit = defineEmits<{
	replied: [comment: Comment];
}>();

const MAX_VISIBLE_DEPTH = 4;

const showReply = ref(false);
const initial = computed(() =>
	props.comment.author_name.trim().charAt(0).toUpperCase() || "?",
);
const formattedDate = computed(() =>
	dayjs(props.comment.created_at).format("YYYY-MM-DD HH:mm"),
);
const visualDepth = computed(() => Math.min(props.depth, MAX_VISIBLE_DEPTH));

function handleReplied(comment: Comment) {
	showReply.value = false;
	emit("replied", comment);
}
</script>

<template>
	<div class="comment-item" :data-depth="visualDepth">
		<div class="comment-head">
			<div class="avatar">{{ initial }}</div>
			<div class="comment-meta">
				<span class="name">
					<a
						v-if="comment.author_website"
						:href="comment.author_website"
						target="_blank"
						rel="noopener noreferrer"
					>
						{{ comment.author_name }}
					</a>
					<template v-else>{{ comment.author_name }}</template>
				</span>
				<time :datetime="comment.created_at">{{ formattedDate }}</time>
			</div>
		</div>

		<div class="comment-body">{{ comment.content }}</div>

		<div class="comment-actions">
			<button
				type="button"
				class="reply-btn"
				@click="showReply = !showReply"
			>
				{{ showReply ? "取消回复" : "回复" }}
			</button>
		</div>

		<CommentForm
			v-if="showReply"
			:article-id="articleId"
			:parent-id="comment.id"
			:placeholder="`回复 @${comment.author_name}…`"
			compact
			@submitted="handleReplied"
			@cancel="showReply = false"
		/>

		<div v-if="comment.children?.length" class="replies">
			<CommentItem
				v-for="child in comment.children"
				:key="child.id"
				:comment="child"
				:article-id="articleId"
				:depth="depth + 1"
				@replied="$emit('replied', $event)"
			/>
		</div>
	</div>
</template>

<style scoped>
.comment-item {
	padding: var(--space-5) 0;
	border-bottom: 1px solid var(--color-border-soft);
}

.comment-item:last-child {
	border-bottom: 0;
}

.comment-item[data-depth="0"] {
	padding-left: 0;
}

.comment-item[data-depth="1"] {
	padding-left: var(--space-6);
	margin-left: var(--space-2);
	border-left: 2px solid var(--color-border-soft);
}

.comment-item[data-depth="2"] {
	padding-left: var(--space-5);
	border-left: 2px solid var(--color-border-soft);
}

.comment-item[data-depth="3"] {
	padding-left: var(--space-4);
	border-left: 2px solid var(--color-border-soft);
}

.comment-item[data-depth="4"],
.comment-item[data-depth="5"] {
	padding-left: var(--space-3);
	border-left: 2px solid var(--color-border-soft);
}

.comment-head {
	display: flex;
	align-items: center;
	gap: var(--space-3);
	margin-bottom: var(--space-3);
}

.avatar {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: linear-gradient(
		135deg,
		var(--color-accent) 0%,
		var(--color-cat-life-fg) 100%
	);
	color: var(--color-accent-contrast);
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	font-size: 0.9375rem;
	flex-shrink: 0;
}

.comment-meta {
	display: flex;
	align-items: center;
	gap: var(--space-3);
	font-size: 0.875rem;
	flex-wrap: wrap;
}

.name {
	font-weight: 600;
	color: var(--color-text);
}

.name a {
	color: var(--color-text);
	transition: color var(--transition-fast);
}

.name a:hover {
	color: var(--color-accent);
}

.comment-meta time {
	color: var(--color-text-muted);
	font-size: 0.8125rem;
}

.comment-body {
	font-size: 0.9375rem;
	color: var(--color-text-soft);
	line-height: 1.7;
	white-space: pre-wrap;
	word-break: break-word;
}

.comment-actions {
	margin-top: var(--space-3);
}

.reply-btn {
	font-size: 0.8125rem;
	color: var(--color-text-muted);
	padding: 4px 10px;
	border-radius: var(--radius-sm);
	transition:
		background var(--transition-fast),
		color var(--transition-fast);
}

.reply-btn:hover {
	background: var(--color-bg-muted);
	color: var(--color-accent);
}

.replies {
	margin-top: var(--space-4);
}
</style>