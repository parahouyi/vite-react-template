<script setup lang="ts">
import { useMeta } from "../composables/useMeta";

useMeta({
	title: "关于",
	description: "关于 Simon — 写代码、读文档、偶尔发呆的人。",
});
</script>

<template>
	<section class="container about">
		<div class="container-narrow">
			<h1>关于我</h1>
			<p class="lede">
				我是 Simon，一名喜欢写代码、读文档、偶尔发呆的人。
			</p>
			<p>
				这个博客用 Vue 3 + Hono + Cloudflare Workers 搭建，
				数据存在 D1 数据库里，图片放在 R2 上。整套架构跑在全球边缘网络上。
			</p>
			<p>
				如果有任何想聊的，欢迎留言或邮件联系。
			</p>
		</div>
	</section>
</template>

<style scoped>
.about {
	padding: var(--space-10) 0;
}

.about h1 {
	margin-bottom: var(--space-6);
}

.lede {
	font-size: 1.125rem;
	color: var(--color-text-soft);
	margin-bottom: var(--space-6);
}

.about p {
	margin-bottom: var(--space-4);
	color: var(--color-text-soft);
}
</style>