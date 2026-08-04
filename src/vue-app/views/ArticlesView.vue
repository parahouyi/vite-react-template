<script setup lang="ts">
import { useMeta } from "../composables/useMeta";

useMeta({
	title: "所有文章",
	description: "浏览所有文章列表。",
});
</script>

<template>
	<section class="container placeholder">
		<h1>所有文章</h1>
		<p class="muted">文章列表（开发中）。</p>
	</section>
</template>

<style scoped>
.placeholder {
	padding: var(--space-10) 0;
}
</style>