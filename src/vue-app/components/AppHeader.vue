<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useUiStore } from "../stores/ui";
import { useAuthStore } from "../stores/auth";
import { fetchCategories } from "../api/articles";
import type { Category } from "../api/types";

const ui = useUiStore();
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const scrolled = ref(false);
const mobileOpen = ref(false);
const userMenuOpen = ref(false);
const categoriesOpen = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);
const categoriesRef = ref<HTMLElement | null>(null);
const categories = ref<Category[]>([]);
const categoriesLoaded = ref(false);

const initial = computed(() =>
	auth.username ? auth.username.charAt(0).toUpperCase() : "?",
);

const navItems = [
	{ to: "/", label: "首页" },
	{ to: "/articles", label: "文章" },
	{ to: "/about", label: "关于" },
];

function onScroll() {
	scrolled.value = window.scrollY > 8;
}

function onClickOutside(e: MouseEvent) {
	const target = e.target as Node;
	if (userMenuRef.value && !userMenuRef.value.contains(target)) {
		userMenuOpen.value = false;
	}
	if (
		categoriesRef.value &&
		!categoriesRef.value.contains(target)
	) {
		categoriesOpen.value = false;
	}
}

watch(
	() => route.fullPath,
	() => {
		mobileOpen.value = false;
		userMenuOpen.value = false;
		categoriesOpen.value = false;
	},
);

function logout() {
	userMenuOpen.value = false;
	auth.clear();
	router.push("/");
}

async function loadCategories() {
	if (categoriesLoaded.value) return;
	try {
		const data = await fetchCategories();
		categories.value = data.categories;
		categoriesLoaded.value = true;
	} catch {
		// ignore
	}
}

onMounted(() => {
	window.addEventListener("scroll", onScroll, { passive: true });
	document.addEventListener("click", onClickOutside);
	loadCategories();
	onScroll();
});

onUnmounted(() => {
	window.removeEventListener("scroll", onScroll);
	document.removeEventListener("click", onClickOutside);
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

				<div ref="categoriesRef" class="nav-dropdown">
					<button
						type="button"
						class="nav-link nav-trigger"
						:aria-expanded="categoriesOpen"
						aria-haspopup="menu"
						@click.stop="categoriesOpen = !categoriesOpen"
					>
						分类
						<svg
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="chevron"
							:class="{ open: categoriesOpen }"
						>
							<path d="m6 9 6 6 6-6" />
						</svg>
					</button>

					<div v-if="categoriesOpen" class="dropdown" role="menu">
						<RouterLink
							to="/categories"
							class="dropdown-item dropdown-item--head"
							role="menuitem"
						>
							<span>所有分类</span>
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
								<path d="M5 12h14m-7-7 7 7-7 7" />
							</svg>
						</RouterLink>
						<div class="dropdown-divider" />
						<RouterLink
							v-for="c in categories"
							:key="c.id"
							:to="`/categories/${c.slug}`"
							class="dropdown-item"
							role="menuitem"
						>
							<span class="cat-name">{{ c.name }}</span>
							<span class="cat-count">{{ c.article_count }}</span>
						</RouterLink>
						<div v-if="!categoriesLoaded" class="dropdown-empty muted">
							加载中…
						</div>
						<div
							v-else-if="categories.length === 0"
							class="dropdown-empty muted"
						>
							暂无分类
						</div>
					</div>
				</div>
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

				<div v-if="auth.isAuthenticated" ref="userMenuRef" class="user-menu">
					<button
						type="button"
						class="user-trigger"
						:aria-expanded="userMenuOpen"
						aria-haspopup="menu"
						@click.stop="userMenuOpen = !userMenuOpen"
					>
						<span class="user-avatar">{{ initial }}</span>
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
							<path d="m6 9 6 6 6-6" />
						</svg>
					</button>

					<div v-if="userMenuOpen" class="menu" role="menu">
						<div class="menu-head">
							<div class="menu-username">{{ auth.username }}</div>
							<div class="menu-hint muted">已登录</div>
						</div>
						<RouterLink to="/admin" class="menu-item" role="menuitem">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<rect x="3" y="3" width="7" height="9" />
								<rect x="14" y="3" width="7" height="5" />
								<rect x="14" y="12" width="7" height="9" />
								<rect x="3" y="16" width="7" height="5" />
							</svg>
							管理后台
						</RouterLink>
						<RouterLink
							to="/admin/settings"
							class="menu-item"
							role="menuitem"
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<circle cx="12" cy="12" r="3" />
								<path
									d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
								/>
							</svg>
							设置
						</RouterLink>
						<div class="menu-divider" />
						<button
							type="button"
							class="menu-item menu-item--danger"
							role="menuitem"
							@click="logout"
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
								<polyline points="16 17 21 12 16 7" />
								<line x1="21" y1="12" x2="9" y2="12" />
							</svg>
							退出登录
						</button>
					</div>
				</div>

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

.nav-dropdown {
	position: relative;
}

.nav-trigger {
	display: inline-flex;
	align-items: center;
	gap: var(--space-1);
}

.chevron {
	transition: transform var(--transition-fast);
}

.chevron.open {
	transform: rotate(180deg);
}

.nav-trigger[aria-expanded="true"] {
	color: var(--color-accent);
	background: var(--color-accent-soft);
}

.dropdown {
	position: absolute;
	top: calc(100% + 8px);
	left: 50%;
	transform: translateX(-50%);
	min-width: 220px;
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
	box-shadow: var(--shadow-lg);
	overflow: hidden;
	z-index: 200;
	animation: dropIn 0.15s ease-out;
}

@keyframes dropIn {
	from {
		opacity: 0;
		transform: translateX(-50%) translateY(-4px);
	}
	to {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
}

.dropdown-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--space-3);
	padding: var(--space-3) var(--space-4);
	font-size: 0.875rem;
	color: var(--color-text);
	transition: background var(--transition-fast);
}

.dropdown-item:hover {
	background: var(--color-bg-muted);
}

.dropdown-item--head {
	color: var(--color-accent);
	font-weight: 600;
	border-bottom: 1px solid var(--color-border-soft);
}

.cat-name {
	flex: 1;
}

.cat-count {
	min-width: 24px;
	padding: 1px 8px;
	background: var(--color-bg-muted);
	color: var(--color-text-muted);
	border-radius: var(--radius-full);
	font-size: 0.75rem;
	font-weight: 500;
	text-align: center;
}

.dropdown-divider {
	height: 1px;
	background: var(--color-border-soft);
}

.dropdown-empty {
	padding: var(--space-4);
	text-align: center;
	font-size: 0.875rem;
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

.user-menu {
	position: relative;
}

.user-trigger {
	display: inline-flex;
	align-items: center;
	gap: var(--space-1);
	padding: 4px 10px 4px 4px;
	border-radius: 999px;
	background: var(--color-bg-muted);
	color: var(--color-text);
	transition:
		background var(--transition-fast),
		transform var(--transition-fast);
}

.user-trigger:hover {
	background: var(--color-accent-soft);
}

.user-trigger[aria-expanded="true"] {
	background: var(--color-accent-soft);
}

.user-avatar {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	border-radius: 50%;
	background: linear-gradient(
		135deg,
		var(--color-accent),
		var(--color-cat-life-fg)
	);
	color: var(--color-accent-contrast);
	font-weight: 700;
	font-size: 0.8125rem;
}

.menu {
	position: absolute;
	top: calc(100% + 8px);
	right: 0;
	min-width: 200px;
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
	box-shadow: var(--shadow-lg);
	overflow: hidden;
	z-index: 200;
	animation: menuIn 0.15s ease-out;
}

@keyframes menuIn {
	from {
		opacity: 0;
		transform: translateY(-4px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.menu-head {
	padding: var(--space-3) var(--space-4);
	background: var(--color-bg-soft);
	border-bottom: 1px solid var(--color-border-soft);
}

.menu-username {
	font-size: 0.9375rem;
	font-weight: 600;
	color: var(--color-text);
}

.menu-hint {
	font-size: 0.75rem;
	margin-top: 2px;
}

.menu-item {
	display: flex;
	align-items: center;
	gap: var(--space-3);
	width: 100%;
	padding: var(--space-3) var(--space-4);
	font-size: 0.875rem;
	color: var(--color-text);
	text-align: left;
	background: transparent;
	transition: background var(--transition-fast);
}

.menu-item:hover {
	background: var(--color-bg-muted);
}

.menu-item--danger {
	color: var(--color-danger);
}

.menu-item--danger:hover {
	background: rgba(239, 68, 68, 0.08);
}

.menu-divider {
	height: 1px;
	background: var(--color-border-soft);
	margin: 4px 0;
}

.muted {
	color: var(--color-text-muted);
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
		max-height: calc(100vh - var(--header-height));
		overflow-y: auto;
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

	.nav-dropdown {
		width: 100%;
	}

	.nav-trigger {
		width: 100%;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
	}

	.dropdown {
		position: static;
		transform: none;
		box-shadow: none;
		border: 0;
		border-radius: 0;
		background: var(--color-bg-soft);
		margin-top: var(--space-2);
		animation: none;
	}

	@keyframes dropIn {
		from,
		to {
			transform: none;
		}
	}

	.mobile-toggle {
		display: inline-flex;
	}
}
</style>