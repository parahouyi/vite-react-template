<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<template>
	<footer class="app-footer">
		<div class="container footer-inner">
			<div class="col brand-col">
				<div class="brand">
					<span class="brand-mark">S</span>
					<span class="brand-text">Simon's Blog</span>
				</div>
				<p class="muted desc">
					记录技术、思考与生活。一个跑在 Cloudflare 边缘网络上的个人博客。
				</p>
			</div>
			<div class="col">
				<h4>导航</h4>
				<ul>
					<li><RouterLink to="/">首页</RouterLink></li>
					<li><RouterLink to="/articles">所有文章</RouterLink></li>
					<li><RouterLink to="/categories">分类</RouterLink></li>
					<li><RouterLink to="/about">关于</RouterLink></li>
				</ul>
			</div>
			<div class="col">
				<h4>订阅</h4>
				<ul>
					<li><a href="/api/feed.xml">RSS 订阅</a></li>
					<li><a href="https://github.com" target="_blank" rel="noopener">GitHub</a></li>
				</ul>
			</div>
		</div>
		<div class="container copy">
			<span class="muted">© {{ year }} Simon Zhang. All rights reserved.</span>
			<span class="muted">Powered by Vue + Hono + Cloudflare</span>
		</div>
	</footer>
</template>

<style scoped>
.app-footer {
	margin-top: auto;
	padding: var(--space-16) 0 var(--space-8);
	background: var(--color-bg-soft);
	border-top: 1px solid var(--color-border-soft);
}

.footer-inner {
	display: grid;
	grid-template-columns: 2fr 1fr 1fr;
	gap: var(--space-12);
	padding-bottom: var(--space-10);
}

.brand {
	display: inline-flex;
	align-items: center;
	gap: var(--space-3);
	font-weight: 700;
	font-size: 1.0625rem;
	margin-bottom: var(--space-4);
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
	font-size: 0.9375rem;
}

.desc {
	max-width: 360px;
	font-size: 0.9375rem;
}

h4 {
	font-size: 0.875rem;
	font-weight: 600;
	margin-bottom: var(--space-4);
	color: var(--color-text);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

ul {
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
}

ul a {
	color: var(--color-text-soft);
	font-size: 0.9375rem;
}

ul a:hover {
	color: var(--color-accent);
}

.copy {
	display: flex;
	justify-content: space-between;
	padding-top: var(--space-6);
	border-top: 1px solid var(--color-border-soft);
	font-size: 0.875rem;
}

@media (max-width: 768px) {
	.app-footer {
		padding-top: var(--space-10);
	}

	.footer-inner {
		grid-template-columns: 1fr;
		gap: var(--space-8);
	}

	.copy {
		flex-direction: column;
		gap: var(--space-2);
	}
}
</style>