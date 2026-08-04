import { ofetch } from "ofetch";
import { useAuthStore } from "../stores/auth";

export const api = ofetch.create({
	baseURL: "/api",
	retry: 1,
	onRequest({ options }) {
		const auth = useAuthStore();
		const headers = new Headers(options.headers as HeadersInit | undefined);
		if (auth.token) {
			headers.set("Authorization", `Bearer ${auth.token}`);
		}
		options.headers = headers;
	},
	onResponseError({ response }) {
		if (response.status === 401) {
			const auth = useAuthStore();
			auth.clear();
		}
	},
});