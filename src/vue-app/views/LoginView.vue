<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { login } from "../api/auth";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const username = ref("");
const password = ref("");
const submitting = ref(false);
const error = ref<string | null>(null);

async function onSubmit() {
	error.value = null;
	if (!username.value.trim() || !password.value) {
		error.value = "请填写用户名和密码";
		return;
	}
	submitting.value = true;
	try {
		const data = await login({
			username: username.value.trim(),
			password: password.value,
		});
		auth.setAuth({ token: data.token, username: data.username });
		const redirect = String(route.query.redirect ?? "/admin");
		router.push(redirect);
	} catch (e) {
		error.value = e instanceof Error ? e.message : "登录失败";
	} finally {
		submitting.value = false;
	}
}

onMounted(() => {
	if (auth.isAuthenticated) {
		router.push(String(route.query.redirect ?? "/admin"));
	}
});
</script>

<template>
	<section class="login-page container-narrow">
		<div class="login-card">
			<div class="brand">
				<span class="brand-mark">S</span>
				<h1>管理员登录</h1>
			</div>
			<p class="muted">登录后可发布文章、审核评论。</p>

			<form class="login-form" @submit.prevent="onSubmit">
				<label class="field">
					<span>用户名</span>
					<input
						v-model="username"
						type="text"
						placeholder="admin"
						autocomplete="username"
						autofocus
						required
					/>
				</label>
				<label class="field">
					<span>密码</span>
					<input
						v-model="password"
						type="password"
						placeholder="••••••••"
						autocomplete="current-password"
						required
					/>
				</label>

				<button
					type="submit"
					class="btn btn-primary submit"
					:disabled="submitting"
				>
					{{ submitting ? "登录中…" : "登录" }}
				</button>

				<div v-if="error" class="error">{{ error }}</div>
			</form>

			<div class="hint">
				<span class="muted">默认账户：</span>
				<code>admin</code>
				<span class="muted">/</span>
				<code>admin123</code>
			</div>
		</div>
	</section>
</template>

<style scoped>
.login-page {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: calc(100vh - var(--header-height) - 200px);
	padding: var(--space-10) 0;
}

.login-card {
	width: 100%;
	max-width: 420px;
	padding: var(--space-10) var(--space-8);
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow);
}

.brand {
	display: flex;
	align-items: center;
	gap: var(--space-3);
	margin-bottom: var(--space-2);
}

.brand-mark {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: var(--radius-sm);
	background: var(--color-accent);
	color: var(--color-accent-contrast);
	font-weight: 700;
	font-size: 1.0625rem;
}

h1 {
	font-size: 1.5rem;
	margin: 0;
}

.muted {
	color: var(--color-text-muted);
	font-size: 0.9375rem;
	margin-bottom: var(--space-6);
}

.login-form {
	display: flex;
	flex-direction: column;
	gap: var(--space-4);
}

.field {
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
}

.field span {
	font-size: 0.875rem;
	font-weight: 500;
	color: var(--color-text-soft);
}

.field input {
	padding: var(--space-3);
	background: var(--color-bg-soft);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-sm);
	font-size: 0.9375rem;
	color: var(--color-text);
	transition:
		border-color var(--transition-fast),
		box-shadow var(--transition-fast);
}

.field input:focus {
	outline: none;
	border-color: var(--color-accent);
	background: var(--color-bg);
	box-shadow: 0 0 0 3px var(--color-accent-soft);
}

.submit {
	margin-top: var(--space-2);
	padding: var(--space-3) var(--space-5);
	font-size: 0.9375rem;
}

.error {
	color: var(--color-danger);
	font-size: 0.875rem;
	padding: var(--space-2) var(--space-3);
	background: rgba(239, 68, 68, 0.08);
	border: 1px solid var(--color-danger);
	border-radius: var(--radius-sm);
}

.hint {
	margin-top: var(--space-6);
	padding-top: var(--space-4);
	border-top: 1px solid var(--color-border-soft);
	font-size: 0.8125rem;
	text-align: center;
}

.hint code {
	padding: 2px 8px;
	background: var(--color-bg-muted);
	border-radius: var(--radius-sm);
	font-family: var(--font-mono);
	font-size: 0.8125rem;
	color: var(--color-accent);
}
</style>