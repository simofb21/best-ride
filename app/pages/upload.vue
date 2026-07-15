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
      <h2>Riepilogo attività</h2>
      <ul class="stats-grid">
        <li>Distanza: {{ result.activity.distance }} km</li>
        <li>Durata: {{ Math.round(result.activity.duration / 60) }} min</li>
        <li>Dislivello: {{ result.activity.elevation_gain }} m</li>
        <li>Velocità media: {{ result.activity.average_speed }} km/h</li>
        <li>Velocità massima: {{ result.activity.max_speed }} km/h</li>
        <li>Cadenza media: {{ result.activity.average_cadence }} rpm</li>
        <li>FC media: {{ result.activity.average_heartrate }} bpm</li>
        <li>FC massima: {{ result.activity.max_heartrate }} bpm</li>
        <li>Potenza media: {{ result.activity.average_watts }} W</li>
        <li>Potenza massima: {{ result.activity.max_watts }} W</li>
        <li>Energia: {{ result.activity.kilojoules }} kJ</li>
        <li>Calorie: {{ result.activity.kcalories }} kcal</li>
        <li>Potenza normalizzata: {{ result.activity.normalized_power }} W</li>
      </ul>

      <h2>Curva di potenza</h2>

      <h3>Intervalli brevi</h3>
      <ul class="stats-grid">
        <li
          v-for="(value, key) in result.power_records[0].short_intervals"
          :key="key"
        >
          {{ key }}: {{ value }} W
        </li>
      </ul>

      <h3>Intervalli medi</h3>
      <ul class="stats-grid">
        <li
          v-for="(value, key) in result.power_records[1].middle_intervals"
          :key="key"
        >
          {{ key }}: {{ value }} W
        </li>
      </ul>

      <h3>Intervalli lunghi</h3>
      <ul class="stats-grid">
        <li
          v-for="(value, key) in result.power_records[2].long_intervals"
          :key="key"
        >
          {{ key }}: {{ value }} W
        </li>
      </ul>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const selectedFile = ref<File | null>(null);
const result = ref<ActivityAnalysis | null>(null);
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
  setFile(e.dataTransfer?.files?.[0] ?? null);
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
    result.value = await $fetch<ActivityAnalysis>("/api/upload", {
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
}
.dropzone.is-dragover {
  border-color: #42b883;
  background-color: rgba(66, 184, 131, 0.08);
}
.hidden-input {
  display: none;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
  list-style: none;
  padding: 0;
}
.error {
  color: #e53935;
  margin-top: 12px;
}
</style>
