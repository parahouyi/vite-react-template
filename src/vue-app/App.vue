<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
</script>

<template>
	<AppHeader />
	<main class="app-main">
		<RouterView v-slot="{ Component }">
			<Transition name="fade" mode="out-in">
				<component :is="Component" />
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
		opacity var(--transition),
		transform var(--transition);
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
	transform: translateY(8px);
}
</style>