<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
	currentPage: number;
	totalPages: number;
}>();

const emit = defineEmits<{
	change: [page: number];
}>();

type PageItem = number | "ellipsis";

const pages = computed<PageItem[]>(() => {
	const total = props.totalPages;
	const current = props.currentPage;

	if (total <= 1) return [];
	if (total <= 7) {
		return Array.from({ length: total }, (_, i) => i + 1);
	}

	const result: PageItem[] = [1];
	const start = Math.max(2, current - 1);
	const end = Math.min(total - 1, current + 1);

	if (start > 2) result.push("ellipsis");
	for (let i = start; i <= end; i++) result.push(i);
	if (end < total - 1) result.push("ellipsis");
	result.push(total);

	return result;
});

function go(p: number) {
	if (p < 1 || p > props.totalPages || p === props.currentPage) return;
	emit("change", p);
}
</script>

<template>
	<nav v-if="totalPages > 1" class="pagination" aria-label="分页">
		<button
			class="page-btn page-btn--nav"
			:disabled="currentPage <= 1"
			aria-label="上一页"
			@click="go(currentPage - 1)"
		>
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
				<path d="m15 18-6-6 6-6" />
			</svg>
		</button>

		<template v-for="(p, i) in pages" :key="i">
			<span v-if="p === 'ellipsis'" class="ellipsis">…</span>
			<button
				v-else
				class="page-btn"
				:class="{ active: p === currentPage }"
				:aria-current="p === currentPage ? 'page' : undefined"
				@click="go(p)"
			>
				{{ p }}
			</button>
		</template>

		<button
			class="page-btn page-btn--nav"
			:disabled="currentPage >= totalPages"
			aria-label="下一页"
			@click="go(currentPage + 1)"
		>
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
				<path d="m9 18 6-6-6-6" />
			</svg>
		</button>
	</nav>
</template>

<style scoped>
.pagination {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: var(--space-1);
	padding: var(--space-10) 0 var(--space-4);
}

.page-btn {
	min-width: 36px;
	height: 36px;
	padding: 0 var(--space-3);
	border-radius: var(--radius-sm);
	background: var(--color-bg);
	color: var(--color-text-soft);
	font-size: 0.875rem;
	font-weight: 500;
	border: 1px solid var(--color-border);
	transition:
		background var(--transition-fast),
		color var(--transition-fast),
		border-color var(--transition-fast),
		transform var(--transition-fast);
}

.page-btn:hover:not(:disabled):not(.active) {
	background: var(--color-bg-muted);
	color: var(--color-text);
}

.page-btn:active:not(:disabled) {
	transform: scale(0.96);
}

.page-btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

.page-btn.active {
	background: var(--color-accent);
	color: var(--color-accent-contrast);
	border-color: var(--color-accent);
}

.page-btn--nav {
	padding: 0 var(--space-2);
}

.ellipsis {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 28px;
	height: 36px;
	color: var(--color-text-muted);
	font-size: 0.875rem;
	user-select: none;
}

@media (max-width: 480px) {
	.page-btn {
		min-width: 32px;
		height: 32px;
		font-size: 0.8125rem;
	}
}
</style>