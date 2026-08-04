<script setup lang="ts">
import type { TocItem } from "../utils/markdown";

defineProps<{ items: TocItem[]; activeId: string }>();

function scrollTo(id: string, e: MouseEvent) {
	e.preventDefault();
	const el = document.getElementById(id);
	if (!el) return;
	const y = el.getBoundingClientRect().top + window.scrollY - 80;
	window.scrollTo({ top: y, behavior: "smooth" });
	history.replaceState(null, "", `#${id}`);
}
</script>

<template>
	<aside class="toc">
		<div class="toc-title">目录</div>
		<ul class="toc-list">
			<li
				v-for="item in items"
				:key="item.id"
				:data-level="item.level"
				class="toc-item-wrap"
			>
				<a
					:href="`#${item.id}`"
					class="toc-item"
					:class="{ active: activeId === item.id }"
					:data-level="item.level"
					@click="scrollTo(item.id, $event)"
				>
					{{ item.text }}
				</a>
			</li>
		</ul>
	</aside>
</template>

<style scoped>
.toc {
	position: sticky;
	top: calc(var(--header-height) + var(--space-6));
	max-height: calc(100vh - var(--header-height) - var(--space-12));
	overflow-y: auto;
	padding: var(--space-4) 0;
}

.toc-title {
	font-size: 0.75rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: var(--color-text-muted);
	margin-bottom: var(--space-3);
	padding-left: var(--space-3);
}

.toc-list {
	display: flex;
	flex-direction: column;
	gap: 2px;
	border-left: 2px solid var(--color-border-soft);
	padding-left: 0;
}

.toc-item-wrap {
	display: block;
}

.toc-item {
	display: block;
	padding: var(--space-2) var(--space-3);
	color: var(--color-text-soft);
	font-size: 0.875rem;
	line-height: 1.4;
	border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
	transition:
		color var(--transition-fast),
		background var(--transition-fast);
	word-break: break-word;
}

.toc-item[data-level="3"] {
	padding-left: var(--space-6);
	font-size: 0.8125rem;
	color: var(--color-text-muted);
}

.toc-item:hover {
	color: var(--color-accent);
}

.toc-item.active {
	color: var(--color-accent);
	background: var(--color-accent-soft);
	font-weight: 500;
}

@media (max-width: 1024px) {
	.toc {
		display: none;
	}
}
</style>