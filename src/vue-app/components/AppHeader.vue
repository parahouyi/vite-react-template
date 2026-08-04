<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useUiStore } from "../stores/ui";

const ui = useUiStore();
const route = useRoute();
const scrolled = ref(false);
const mobileOpen = ref(false);

const navItems = [
	{ to: "/", label: "首页" },
	{ to: "/articles", label: "文章" },
	{ to: "/categories", label: "分类" },
	{ to: "/about", label: "关于" },
];

function onScroll() {
	scrolled.value = window.scrollY > 8;
}

watch(
	() => route.fullPath,
	() => {
		mobileOpen.value = false;
	},
);

onMounted(() => {
	window.addEventListener("scroll", onScroll, { passive: true });
	onScroll();
});

onUnmounted(() => {
	window.removeEventListener("scroll", onScroll);
});
</script>

<template>
	<header class="app-header" :class="{ scrolled }">
		<div class="container header-inner">
			<RouterLink to="/" class="brand">
				<span class="brand-mark">S</span>
				<span class="brand-text">Simon's Blog</span>
			</RouterLink>

			<nav class="nav" :class="{ open: mobileOpen }">
				<RouterLink
					v-for="item in navItems"
					:key="item.to"
					:to="item.to"
					class="nav-link"
					:active-class="'active'"
				>
					{{ item.label }}
				</RouterLink>
			</nav>

			<div class="actions">
				<RouterLink
					to="/search"
					class="icon-btn"
					aria-label="搜索"
					title="搜索"
				>
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="11" cy="11" r="7" />
						<path d="m20 20-3.5-3.5" />
					</svg>
				</RouterLink>
				<button
					class="icon-btn"
					:aria-label="ui.theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'"
					:title="ui.theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'"
					@click="ui.toggleTheme"
				>
					<svg
						v-if="ui.theme === 'dark'"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="4" />
						<path
							d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"
						/>
					</svg>
					<svg
						v-else
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
					</svg>
				</button>
				<button
					class="icon-btn mobile-toggle"
					aria-label="菜单"
					@click="mobileOpen = !mobileOpen"
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path v-if="!mobileOpen" d="M3 6h18M3 12h18M3 18h18" />
						<path v-else d="M6 6l12 12M6 18 18 6" />
					</svg>
				</button>
			</div>
		</div>
	</header>
</template>

<style scoped>
.app-header {
	position: sticky;
	top: 0;
	z-index: 100;
	background: color-mix(in srgb, var(--color-bg) 85%, transparent);
	backdrop-filter: saturate(180%) blur(12px);
	-webkit-backdrop-filter: saturate(180%) blur(12px);
	border-bottom: 1px solid transparent;
	transition:
		background var(--transition),
		border-color var(--transition),
		box-shadow var(--transition);
}

.app-header.scrolled {
	border-bottom-color: var(--color-border);
	box-shadow: var(--shadow-sm);
}

.header-inner {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: var(--header-height);
	gap: var(--space-6);
}

.brand {
	display: inline-flex;
	align-items: center;
	gap: var(--space-3);
	font-weight: 700;
	font-size: 1.0625rem;
	color: var(--color-text);
	letter-spacing: -0.01em;
}

.brand-mark {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: var(--radius-sm);
	background: var(--color-accent);
	color: var(--color-accent-contrast);
	font-weight: 700;
	font-size: 0.9375rem;
}

.brand:hover {
	color: var(--color-text);
}

.nav {
	display: flex;
	align-items: center;
	gap: var(--space-2);
	flex: 1;
	justify-content: center;
}

.nav-link {
	padding: var(--space-2) var(--space-4);
	border-radius: var(--radius);
	color: var(--color-text-soft);
	font-size: 0.9375rem;
	font-weight: 500;
	transition:
		color var(--transition-fast),
		background var(--transition-fast);
}

.nav-link:hover {
	color: var(--color-text);
	background: var(--color-bg-muted);
}

.nav-link.active {
	color: var(--color-accent);
	background: var(--color-accent-soft);
}

.actions {
	display: inline-flex;
	align-items: center;
	gap: var(--space-2);
}

.icon-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: var(--radius);
	color: var(--color-text-soft);
	transition:
		background var(--transition-fast),
		color var(--transition-fast);
}

.icon-btn:hover {
	background: var(--color-bg-muted);
	color: var(--color-text);
}

.mobile-toggle {
	display: none;
}

@media (max-width: 768px) {
	.nav {
		position: fixed;
		top: var(--header-height);
		left: 0;
		right: 0;
		flex-direction: column;
		align-items: stretch;
		gap: 0;
		padding: var(--space-4);
		background: var(--color-bg);
		border-bottom: 1px solid var(--color-border);
		box-shadow: var(--shadow);
		transform: translateY(-110%);
		opacity: 0;
		pointer-events: none;
		transition:
			transform var(--transition),
			opacity var(--transition);
	}

	.nav.open {
		transform: translateY(0);
		opacity: 1;
		pointer-events: auto;
	}

	.nav-link {
		padding: var(--space-3) var(--space-4);
		font-size: 1rem;
	}

	.mobile-toggle {
		display: inline-flex;
	}
}
</style>