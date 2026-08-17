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
        accept=".fit"
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
        :disabled="!selectedFile || loading"
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

onMounted(() => {
  document.title = "Upload .fit File - Best Ride";
});

definePageMeta({ middleware: "auth" });

const selectedFile = ref<File | null>(null);
const result = ref<any>(null);
const loading = ref(false);
const confirming = ref(false);
const error = ref("");
const isDragOver = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const MAX_SIZE_MB = 25;

function setFile(file: File | null) {
  error.value = "";

  if (!file) {
    selectedFile.value = null;
    return;
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith(".fit") && !name.endsWith(".zip")) {
    error.value = "Invalid file type. Only .fit and .zip files are accepted.";
    return;
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    error.value = `File too large. Maximum allowed size is ${MAX_SIZE_MB}MB.`;
    return;
  }

  selectedFile.value = file;
  result.value = null;
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
  selectedFile.value = null;
  result.value = null;
  error.value = "";
  if (fileInput.value) fileInput.value.value = "";
}

async function uploadFile() {
  if (!selectedFile.value) return;

  loading.value = true;
  error.value = "";

  const formData = new FormData();
  formData.append("file", selectedFile.value);

  try {
    result.value = await $fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
  } catch (err: any) {
    error.value =
      err?.data?.message || "Something went wrong while analyzing the file";
  } finally {
    loading.value = false;
  }
}

async function confirmSaveActivity() {
  if (!result.value) return;

  confirming.value = true;
  error.value = "";

  try {
    await $fetch("/api/activities/confirm", {
      method: "POST",
      body: result.value,
    });
    await navigateTo("/activity-info");
  } catch (err: any) {
    error.value = err?.data?.message || "Something went wrong while saving";
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
</style>
