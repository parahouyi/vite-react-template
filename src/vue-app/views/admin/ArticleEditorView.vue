<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
	createArticle,
	fetchAdminArticle,
	updateArticle,
} from "../../api/admin";
import { fetchAdminCategories } from "../../api/admin";
import { renderMarkdown } from "../../utils/markdown";
import type { Category } from "../../api/types";

const route = useRoute();
const router = useRouter();

const categories = ref<Category[]>([]);
const saving = ref(false);
const error = ref<string | null>(null);

const title = ref("");
const slug = ref("");
const slugTouched = ref(false);
const excerpt = ref("");
const content = ref("");
const coverImage = ref("");
const categoryId = ref<number | null>(null);
const tagsInput = ref("");
const published = ref(false);

const previewHtml = computed(() => renderMarkdown(content.value).html);
const slugAuto = computed(() => {
	const ascii = title.value
		.toLowerCase()
		.trim()
		.replace(/['"`]/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "");
	if (ascii) return ascii;
	const cjk = title.value.trim().replace(/\s+/g, "-").replace(/[^\u4e00-\u9fff-]+/g, "");
	return cjk || "";
});

watch(slugAuto, (val) => {
	if (!slugTouched.value) slug.value = val;
});

function onSlugInput() {
	slugTouched.value = true;
}

async function loadCategories() {
	const data = await fetchAdminCategories();
	categories.value = data.categories;
}

async function loadForEdit() {
	const idStr = route.params.id;
	if (!idStr || Array.isArray(idStr)) return;
	const id = Number(idStr);
	if (!Number.isInteger(id) || id <= 0) return;
	try {
		const data = await fetchAdminArticle(id);
		const a = data.article;
		title.value = a.title;
		slug.value = a.slug;
		slugTouched.value = true;
		excerpt.value = a.excerpt ?? "";
		content.value = a.content;
		coverImage.value = a.cover_image ?? "";
		categoryId.value = a.category_name
			? categories.value.find((c) => c.slug === a.category_slug)?.id ?? null
			: null;
		tagsInput.value = a.tags.join(", ");
		published.value = a.published === 1;
	} catch (e) {
		error.value = e instanceof Error ? e.message : "加载失败";
	}
}

async function save(asPublished: boolean) {
	error.value = null;
	const t = title.value.trim();
	const c = content.value.trim();
	if (!t) {
		error.value = "请填写标题";
		return;
	}
	if (!c) {
		error.value = "请填写内容";
		return;
	}

	saving.value = true;
	const payload = {
		title: t,
		slug: slug.value.trim(),
		content: c,
		excerpt: excerpt.value.trim(),
		cover_image: coverImage.value.trim(),
		category_id: categoryId.value,
		tags: tagsInput.value
			.split(/[,，]/)
			.map((s) => s.trim())
			.filter(Boolean),
		published: asPublished,
	};

	try {
		const idStr = route.params.id;
		const isEdit = idStr && !Array.isArray(idStr) && Number(idStr) > 0;
		if (isEdit) {
			await updateArticle(Number(idStr), payload);
		} else {
			await createArticle(payload);
		}
		router.push("/admin/articles");
	} catch (e) {
		error.value = e instanceof Error ? e.message : "保存失败";
	} finally {
		saving.value = false;
	}
}

function insertSnippet(snippet: string) {
	const textarea = document.getElementById("md-editor") as HTMLTextAreaElement | null;
	if (!textarea) {
		content.value += snippet;
		return;
	}
	const start = textarea.selectionStart;
	const end = textarea.selectionEnd;
	content.value =
		content.value.slice(0, start) + snippet + content.value.slice(end);
	setTimeout(() => {
		textarea.focus();
		const pos = start + snippet.length;
		textarea.setSelectionRange(pos, pos);
	}, 0);
}

onMounted(async () => {
	await loadCategories();
	await loadForEdit();
});
</script>

<template>
	<div class="editor-page">
		<header class="toolbar">
			<button type="button" class="btn btn-ghost" @click="router.back()">
				← 返回
			</button>
			<div class="spacer" />
			<button
				type="button"
				class="btn btn-ghost"
				:disabled="saving"
				@click="save(false)"
			>
				{{ saving ? "保存中…" : "保存草稿" }}
			</button>
			<button
				type="button"
				class="btn btn-primary"
				:disabled="saving"
				@click="save(true)"
			>
				{{ saving ? "发布中…" : published ? "更新发布" : "立即发布" }}
			</button>
		</header>

		<div class="meta-grid">
			<label class="field field-wide">
				<span>标题 *</span>
				<input
					v-model="title"
					type="text"
					placeholder="给你的文章起个标题"
					class="title-input"
				/>
			</label>

			<label class="field">
				<span>Slug（URL）</span>
				<input
					v-model="slug"
					type="text"
					placeholder="自动生成"
					@input="onSlugInput"
				/>
				<span class="hint">
					最终 URL: <code>/articles/{{ slug || "your-slug" }}</code>
				</span>
			</label>

			<label class="field">
				<span>分类</span>
				<select v-model="categoryId">
					<option :value="null">未分类</option>
					<option v-for="c in categories" :key="c.id" :value="c.id">
						{{ c.name }}
					</option>
				</select>
			</label>

			<label class="field field-wide">
				<span>摘要（留空则自动从内容截取）</span>
				<textarea v-model="excerpt" rows="2" maxlength="500" />
			</label>

			<label class="field">
				<span>标签（逗号分隔）</span>
				<input
					v-model="tagsInput"
					type="text"
					placeholder="Vue, Cloudflare, 教程"
				/>
			</label>

			<label class="field">
				<span>封面图 URL</span>
				<input
					v-model="coverImage"
					type="url"
					placeholder="https://..."
				/>
			</label>

			<div v-if="coverImage" class="cover-preview field-wide">
				<span>封面预览</span>
				<img :src="coverImage" alt="封面预览" />
			</div>
		</div>

		<div class="editor-grid">
			<section class="pane">
				<header class="pane-header">
					<span>编辑器（Markdown）</span>
					<div class="snippets">
						<button type="button" class="snip" @click="insertSnippet('# 标题')">
							H1
						</button>
						<button
							type="button"
							class="snip"
							@click="insertSnippet('**加粗**')"
						>
							B
						</button>
						<button type="button" class="snip" @click="insertSnippet('`代码`')">
							`
						</button>
						<button
							type="button"
							class="snip"
							@click="insertSnippet('\n```javascript\n\n```\n')"
						>
							{ }
						</button>
						<button
							type="button"
							class="snip"
							@click="insertSnippet('[链接文字](https://)')"
						>
							链接
						</button>
					</div>
				</header>
				<textarea
					id="md-editor"
					v-model="content"
					class="md-editor"
					placeholder="开始写你的 Markdown…"
				/>
			</section>

			<section class="pane">
				<header class="pane-header">
					<span>实时预览</span>
					<span class="char-count">{{ content.length }} 字符</span>
				</header>
				<div class="article-content preview" v-html="previewHtml" />
			</section>
		</div>

		<div v-if="error" class="error-bar">{{ error }}</div>

		<footer class="footer-bar">
			<label class="publish-toggle">
				<input v-model="published" type="checkbox" />
				<span>已发布（取消勾选则为草稿）</span>
			</label>
		</footer>
	</div>
</template>

<style scoped>
.editor-page {
	display: flex;
	flex-direction: column;
	gap: var(--space-5);
}

.toolbar {
	display: flex;
	align-items: center;
	gap: var(--space-2);
	padding-bottom: var(--space-4);
	border-bottom: 1px solid var(--color-border-soft);
}

.spacer {
	flex: 1;
}

.meta-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: var(--space-4);
	padding: var(--space-5);
	background: var(--color-bg-soft);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
}

.field {
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
}

.field-wide {
	grid-column: 1 / -1;
}

.field > span:first-child {
	font-size: 0.8125rem;
	font-weight: 500;
	color: var(--color-text-soft);
}

.field input,
.field select,
.field textarea {
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

.field input:focus,
.field select:focus,
.field textarea:focus {
	outline: none;
	border-color: var(--color-accent);
	box-shadow: 0 0 0 3px var(--color-accent-soft);
}

.title-input {
	font-size: 1.125rem !important;
	font-weight: 600;
}

.field textarea {
	resize: vertical;
	font-family: inherit;
}

.hint {
	font-size: 0.75rem;
	color: var(--color-text-muted);
}

.hint code {
	padding: 1px 6px;
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: 4px;
	font-family: var(--font-mono);
	color: var(--color-accent);
}

.cover-preview {
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
}

.cover-preview > span:first-child {
	font-size: 0.8125rem;
	font-weight: 500;
	color: var(--color-text-soft);
}

.cover-preview img {
	max-height: 160px;
	width: auto;
	max-width: 100%;
	border-radius: var(--radius-sm);
	border: 1px solid var(--color-border);
	object-fit: cover;
}

.editor-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: var(--space-4);
	min-height: 600px;
}

.pane {
	display: flex;
	flex-direction: column;
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
	overflow: hidden;
}

.pane-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: var(--space-3) var(--space-4);
	background: var(--color-bg-soft);
	border-bottom: 1px solid var(--color-border-soft);
	font-size: 0.8125rem;
	font-weight: 500;
	color: var(--color-text-soft);
}

.snippets {
	display: inline-flex;
	gap: 4px;
}

.snip {
	padding: 2px 8px;
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-sm);
	font-size: 0.75rem;
	font-family: var(--font-mono);
	color: var(--color-text-soft);
	transition: all var(--transition-fast);
}

.snip:hover {
	background: var(--color-accent-soft);
	color: var(--color-accent);
	border-color: var(--color-accent);
}

.md-editor {
	flex: 1;
	width: 100%;
	padding: var(--space-5);
	background: var(--color-bg);
	border: 0;
	font-family: var(--font-mono);
	font-size: 0.9375rem;
	line-height: 1.7;
	color: var(--color-text);
	resize: vertical;
	min-height: 540px;
}

.md-editor:focus {
	outline: none;
}

.preview {
	padding: var(--space-5) var(--space-6);
	overflow-y: auto;
	max-height: 700px;
}

.char-count {
	color: var(--color-text-muted);
	font-size: 0.75rem;
	font-weight: 400;
}

.error-bar {
	padding: var(--space-3) var(--space-4);
	background: rgba(239, 68, 68, 0.08);
	border: 1px solid var(--color-danger);
	border-radius: var(--radius);
	color: var(--color-danger);
	font-size: 0.875rem;
}

.footer-bar {
	padding: var(--space-4);
	background: var(--color-bg-soft);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
}

.publish-toggle {
	display: inline-flex;
	align-items: center;
	gap: var(--space-2);
	font-size: 0.9375rem;
	cursor: pointer;
}

.publish-toggle input[type="checkbox"] {
	width: 18px;
	height: 18px;
	accent-color: var(--color-accent);
}

@media (max-width: 1024px) {
	.meta-grid {
		grid-template-columns: 1fr;
	}
	.editor-grid {
		grid-template-columns: 1fr;
		min-height: auto;
	}
	.md-editor {
		min-height: 300px;
	}
}
</style>