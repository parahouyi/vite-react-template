import { createApp } from "vue";
import { createPinia } from "pinia";
import "./index.css";
import App from "./App.vue";
import { router } from "./router";
import { useAuthStore } from "./stores/auth";
import { fetchMe } from "./api/auth";

const app = createApp(App);
app.use(createPinia());
app.use(router);

async function bootstrap() {
	const auth = useAuthStore();
	if (auth.token) {
		try {
			const data = await fetchMe();
			auth.setAuth({ token: auth.token, username: data.username });
		} catch {
			auth.clear();
		}
	}
	await router.isReady();
	app.mount("#root");
}

bootstrap();