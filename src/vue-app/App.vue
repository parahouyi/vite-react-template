<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
</script>

<template>
	<AppHeader />
	<main class="app-main">
		<RouterView v-slot="{ Component, route }">
			<Transition name="fade" mode="out-in">
				<component :is="Component" :key="route.fullPath" />
			</Transition>
		</RouterView>
	</main>
	<AppFooter />
</template>

<style>
.app-main {
	flex: 1;
	padding: var(--space-10) 0 var(--space-16);
}

.fade-enter-active,
.fade-leave-active {
	transition:
		opacity 180ms ease,
		transform 180ms ease;
}

.fade-enter-from {
	opacity: 0;
	transform: translateY(8px);
}

.fade-leave-to {
	opacity: 0;
	transform: translateY(-8px);
}
</style>