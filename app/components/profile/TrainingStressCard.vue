<template>
  <section class="stress-card" :aria-labelledby="headingId">
    <div class="card-heading">
      <div class="title-wrap">
        <span class="icon-wrap" aria-hidden="true">
          <v-icon icon="mdi-lightning-bolt-outline" size="24" />
        </span>
        <div>
          <h2 :id="headingId">
            {{ $t("trainingStress.title") }}
          </h2>
          <p>{{ $t("trainingStress.description") }}</p>
        </div>
      </div>

      <button
        class="reset-btn"
        type="button"
        :disabled="resetting || (trainingStress <= 0 && activityCount <= 0)"
        @click="dialogOpen = true"
      >
        <v-icon icon="mdi-restore" size="18" />
        {{ $t("trainingStress.resetAction") }}
      </button>
    </div>

    <div class="stress-content">
      <div class="stress-value-wrap">
        <span class="stress-value">{{ Math.round(trainingStress) }}</span>
        <span class="stress-unit">{{ $t("trainingStress.loadUnits") }}</span>
      </div>

      <div class="block-details">
        <div class="detail">
          <span>{{ $t("trainingStress.activities") }}</span>
          <strong>{{ activityCount }}</strong>
        </div>
        <div class="detail">
          <span>{{ $t("trainingStress.blockStarted") }}</span>
          <strong>{{ formattedStart }}</strong>
        </div>
        <div class="detail">
          <span>{{ $t("trainingStress.lastActivity") }}</span>
          <strong>{{ formattedLastActivity }}</strong>
        </div>
      </div>
    </div>

    <p v-if="resetFailed" class="error-message" role="alert">
      {{ $t("trainingStress.resetError") }}
    </p>

    <v-dialog v-model="dialogOpen" max-width="480">
      <v-card class="reset-dialog">
        <v-card-title>{{ $t("trainingStress.resetTitle") }}</v-card-title>
        <v-card-text>
          {{ $t("trainingStress.resetText") }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="resetting" @click="dialogOpen = false">
            {{ $t("common.cancel") }}
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="resetting"
            @click="resetTrainingStress"
          >
            {{ $t("trainingStress.confirmReset") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
import { useId } from "vue";

const props = defineProps<{
  trainingStress: number;
  activityCount: number;
  startedAt: string | Date | null;
  lastActivityAt: string | Date | null;
}>();

const emit = defineEmits<{
  reset: [payload: {
    trainingStress: number;
    trainingStressActivityCount: number;
    trainingStressStartedAt: null;
    trainingStressLastActivityAt: null;
  }];
}>();

const { locale, t } = useI18n();
const appToast = useAppToast();
const headingId = useId();
const dialogOpen = ref(false);
const resetting = ref(false);
const resetFailed = ref(false);

function formatDate(value: string | Date | null): string {
  if (!value) return t("trainingStress.notStarted");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t("trainingStress.notStarted");
  return new Intl.DateTimeFormat(locale.value, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

const formattedStart = computed(() => formatDate(props.startedAt));
const formattedLastActivity = computed(() => formatDate(props.lastActivityAt));

async function resetTrainingStress() {
  resetting.value = true;
  resetFailed.value = false;
  try {
    const result = await $fetch<{
      trainingStress: number;
      trainingStressActivityCount: number;
      trainingStressStartedAt: null;
      trainingStressLastActivityAt: null;
    }>("/api/profile/training-stress/reset", { method: "POST" });
    emit("reset", result);
    appToast.success(t("notifications.trainingStressReset"), {
      toastId: "training-stress-reset",
    });
    dialogOpen.value = false;
  } catch (error) {
    resetFailed.value = true;
    appToast.error(error, t("trainingStress.resetError"), {
      toastId: "training-stress-reset-failed",
    });
  } finally {
    resetting.value = false;
  }
}
</script>

<style scoped>
.stress-card {
  background: var(--surface);
  border: 1px solid var(--accent);
  border-radius: 14px;
  padding: 24px;
}

.card-heading,
.title-wrap,
.stress-content,
.block-details,
.reset-btn {
  display: flex;
}

.card-heading {
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.title-wrap {
  align-items: flex-start;
  gap: 12px;
}

.icon-wrap {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  color: var(--accent-strong);
  background: var(--accent-soft, rgba(34, 197, 94, 0.1));
  border-radius: 12px;
}

h2 {
  margin: 0 0 4px;
  color: var(--text);
  font-size: 17px;
}

.title-wrap p {
  max-width: 580px;
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.5;
}

.reset-btn {
  align-items: center;
  gap: 6px;
  padding: 9px 13px;
  border: 1px solid var(--border);
  border-radius: 9px;
  color: var(--text);
  background: transparent;
  font-weight: 700;
  cursor: pointer;
}

.reset-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.stress-content {
  align-items: center;
  gap: 36px;
  margin-top: 24px;
}

.stress-value-wrap {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.stress-value {
  color: var(--accent-strong);
  font-family: var(--mono, monospace);
  font-size: clamp(42px, 7vw, 64px);
  font-weight: 850;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stress-unit {
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 12px;
}

.block-details {
  flex: 1;
  gap: 12px;
}

.detail {
  flex: 1;
  padding: 12px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.detail span,
.detail strong {
  display: block;
}

.detail span {
  margin-bottom: 5px;
  color: var(--text-muted);
  font-size: 11px;
}

.detail strong {
  color: var(--text);
  font-size: 14px;
}

.error-message {
  margin: 16px 0 0;
  color: #ef4444;
  font-size: 13px;
}

.reset-dialog {
  background: var(--surface) !important;
  color: var(--text) !important;
}

@media (max-width: 700px) {
  .stress-card {
    padding: 18px;
  }

  .card-heading,
  .stress-content {
    align-items: stretch;
    flex-direction: column;
  }

  .reset-btn {
    align-self: flex-start;
  }

  .stress-content {
    gap: 20px;
  }

  .block-details {
    flex-direction: column;
  }
}
</style>
