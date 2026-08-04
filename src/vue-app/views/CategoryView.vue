<script setup lang="ts">
import { useRoute } from "vue-router";
const route = useRoute();
</script>

<template>
	<section class="container placeholder">
		<h1>分类：{{ route.params.slug }}</h1>
		<p class="muted">Step 4 之后会按分类筛选文章。</p>
	</section>
</template>

<style scoped>
.placeholder {
	padding: var(--space-10) 0;
}
</style>