<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, watchEffect } from "vue";
const route = useRoute();
const q = ref<string>(String(route.query.q ?? ""));
watchEffect(() => {
	q.value = String(route.query.q ?? "");
});
</script>

<template>
	<section class="container placeholder">
		<h1>搜索</h1>
		<p class="muted">关键词: {{ q || "（空）" }}</p>
		<p class="muted">Step 4 之后会显示搜索结果。</p>
	</section>
</template>

<style scoped>
.placeholder {
	padding: var(--space-10) 0;
}
</style>