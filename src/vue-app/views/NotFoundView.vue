<script setup lang="ts">
</script>

<template>
	<section class="container placeholder">
		<h1>404</h1>
		<p class="muted">找不到这个页面。</p>
		<RouterLink to="/" class="btn">回到首页</RouterLink>
	</section>
</template>

<style scoped>
.placeholder {
	padding: var(--space-20) 0;
	text-align: center;
}

.placeholder h1 {
	font-size: 4rem;
	margin-bottom: var(--space-4);
}

.placeholder .btn {
	margin-top: var(--space-6);
}
</style>