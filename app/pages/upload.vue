<template>
  <div class="page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Activity Analysis</p>
        <h1>Upload a .fit file</h1>
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
        Drop your .fit file here, or click to browse
      </p>
      <p v-else class="dropzone-text file-name">{{ selectedFile.name }}</p>

      <button
        class="analyze-btn"
        :disabled="!selectedFile || loading"
        @click.stop="uploadFile"
      >
        <span v-if="loading" class="spinner" />
        {{ loading ? "Analyzing…" : "Analyze ride" }}
      </button>
    </div>

    <p v-if="error" class="error-banner">{{ error }}</p>

    <!-- ANTEPRIMA SOLO RECORD (Senza Mappe/Grafici) -->
    <section v-if="result" class="results">
      <h2>Activity Analyzed</h2>
      <p class="subtitle">Here are the record achievements from this ride:</p>

      <!-- Mostra solo i record di questa attività -->
      <ActivityRecordsPanel :record-checks="result.recordChecks" />

      <!-- BOX DI CONFERMA / ANNULLAMENTO -->
      <div class="confirm-section">
        <p class="confirm-text">
          Do you want to set this as your latest activity and update your
          records?
        </p>
        <div class="actions">
          <button
            class="cancel-btn"
            :disabled="confirming"
            @click="resetUpload"
          >
            Discard
          </button>
          <button
            class="confirm-btn"
            :disabled="confirming"
            @click="confirmSaveActivity"
          >
            <span v-if="confirming" class="spinner" />
            {{ confirming ? "Saving…" : "Save as latest activity" }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import ActivityRecordsPanel from "~/components/activity/ActivityRecordsPanel.vue";
import { onMounted } from "vue";

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

function setFile(file: File | null) {
  if (file && !file.name.toLowerCase().endsWith(".fit")) {
    error.value = "File must have a .fit extension";
    return;
  }
  selectedFile.value = file;
  result.value = null;
  error.value = "";
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
.eyebrow {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 6px;
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
