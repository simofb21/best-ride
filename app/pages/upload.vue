<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">
          {{ $t("upload.title") }}
        </h1>

        <p class="eyebrow">
          {{ $t("upload.eyebrow") }}
        </p>
      </div>
    </header>

    <!-- Dropzone / Input File -->
    <div
      v-if="!result"
      class="dropzone"
      :class="{ 'is-dragover': isDragOver, 'has-file': !!selectedFile }"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".fit,.zip"
        class="hidden-input"
        @change="onFileChange"
      />

      <svg
        class="dropzone-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          d="M12 16V4M12 4l-4 4M12 4l4 4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <path
          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <p v-if="!selectedFile" class="dropzone-text">
        {{ $t("upload.dropzone.dropFile") }}
      </p>

      <p v-else class="dropzone-text file-name">
        {{ selectedFile.name }}
      </p>

      <button
        class="analyze-btn"
        :disabled="loading"
        @click.stop="uploadFile"
      >
        <span v-if="loading" class="spinner" />

        {{
          loading
            ? $t("upload.analysis.analyzing")
            : $t("upload.analysis.analyzeRide")
        }}
      </button>
    </div>

    <!-- ERROR -->
    <p v-if="error" class="error-banner">
      {{ error }}
    </p>

    <!-- RESULTS -->
    <section v-if="result" class="results">
      <h2>
        {{ $t("upload.results.activityAnalyzed") }}
      </h2>

      <p class="subtitle">
        {{ $t("upload.results.recordAchievements") }}
      </p>

      <!-- Activity records -->
      <ActivityRecordsPanel :record-checks="result.recordChecks" />

      <section
        class="feedback-section"
        aria-labelledby="activity-feedback-title"
      >
        <div class="feedback-header">
          <div>
            <h3 id="activity-feedback-title">
              {{ $t("upload.feedback.title") }}
            </h3>
            <p>{{ $t("upload.feedback.intro") }}</p>
          </div>
          <span class="required-note">
            {{ $t("upload.feedback.requiredNote") }}
          </span>
        </div>

        <div class="feedback-form">
          <label class="form-field" for="activity-name">
            <span class="field-label">
              {{ $t("upload.feedback.nameLabel") }}
            </span>
            <input
              id="activity-name"
              v-model="activityName"
              type="text"
              maxlength="120"
              required
              :placeholder="$t('upload.feedback.namePlaceholder')"
              :aria-invalid="activityName.trim().length === 0"
            />
            <span class="field-hint">{{ $t("upload.feedback.nameHint") }}</span>
          </label>

          <fieldset class="rpe-fieldset" aria-describedby="rpe-hint">
            <legend class="field-label">
              {{ $t("upload.feedback.rpeLabel") }}
            </legend>
            <p id="rpe-hint" class="field-hint">
              {{ $t("upload.feedback.rpeHint") }}
            </p>
            <div class="rpe-options">
              <label
                v-for="score in RPE_OPTIONS"
                :key="score"
                class="rpe-choice"
              >
                <input
                  v-model.number="perceivedExertion"
                  type="radio"
                  name="perceived-exertion"
                  :value="score"
                  required
                  :aria-label="$t('upload.feedback.rpeOption', { score })"
                />
                <span class="rpe-score">{{ score }}</span>
              </label>
            </div>
            <div class="rpe-scale" aria-hidden="true">
              <span>{{ $t("upload.feedback.rpeLow") }}</span>
              <span>{{ $t("upload.feedback.rpeHigh") }}</span>
            </div>
          </fieldset>

          <label class="form-field" for="training-notes">
            <span class="field-label">
              {{ $t("upload.feedback.notesLabel") }}
            </span>
            <textarea
              id="training-notes"
              v-model="trainingNotes"
              rows="4"
              maxlength="800"
              :placeholder="$t('upload.feedback.notesPlaceholder')"
            />
            <span class="notes-meta">
              <span class="field-hint notes-hint">
                {{ $t("upload.feedback.notesHint") }}
              </span>
              <span class="character-count" aria-live="polite">
                {{
                  $t("upload.feedback.characterCount", {
                    count: trainingNotes.length,
                  })
                }}
              </span>
            </span>
          </label>
        </div>
      </section>

      <!-- CONFIRMATION -->
      <div class="confirm-section">
        <p class="confirm-text">
          {{ $t("upload.confirmation.message") }}
        </p>

        <div class="actions">
          <button
            class="cancel-btn"
            :disabled="confirming"
            @click="resetUpload"
          >
            {{ $t("upload.confirmation.discard") }}
          </button>

          <button
            class="confirm-btn"
            :disabled="confirming"
            @click="confirmSaveActivity"
          >
            <span v-if="confirming" class="spinner" />

            {{
              confirming
                ? $t("upload.confirmation.saving")
                : $t("upload.confirmation.saveAsLatest")
            }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import ActivityRecordsPanel from "~/components/activity/ActivityRecordsPanel.vue";

definePageMeta({ middleware: "auth" });

const selectedFile = ref<File | null>(null);
const result = ref<any>(null);
const loading = ref(false);
const confirming = ref(false);
const error = ref("");
const isDragOver = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const activityName = ref("");
const perceivedExertion = ref<number | null>(null);
const trainingNotes = ref("");
const trainingNotesRecommendationShown = ref(false);

const MAX_SIZE_MB = 25;
const RPE_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1);
const { t, locale } = useI18n();
const appToast = useAppToast();
useHead(() => ({ title: `${t("upload.title")} - Best Ride` }));

const canConfirm = computed(
  () =>
    activityName.value.trim().length > 0 &&
    perceivedExertion.value != null &&
    perceivedExertion.value >= 1 &&
    perceivedExertion.value <= 10,
);

function resetActivityFeedback() {
  activityName.value = "";
  perceivedExertion.value = null;
  trainingNotes.value = "";
  trainingNotesRecommendationShown.value = false;
}

function defaultActivityName(activityDate: unknown): string {
  const date = new Date(activityDate as string | number | Date);
  if (Number.isNaN(date.getTime())) {
    return t("upload.feedback.defaultNameFallback");
  }

  const formattedDate = new Intl.DateTimeFormat(
    locale.value.toLowerCase().startsWith("it") ? "it-IT" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  ).format(date);

  return t("upload.feedback.defaultName", { date: formattedDate });
}

function setFile(file: File | null) {
  error.value = "";

  if (!file) {
    selectedFile.value = null;
    return;
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith(".fit") && !name.endsWith(".zip")) {
    error.value = t("upload.errors.invalidType");
    appToast.error(error.value, error.value, {
      toastId: "upload-invalid-file-type",
    });
    return;
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    error.value = t("upload.errors.tooLarge", { size: MAX_SIZE_MB });
    appToast.error(error.value, error.value, {
      toastId: "upload-file-too-large",
    });
    return;
  }

  selectedFile.value = file;
  result.value = null;
  resetActivityFeedback();
}

function triggerFileInput() {
  fileInput.value?.click();
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  setFile(target.files?.[0] ?? null);
}

function onDrop(e: DragEvent) {
  isDragOver.value = false;
  setFile(e.dataTransfer?.files?.[0] ?? null);
}

function resetUpload() {
  const hadUpload = selectedFile.value != null || result.value != null;
  const analysisId = result.value?.analysisId;
  if (typeof analysisId === "string") {
    void $fetch("/api/activities/pending", {
      method: "DELETE",
      body: { analysisId },
    }).catch(() => {
      // La prossima analisi sovrascrive comunque l'unico pending dell'utente.
    });
  }

  selectedFile.value = null;
  result.value = null;
  resetActivityFeedback();
  error.value = "";
  if (fileInput.value) fileInput.value.value = "";
  if (hadUpload) {
    appToast.info(t("notifications.uploadDiscarded"), {
      toastId: "upload-discarded",
    });
  }
}

async function uploadFile() {
  if (!selectedFile.value) {
    appToast.warning(t("notifications.selectActivityFile"), {
      toastId: "upload-file-required",
    });
    return;
  }

  loading.value = true;
  error.value = "";

  const formData = new FormData();
  formData.append("file", selectedFile.value);

  try {
    const uploadResult = await $fetch<any>("/api/upload", {
      method: "POST",
      body: formData,
    });
    activityName.value = defaultActivityName(
      uploadResult?.activity?.activityDate,
    );
    perceivedExertion.value = null;
    trainingNotes.value = "";
    result.value = uploadResult;
    appToast.success(t("notifications.activityAnalyzed"), {
      toastId: "upload-activity-analyzed",
    });
  } catch (err: any) {
    const fallback = t("upload.errors.analysis");
    error.value = fallback;
    appToast.error(err, fallback, {
      toastId: "upload-analysis-failed",
    });
  } finally {
    loading.value = false;
  }
}

async function confirmSaveActivity() {
  if (!result.value || !canConfirm.value) {
    appToast.warning(t("notifications.requiredFields"), {
      toastId: "upload-feedback-required",
    });
    return;
  }

  if (
    !trainingNotes.value.trim() &&
    !trainingNotesRecommendationShown.value
  ) {
    appToast.warning(t("notifications.trainingNotesRecommended"), {
      toastId: "upload-training-notes-recommended",
    });
    trainingNotesRecommendationShown.value = true;
  }

  confirming.value = true;
  error.value = "";

  let response: {
    activityId?: string | number;
    duplicate?: boolean;
  };

  try {
    response = await $fetch<{
      activityId?: string | number;
      duplicate?: boolean;
    }>(
      "/api/activities/confirm",
      {
        method: "POST",
        body: {
          analysisId: result.value.analysisId,
          name: activityName.value.trim(),
          perceivedExertion: perceivedExertion.value,
          trainingNotes: trainingNotes.value.trim(),
        },
      },
    );
    if (response.duplicate) {
      appToast.warning(t("notifications.activityAlreadySaved"), {
        toastId: "upload-activity-already-saved",
      });
    } else {
      appToast.success(t("notifications.activitySaved"), {
        toastId: "upload-activity-saved",
      });
    }
  } catch (err: any) {
    const isConflict =
      err?.statusCode === 409 ||
      err?.status === 409 ||
      err?.response?.status === 409;
    error.value = isConflict
      ? t("upload.errors.confirmationConflict")
      : t("common.saveError");
    if (isConflict) {
      appToast.warning(t("notifications.activityAlreadySaved"), {
        toastId: "upload-activity-save-conflict",
      });
    } else {
      appToast.error(err, error.value, {
        toastId: "upload-activity-save-failed",
      });
    }
    confirming.value = false;
    return;
  }

  try {
    await navigateTo(
      response.activityId != null
        ? {
            path: "/activity-info",
            query: { activity: String(response.activityId) },
          }
        : "/activity-info",
    );
  } catch (navigationError) {
    error.value = t("notifications.navigationFailed");
    appToast.error(navigationError, error.value, {
      toastId: "upload-activity-navigation-failed",
    });
  } finally {
    confirming.value = false;
  }
}
</script>

<style scoped>
.page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 20px;
}

.dropzone {
  border: 1.5px dashed var(--border);
  border-radius: 14px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}
.dropzone.is-dragover {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.dropzone-icon {
  width: 32px;
  height: 32px;
  color: var(--text-muted);
}
.hidden-input {
  display: none;
}
.analyze-btn,
.confirm-btn {
  padding: 12px 24px;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.cancel-btn {
  padding: 12px 20px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
  font-weight: 600;
  cursor: pointer;
}
.results {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.results h2 {
  margin: 0;
  color: darkgreen;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  font-size: 1.8rem;
}
.feedback-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 22px;
}
.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 22px;
}
.feedback-header h3 {
  margin: 0 0 6px;
  color: var(--text);
  font-size: 1.15rem;
}
.feedback-header p {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.5;
}
.required-note {
  flex-shrink: 0;
  color: var(--text-muted);
  font-size: 12px;
}
.feedback-form {
  display: grid;
  gap: 22px;
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.field-label {
  color: var(--text);
  font-size: 14px;
  font-weight: 700;
}
.field-hint,
.character-count {
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.45;
}
.form-field input,
.form-field textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 11px 12px;
  background: var(--bg);
  color: var(--text);
  font: inherit;
}
.form-field textarea {
  min-height: 112px;
  resize: vertical;
  line-height: 1.5;
}
.form-field input:focus-visible,
.form-field textarea:focus-visible {
  border-color: var(--accent);
  outline: 3px solid var(--accent-soft);
}
.rpe-fieldset {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.rpe-fieldset .field-hint {
  margin: 6px 0 12px;
}
.rpe-options {
  display: grid;
  grid-template-columns: repeat(10, minmax(42px, 1fr));
  gap: 8px;
}
.rpe-choice {
  position: relative;
  cursor: pointer;
}
.rpe-choice input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}
.rpe-score {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  color: var(--text);
  font-weight: 700;
  transition:
    border-color 0.15s,
    background 0.15s,
    color 0.15s;
}
.rpe-choice:hover .rpe-score {
  border-color: var(--accent);
}
.rpe-choice input:checked + .rpe-score {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}
.rpe-choice input:focus-visible + .rpe-score {
  outline: 3px solid var(--accent-soft);
  outline-offset: 2px;
}
.rpe-scale,
.notes-meta {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.rpe-scale {
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 11px;
}
.notes-hint {
  max-width: 720px;
}
.character-count {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.confirm-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.actions {
  display: flex;
  gap: 12px;
}
.analyze-btn:disabled,
.confirm-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.error-banner {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 12px;
  border-radius: 8px;
}
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 620px) {
  .feedback-header,
  .notes-meta {
    flex-direction: column;
  }
  .rpe-options {
    grid-template-columns: repeat(5, 1fr);
  }
  .actions {
    width: 100%;
  }
  .actions button {
    flex: 1;
    justify-content: center;
  }
}
</style>
