<script setup lang="ts">
import { ref } from "vue";
import { submitComment, type CommentSubmit } from "../api/comments";
import type { Comment } from "../api/types";

const props = withDefaults(
	defineProps<{
		articleId: number;
		parentId?: number | null;
		placeholder?: string;
		compact?: boolean;
	}>(),
	{ parentId: null, placeholder: "说点什么吧…", compact: false },
);

const emit = defineEmits<{
	submitted: [comment: Comment];
	cancel: [];
}>();

const authorName = ref("");
const authorEmail = ref("");
const authorWebsite = ref("");
const content = ref("");
const honeypot = ref("");

const submitting = ref(false);
const error = ref<string | null>(null);

async function onSubmit() {
	error.value = null;
	const name = authorName.value.trim();
	const text = content.value.trim();

	if (!name) {
		error.value = "请填写姓名";
		return;
	}
	if (!text) {
		error.value = "请填写评论内容";
		return;
	}

	submitting.value = true;
	try {
		const payload: CommentSubmit = {
			author_name: name,
			content: text,
			parent_id: props.parentId ?? null,
			_gotcha: honeypot.value,
		};
		if (authorEmail.value.trim()) {
			payload.author_email = authorEmail.value.trim();
		}
		if (authorWebsite.value.trim()) {
			payload.author_website = authorWebsite.value.trim();
		}
		const data = await submitComment(props.articleId, payload);
		if (data.comment.id) {
			emit("submitted", data.comment);
			authorName.value = "";
			authorEmail.value = "";
			authorWebsite.value = "";
			content.value = "";
		}
	} catch (e) {
		error.value =
			e instanceof Error ? e.message : "提交失败，请稍后再试";
	} finally {
		submitting.value = false;
	}
}
</script>

<template>
	<form class="comment-form" :class="{ compact }" @submit.prevent="onSubmit">
		<div v-if="!compact" class="row">
			<input
				v-model="authorName"
				type="text"
				placeholder="姓名 *"
				maxlength="50"
				required
			/>
			<input
				v-model="authorEmail"
				type="email"
				placeholder="邮箱（不公开）"
				maxlength="200"
			/>
		</div>
		<input
			v-if="!compact"
			v-model="authorWebsite"
			type="url"
			placeholder="网站（可选，需含 http://）"
			maxlength="500"
		/>

		<input
			v-model="honeypot"
			type="text"
			name="_gotcha"
			tabindex="-1"
			autocomplete="off"
			class="honeypot"
			aria-hidden="true"
		/>

		<textarea
			v-model="content"
			:placeholder="placeholder"
			rows="4"
			maxlength="2000"
			required
		/>

		<div class="actions">
			<button
				v-if="parentId"
				type="button"
				class="btn btn-ghost"
				@click="emit('cancel')"
			>
				取消
			</button>
			<button type="submit" class="btn btn-primary" :disabled="submitting">
				{{ submitting ? "提交中…" : "发表评论" }}
			</button>
		</div>

		<div v-if="error" class="error">{{ error }}</div>
	</form>
</template>

<style scoped>
.comment-form {
	display: flex;
	flex-direction: column;
	gap: var(--space-3);
	padding: var(--space-5);
	background: var(--color-bg-soft);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
}

.comment-form.compact {
	padding: var(--space-4);
	background: transparent;
	border-style: dashed;
}

.row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: var(--space-3);
}

.comment-form input,
.comment-form textarea {
	width: 100%;
	padding: var(--space-3);
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-sm);
	font-size: 0.9375rem;
	color: var(--color-text);
	transition:
		border-color var(--transition-fast),
		box-shadow var(--transition-fast);
}

.comment-form.compact input,
.comment-form.compact textarea {
	background: var(--color-bg);
}

.comment-form input:focus,
.comment-form textarea:focus {
	outline: none;
	border-color: var(--color-accent);
	box-shadow: 0 0 0 3px var(--color-accent-soft);
}

.comment-form textarea {
	resize: vertical;
	min-height: 80px;
	font-family: inherit;
	line-height: 1.6;
}

.actions {
	display: flex;
	justify-content: flex-end;
	gap: var(--space-2);
}

.error {
	color: var(--color-danger);
	font-size: 0.875rem;
	padding: var(--space-2) var(--space-3);
	background: rgba(239, 68, 68, 0.08);
	border-radius: var(--radius-sm);
	border: 1px solid var(--color-danger);
}

.honeypot {
	position: absolute !important;
	left: -9999px !important;
	width: 1px !important;
	height: 1px !important;
	opacity: 0 !important;
	pointer-events: none !important;
}

@media (max-width: 640px) {
	.row {
		grid-template-columns: 1fr;
	}
}
</style>