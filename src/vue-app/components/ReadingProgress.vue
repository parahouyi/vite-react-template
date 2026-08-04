<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const progress = ref(0);

function onScroll() {
	const doc = document.documentElement;
	const scrollTop = window.scrollY || doc.scrollTop;
	const height = doc.scrollHeight - doc.clientHeight;
	progress.value = height > 0 ? Math.min(100, (scrollTop / height) * 100) : 0;
}

onMounted(() => {
	window.addEventListener("scroll", onScroll, { passive: true });
	window.addEventListener("resize", onScroll);
	onScroll();
});

onUnmounted(() => {
	window.removeEventListener("scroll", onScroll);
	window.removeEventListener("resize", onScroll);
});
</script>

<template>
	<div class="progress-bar" :style="{ width: `${progress}%` }" aria-hidden="true" />
</template>

<style scoped>
.progress-bar {
	position: fixed;
	top: 0;
	left: 0;
	height: 3px;
	background: linear-gradient(
		90deg,
		var(--color-accent) 0%,
		var(--color-cat-life-fg) 100%
	);
	z-index: 200;
	transition: width 80ms linear;
	box-shadow: 0 0 8px var(--color-accent-soft);
}
</style>