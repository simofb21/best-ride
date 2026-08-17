<!-- app/pages/login.vue -->
<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>{{ $t("login.title") }}</h1>
      <p class="subtitle">{{ $t("login.subtitle") }}</p>

      <a href="/auth/google" class="google-btn">
        <v-icon icon="mdi-google" size="18" />
        {{ $t("login.google") }}
      </a>

      <!-- Quando aggiungerai altri provider (Apple, ecc.), basterà aggiungere qui: -->
      <!--
      <a href="/auth/apple" class="google-btn">
        <v-icon icon="mdi-apple" size="18" />
        Continue with Apple
      </a>
      -->

      <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  document.title = "Login - Best Ride";
});
// Se torniamo qui dopo un fallimento OAuth (google.get.ts fa redirect a /login?error=...),
// mostriamo un messaggio d'errore leggibile invece di un errore criptico
const route = useRoute();
const { t } = useI18n();
const errorMessage = computed(() => {
  if (route.query.error === "google_auth_failed") {
    return t("login.error");
  }
  return "";
});
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  padding: 80px 20px;
  min-height: 60vh;
}

.auth-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 32px;
  width: 100%;
  max-width: 380px;
  text-align: center;
}

.auth-card h1 {
  margin: 0 0 8px;
  font-size: 22px;
  color: var(--text);
}

.subtitle {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0 0 24px;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  color: var(--text);
  font-weight: 600;
  text-decoration: none;
  font-size: 14px;
  transition:
    border-color 0.15s,
    background-color 0.15s;
}
.google-btn:hover {
  border-color: var(--accent);
  background: var(--surface-alt);
}

.error-banner {
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  font-size: 13px;
}
</style>
