<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";
import { changePassword } from "../../api/admin";

const auth = useAuthStore();
const router = useRouter();

const oldPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const submitting = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

async function onSubmit() {
	error.value = null;
	success.value = false;

	if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
		error.value = "请填写所有字段";
		return;
	}
	if (newPassword.value !== confirmPassword.value) {
		error.value = "两次输入的新密码不一致";
		return;
	}

	submitting.value = true;
	try {
		await changePassword({
			old_password: oldPassword.value,
			new_password: newPassword.value,
		});
		success.value = true;
		oldPassword.value = "";
		newPassword.value = "";
		confirmPassword.value = "";
		setTimeout(() => router.push("/admin"), 1500);
	} catch (e) {
		error.value = e instanceof Error ? e.message : "修改失败";
	} finally {
		submitting.value = false;
	}
}

function logout() {
	auth.clear();
	router.push("/");
}
</script>

<template>
	<div class="settings">
		<section class="card">
			<header class="card-header">
				<h3>账户信息</h3>
			</header>
			<div class="account">
				<div class="avatar">{{ auth.username.charAt(0).toUpperCase() }}</div>
				<div class="info">
					<div class="username">{{ auth.username }}</div>
					<div class="muted">已登录</div>
				</div>
				<button type="button" class="btn btn-ghost" @click="logout">
					退出登录
				</button>
			</div>
		</section>

		<section class="card">
			<header class="card-header">
				<h3>修改密码</h3>
				<p class="muted">新密码至少 8 个字符，建议使用字母 + 数字组合。</p>
			</header>

			<form class="form" @submit.prevent="onSubmit">
				<label class="field">
					<span>当前密码</span>
					<input
						v-model="oldPassword"
						type="password"
						autocomplete="current-password"
						required
					/>
				</label>
				<label class="field">
					<span>新密码</span>
					<input
						v-model="newPassword"
						type="password"
						autocomplete="new-password"
						minlength="8"
						maxlength="100"
						required
					/>
				</label>
				<label class="field">
					<span>确认新密码</span>
					<input
						v-model="confirmPassword"
						type="password"
						autocomplete="new-password"
						minlength="8"
						maxlength="100"
						required
					/>
				</label>

				<div class="actions">
					<button
						type="submit"
						class="btn btn-primary"
						:disabled="submitting"
					>
						{{ submitting ? "更新中…" : "更新密码" }}
					</button>
				</div>

				<div v-if="error" class="msg msg--error">{{ error }}</div>
				<div v-if="success" class="msg msg--success">
					密码已更新，1.5 秒后跳到仪表盘…
				</div>
			</form>
		</section>
	</div>
</template>

<style scoped>
.settings {
	display: flex;
	flex-direction: column;
	gap: var(--space-6);
	max-width: 640px;
}

.card {
	background: var(--color-bg);
	border: 1px solid var(--color-border);
	border-radius: var(--radius);
	overflow: hidden;
}

.card-header {
	padding: var(--space-5) var(--space-6);
	border-bottom: 1px solid var(--color-border-soft);
}

.card-header h3 {
	font-size: 1rem;
	font-weight: 600;
}

.card-header p {
	margin-top: var(--space-1);
	font-size: 0.875rem;
}

.account {
	display: flex;
	align-items: center;
	gap: var(--space-4);
	padding: var(--space-5) var(--space-6);
}

.avatar {
	width: 48px;
	height: 48px;
	border-radius: 50%;
	background: linear-gradient(
		135deg,
		var(--color-accent),
		var(--color-cat-life-fg)
	);
	color: var(--color-accent-contrast);
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	font-size: 1.125rem;
	flex-shrink: 0;
}

.info {
	flex: 1;
}

.username {
	font-size: 1rem;
	font-weight: 600;
	color: var(--color-text);
}

.muted {
	color: var(--color-text-muted);
	font-size: 0.8125rem;
}

.form {
	padding: var(--space-5) var(--space-6);
	display: flex;
	flex-direction: column;
	gap: var(--space-4);
}

.field {
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
}

.field > span:first-child {
	font-size: 0.8125rem;
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

.actions {
	display: flex;
	justify-content: flex-end;
}

.msg {
	padding: var(--space-3) var(--space-4);
	border-radius: var(--radius-sm);
	font-size: 0.875rem;
}

.msg--error {
	color: var(--color-danger);
	background: rgba(239, 68, 68, 0.08);
	border: 1px solid var(--color-danger);
}

.msg--success {
	color: var(--color-cat-life-fg);
	background: var(--color-cat-life-bg);
	border: 1px solid var(--color-cat-life-fg);
}
</style>