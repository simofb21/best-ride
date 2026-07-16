<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Log in</h1>

      <form @submit.prevent="handleLogin">
        <label>
          Email
          <input v-model="email" type="email" required autocomplete="email" />
        </label>

        <label>
          Password
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
          />
        </label>

        <p v-if="error" class="error">{{ error }}</p>

        <button type="submit" :disabled="loading">
          {{ loading ? "Logging in..." : "Log in" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

const { fetch: refreshSession } = useUserSession();

async function handleLogin() {
  loading.value = true;
  error.value = "";

  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: { email: email.value, password: password.value },
    });

    // Ricarica la sessione lato client, così useUserSession() sa subito che siamo loggati
    await refreshSession();

    await navigateTo("/upload");
  } catch (err: any) {
    error.value = err?.data?.message || "Login failed";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}
.login-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 32px;
  width: 100%;
  max-width: 380px;
}
.login-card h1 {
  margin: 0 0 20px;
  font-size: 22px;
}
form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
}
input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
}
button {
  margin-top: 8px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.error {
  color: #ef4444;
  font-size: 13px;
  margin: 0;
}
</style>
