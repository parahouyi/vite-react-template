<script setup lang="ts">
import { ref } from "vue";
import vueLogo from "./assets/vue.svg";
import viteLogo from "/vite.svg";
import cloudflareLogo from "./assets/Cloudflare_Logo.svg";
import honoLogo from "./assets/hono.svg";

const count = ref(0);
const name = ref("unknown");

async function fetchName() {
	const res = await fetch("/api/");
	const data = (await res.json()) as { name: string };
	name.value = data.name;
}
</script>

<template>
	<div>
		<a href="https://vite.dev" target="_blank">
			<img :src="viteLogo" class="logo" alt="Vite logo" />
		</a>
		<a href="https://vuejs.org/" target="_blank">
			<img :src="vueLogo" class="logo vue" alt="Vue logo" />
		</a>
		<a href="https://hono.dev/" target="_blank">
			<img :src="honoLogo" class="logo hono" alt="Hono logo" />
		</a>
		<a href="https://workers.cloudflare.com/" target="_blank">
			<img
				:src="cloudflareLogo"
				class="logo cloudflare"
				alt="Cloudflare logo"
			/>
		</a>
	</div>
	<h1>Vite + Vue + Hono + Cloudflare</h1>
	<div class="card">
		<button @click="count++" aria-label="increment">count is {{ count }}</button>
		<p>
			Edit <code>src/App.vue</code> and save to test HMR
		</p>
	</div>
	<div class="card">
		<button @click="fetchName" aria-label="get name">
			Name from API is: {{ name }}
		</button>
		<p>
			Edit <code>worker/index.ts</code> to change the name
		</p>
	</div>
	<p class="read-the-docs">Click on the logos to learn more</p>
</template>

<style scoped></style>