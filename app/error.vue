<template>
  <main class="error-page">
    <section class="error-card" :aria-labelledby="headingId">
      <p class="error-code" aria-hidden="true">{{ statusCode }}</p>
      <h1 :id="headingId" ref="heading" tabindex="-1">{{ title }}</h1>
      <p>{{ message }}</p>

      <div class="error-actions">
        <button
          v-if="!isNotFound"
          type="button"
          class="primary-action"
          @click="retry"
        >
          {{ copy.retry }}
        </button>
        <button type="button" class="secondary-action" @click="goHome">
          {{ copy.home }}
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";

type PageError = {
  statusCode?: number;
  status?: number;
};

const ERROR_COPY = {
  en: {
    notFoundTitle: "Page not found",
    notFoundMessage: "The page you are looking for does not exist or has moved.",
    title: "Something went wrong",
    message:
      "Best Ride could not load this page. You can try again or return home.",
    retry: "Try again",
    home: "Back to home",
  },
  it: {
    notFoundTitle: "Pagina non trovata",
    notFoundMessage: "La pagina che stai cercando non esiste o è stata spostata.",
    title: "Si è verificato un errore",
    message:
      "Best Ride non è riuscito a caricare questa pagina. Puoi riprovare oppure tornare alla home.",
    retry: "Riprova",
    home: "Torna alla home",
  },
} as const;

const props = defineProps<{ error: PageError }>();
const language = ref<keyof typeof ERROR_COPY>("en");
const heading = ref<HTMLElement | null>(null);
const headingId = "best-ride-error-title";

const copy = computed(() => ERROR_COPY[language.value]);
const statusCode = computed(() => props.error.statusCode ?? props.error.status ?? 500);
const isNotFound = computed(() => statusCode.value === 404);
const title = computed(() =>
  isNotFound.value ? copy.value.notFoundTitle : copy.value.title,
);
const message = computed(() =>
  isNotFound.value ? copy.value.notFoundMessage : copy.value.message,
);

onMounted(async () => {
  const detectedLanguage =
    document.documentElement.lang || navigator.language || "en";
  language.value = detectedLanguage.toLowerCase().startsWith("it") ? "it" : "en";
  document.title = `${title.value} - Best Ride`;
  await nextTick();
  heading.value?.focus();
});

function retry() {
  window.location.reload();
}

function goHome() {
  window.location.assign("/");
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 20px;
  background: var(--bg, #fff);
  color: var(--text, #004e22);
}

.error-card {
  width: min(560px, 100%);
  padding: clamp(28px, 6vw, 52px);
  border: 1px solid var(--border, #d7e6dd);
  border-radius: 20px;
  background: var(--surface, #f3f9f5);
  box-shadow: 0 18px 48px rgba(0, 78, 34, 0.12);
  text-align: center;
}

.error-code {
  margin: 0 0 8px;
  color: var(--accent, #0e9f6e);
  font-size: clamp(2.5rem, 9vw, 5rem);
  font-weight: 800;
  line-height: 1;
}

h1 {
  margin: 0 0 12px;
  font-size: clamp(1.6rem, 5vw, 2.25rem);
  outline: none;
}

h1:focus-visible {
  border-radius: 6px;
  box-shadow: 0 0 0 3px var(--accent-soft, rgba(14, 159, 110, 0.2));
}

.error-card > p:not(.error-code) {
  margin: 0;
  color: var(--text-muted, #5c6d63);
  line-height: 1.6;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
  flex-wrap: wrap;
}

.error-actions button {
  min-height: 44px;
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid var(--accent, #0e9f6e);
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.primary-action {
  background: var(--accent, #0e9f6e);
  color: #fff;
}

.secondary-action {
  background: transparent;
  color: var(--accent-strong, #0b7a54);
}

.error-actions button:focus-visible {
  outline: 3px solid var(--accent-soft, rgba(14, 159, 110, 0.2));
  outline-offset: 3px;
}
</style>
