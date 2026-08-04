<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import { useAuthStore } from "../../stores/auth";

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const nav = [
	{ to: "/admin", label: "概览", icon: "home" },
	{ to: "/admin/articles", label: "文章", icon: "doc" },
	{ to: "/admin/comments", label: "评论", icon: "chat" },
	{ to: "/admin/settings", label: "设置", icon: "gear" },
];

const breadcrumb = computed(() => {
	const map: Record<string, string> = {
		"admin-dashboard": "概览",
		"admin-articles": "文章",
		"admin-article-new": "新建文章",
		"admin-article-edit": "编辑文章",
		"admin-comments": "评论",
		"admin-settings": "设置",
	};
	return map[String(route.name ?? "")] ?? "";
});

function logout() {
	auth.clear();
	router.push({ name: "home" });
}
</script>

<template>
	<div class="admin-layout">
		<aside class="admin-sidebar">
			<div class="brand">
				<span class="brand-mark">S</span>
				<span>管理后台</span>
			</div>
			<nav>
				<RouterLink
					v-for="item in nav"
					:key="item.to"
					:to="item.to"
					class="side-link"
					:active-class="'active'"
					:exact-active-class="'exact'"
				>
					{{ item.label }}
				</RouterLink>
			</nav>
			<div class="spacer" />
			<div class="user">
				<div class="user-name">{{ auth.username || "未登录" }}</div>
				<button class="btn btn-ghost logout" @click="logout">退出</button>
			</div>
		</aside>
		<main class="admin-main">
			<header class="admin-header">
				<h2>{{ breadcrumb }}</h2>
				<RouterLink to="/" class="btn btn-ghost">← 返回站点</RouterLink>
			</header>
			<div class="admin-body">
				<RouterView />
			</div>
		</main>
	</div>
</template>

<style scoped>
.admin-layout {
	display: grid;
	grid-template-columns: 240px 1fr;
	min-height: calc(100vh - var(--header-height));
	margin: calc(-1 * var(--space-10)) calc(-1 * var(--space-6))
		calc(-1 * var(--space-16));
	gap: 0;
}

.admin-sidebar {
	display: flex;
	flex-direction: column;
	background: var(--color-bg-soft);
	border-right: 1px solid var(--color-border);
	padding: var(--space-6) var(--space-4);
	gap: var(--space-2);
}

.brand {
	display: inline-flex;
	align-items: center;
	gap: var(--space-3);
	font-weight: 700;
	padding: var(--space-2) var(--space-3);
	margin-bottom: var(--space-4);
}

.brand-mark {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	border-radius: var(--radius-sm);
	background: var(--color-accent);
	color: var(--color-accent-contrast);
	font-size: 0.875rem;
}

.side-link {
	display: block;
	padding: var(--space-3) var(--space-4);
	border-radius: var(--radius);
	color: var(--color-text-soft);
	font-size: 0.9375rem;
	font-weight: 500;
	transition:
		background var(--transition-fast),
		color var(--transition-fast);
}

.side-link:hover {
	background: var(--color-bg-muted);
	color: var(--color-text);
}

.side-link.active,
.side-link.exact {
	background: var(--color-accent-soft);
	color: var(--color-accent);
}

.spacer {
	flex: 1;
}

.user {
	padding: var(--space-3);
	border-top: 1px solid var(--color-border);
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
}

.user-name {
	font-size: 0.875rem;
	font-weight: 500;
}

.logout {
	justify-content: flex-start;
}

.admin-main {
	padding: var(--space-8);
	background: var(--color-bg);
}

.admin-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: var(--space-6);
	margin-bottom: var(--space-6);
	border-bottom: 1px solid var(--color-border-soft);
}

.admin-header h2 {
	font-size: 1.5rem;
}

@media (max-width: 900px) {
	.admin-layout {
		grid-template-columns: 1fr;
	}
	.admin-sidebar {
		border-right: 0;
		border-bottom: 1px solid var(--color-border);
	}
}
</style>