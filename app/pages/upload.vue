<template>
  <div class="upload-page">
    <h1>Carica attività (.fit)</h1>

    <div
      class="dropzone"
      :class="{ 'is-dragover': isDragOver }"
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

      <p v-if="!selectedFile">
        Trascina qui il file .fit oppure clicca per selezionarlo
      </p>
      <p v-else>
        File selezionato: <strong>{{ selectedFile.name }}</strong>
      </p>
    </div>

    <button :disabled="!selectedFile || loading" @click="uploadFile">
      {{ loading ? "Analisi in corso..." : "Carica e analizza" }}
    </button>

    <div v-if="result" class="results">
      <h2>Risultati</h2>
      <ul>
        <li>Durata: {{ result.durationMinutes }} min</li>
        <li>Distanza: {{ result.distanceKm }} km</li>
        <li>Potenza media: {{ result.avgPower }} W</li>
        <li>Potenza massima: {{ result.maxPower }} W</li>
        <li>Cadenza media: {{ result.avgCadence }} rpm</li>
        <li v-if="result.avgHeartRate">
          FC media: {{ result.avgHeartRate }} bpm
        </li>
      </ul>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const selectedFile = ref<File | null>(null);
const result = ref<any>(null);
const loading = ref(false);
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
  const file = e.dataTransfer?.files?.[0];
  setFile(file ?? null);
}

function setFile(file: File | null) {
  if (file && !file.name.toLowerCase().endsWith(".fit")) {
    error.value = "Il file deve avere estensione .fit";
    return;
  }
  selectedFile.value = file;
  result.value = null;
  error.value = "";
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
    error.value = err?.data?.message || "Errore durante il caricamento";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.dropzone {
  border: 2px dashed #999;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background-color 0.2s;
}
.dropzone.is-dragover {
  border-color: #42b883;
  background-color: rgba(66, 184, 131, 0.08);
}
.hidden-input {
  display: none;
}
.error {
  color: #e53935;
  margin-top: 12px;
}
</style>
