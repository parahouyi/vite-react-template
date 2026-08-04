import { defineStore } from "pinia";
import { ref, watch } from "vue";

export type Theme = "light" | "dark";

const STORAGE_KEY = "simon-blog-theme";

function getInitialTheme(): Theme {
	if (typeof window === "undefined") return "light";
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === "light" || stored === "dark") return stored;
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export const useUiStore = defineStore("ui", () => {
	const theme = ref<Theme>(getInitialTheme());

	function setTheme(value: Theme) {
		theme.value = value;
	}

	function toggleTheme() {
		theme.value = theme.value === "light" ? "dark" : "light";
	}

	watch(
		theme,
		(value) => {
			document.documentElement.dataset.theme = value;
			localStorage.setItem(STORAGE_KEY, value);
		},
		{ immediate: true },
	);

	return { theme, setTheme, toggleTheme };
});