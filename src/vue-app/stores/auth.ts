import { defineStore } from "pinia";
import { ref, computed } from "vue";

const STORAGE_KEY = "simon-blog-auth";

interface PersistedAuth {
	token: string;
	username: string;
}

function loadFromStorage(): PersistedAuth | null {
	if (typeof localStorage === "undefined") return null;
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return null;
	try {
		const data = JSON.parse(raw) as PersistedAuth;
		if (data.token && data.username) return data;
	} catch {
		// ignore parse errors
	}
	return null;
}

export const useAuthStore = defineStore("auth", () => {
	const persisted = loadFromStorage();
	const token = ref<string>(persisted?.token ?? "");
	const username = ref<string>(persisted?.username ?? "");

	const isAuthenticated = computed(() => Boolean(token.value));

	function setAuth(payload: PersistedAuth) {
		token.value = payload.token;
		username.value = payload.username;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
	}

	function clear() {
		token.value = "";
		username.value = "";
		localStorage.removeItem(STORAGE_KEY);
	}

	return { token, username, isAuthenticated, setAuth, clear };
});