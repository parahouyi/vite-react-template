import { api } from "./client";

export interface LoginPayload {
	username: string;
	password: string;
}

export interface LoginResponse {
	token: string;
	username: string;
}

export function login(payload: LoginPayload): Promise<LoginResponse> {
	return api<LoginResponse>("/auth/login", {
		method: "POST",
		body: payload,
	});
}

export function fetchMe(): Promise<{ username: string }> {
	return api<{ username: string }>("/auth/me");
}