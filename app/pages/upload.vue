<!-- app/pages/upload.vue -->
<template>
  <div class="page" :class="isDark ? 'theme-dark' : 'theme-light'">
    <header class="page-header">
      <div>
        <p class="eyebrow">Activity Analysis</p>
        <h1>Upload a .fit file</h1>
      </div>
    </header>

    <div
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

    <section v-if="result" class="results">
      <!-- NUOVI RECORD -->
      <div v-if="newRecords.length" class="records-banner">
        <h3>🎉 New records on this ride!</h3>
        <ul>
          <li v-for="check in newRecords" :key="check.metricKey">
            <strong>{{ check.label }}</strong
            >:
            {{
              check.metricKey === "duration"
                ? formatDuration(check.newValue)
                : check.newValue
            }}{{ check.unit !== "h:m:s" ? check.unit : "" }} —
            <span class="rank-tag">#{{ check.wouldEnterAt }} all-time</span>
            <span v-if="check.currentBest">
              (previous best: {{ check.currentBest
              }}{{ check.unit !== "h:m:s" ? check.unit : "" }})</span
            >
          </li>
        </ul>
      </div>
      <div v-else class="no-records-banner">
        No new records this time — but every ride counts!
      </div>

      <!-- HERO STATS -->
      <div class="hero-row">
        <div class="hero-stat accent">
          <span class="hero-label">Normalized Power</span>
          <span class="hero-value"
            >{{ result.activity.normalized_power }}<small>W</small></span
          >
        </div>
        <div class="hero-stat">
          <span class="hero-label">Average Power</span>
          <span class="hero-value"
            >{{ result.activity.average_watts }}<small>W</small></span
          >
        </div>
        <div class="hero-stat">
          <span class="hero-label">Max Power</span>
          <span class="hero-value"
            >{{ result.activity.max_watts }}<small>W</small></span
          >
        </div>
        <div class="hero-stat">
          <span class="hero-label">Duration</span>
          <span class="hero-value">{{
            formatDuration(result.activity.duration)
          }}</span>
        </div>
        <div class="hero-stat">
          <span class="hero-label">Distance</span>
          <span class="hero-value"
            >{{ result.activity.distance }}<small>km</small></span
          >
        </div>
        <div class="hero-stat">
          <span class="hero-label">Elevation</span>
          <span class="hero-value"
            >{{ result.activity.elevation_gain }}<small>m</small></span
          >
        </div>
      </div>

      <div class="main-grid">
        <!-- POWER CURVE -->
        <div class="card curve-card">
          <div class="card-header">
            <h2>Power curve</h2>
            <span class="card-subtitle">Best average power by duration</span>
          </div>

          <svg
            class="curve-chart"
            viewBox="0 0 900 260"
            preserveAspectRatio="none"
          >
            <line
              v-for="gl in gridLines"
              :key="gl"
              x1="0"
              x2="900"
              :y1="gl"
              :y2="gl"
              class="grid-line"
            />
            <path
              v-if="chartData.areaPath"
              :d="chartData.areaPath"
              class="curve-area"
            />
            <path
              v-if="chartData.path"
              :d="chartData.path"
              class="curve-path"
            />
            <circle
              v-for="point in chartData.coords"
              :key="point.key"
              :cx="point.x"
              :cy="point.y"
              r="4"
              class="curve-dot"
            />
          </svg>

          <div class="curve-labels">
            <span
              v-for="point in chartData.coords"
              :key="point.key"
              class="curve-label"
            >
              <strong>{{ point.watts }}W</strong>
              <small>{{ point.label }}</small>
            </span>
          </div>
        </div>

        <!-- SECONDARY METRICS -->
        <div class="card">
          <div class="card-header"><h2>Ride summary</h2></div>
          <div class="metrics-list">
            <div class="metric-row">
              <span>Avg speed</span
              ><strong
                >{{ result.activity.average_speed }} <small>km/h</small></strong
              >
            </div>
            <div class="metric-row">
              <span>Max speed</span
              ><strong
                >{{ result.activity.max_speed }} <small>km/h</small></strong
              >
            </div>
            <div class="metric-row">
              <span>Avg cadence</span
              ><strong
                >{{ result.activity.average_cadence }}
                <small>rpm</small></strong
              >
            </div>
            <div class="metric-row">
              <span>Avg heart rate</span
              ><strong
                >{{ result.activity.average_heartrate }}
                <small>bpm</small></strong
              >
            </div>
            <div class="metric-row">
              <span>Max heart rate</span
              ><strong
                >{{ result.activity.max_heartrate }} <small>bpm</small></strong
              >
            </div>
            <div class="metric-row">
              <span>Energy</span
              ><strong
                >{{ result.activity.kilojoules }} <small>kJ</small></strong
              >
            </div>
            <div class="metric-row">
              <span>Calories</span
              ><strong
                >{{ result.activity.kcalories }} <small>kcal</small></strong
              >
            </div>
            <div class="metric-row">
              <span>Intensity Factor</span
              ><strong>{{ result.training_load?.intensity_factor }}</strong>
            </div>
            <div class="metric-row">
              <span>TSS</span><strong>{{ result.training_load?.tss }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- INTERVAL GROUPS -->
      <div class="interval-groups">
        <div class="card">
          <div class="card-header">
            <h2>Short efforts</h2>
            <span class="card-subtitle">1s – 3min</span>
          </div>
          <div class="chip-grid">
            <div
              v-for="(value, key) in result.power_records[0].short_intervals"
              :key="key"
              class="chip"
            >
              <span class="chip-value">{{ value }}<small>W</small></span>
              <span class="chip-label">{{ labelFor(key) }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2>Mid efforts</h2>
            <span class="card-subtitle">5min – 12min</span>
          </div>
          <div class="chip-grid">
            <div
              v-for="(value, key) in result.power_records[1].middle_intervals"
              :key="key"
              class="chip"
            >
              <span class="chip-value">{{ value }}<small>W</small></span>
              <span class="chip-label">{{ labelFor(key) }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2>Long efforts</h2>
            <span class="card-subtitle">15min – 60min</span>
          </div>
          <div class="chip-grid">
            <div
              v-for="(value, key) in result.power_records[2].long_intervals"
              :key="key"
              class="chip"
            >
              <span class="chip-value">{{ value }}<small>W</small></span>
              <span class="chip-label">{{ labelFor(key) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CONFERMA SALVATAGGIO -->
      <div class="confirm-section">
        <p class="confirm-text">
          Set this as your latest activity and update your records?
        </p>
        <button
          class="confirm-btn"
          :disabled="confirming"
          @click="confirmSaveActivity"
        >
          <span v-if="confirming" class="spinner" />
          {{ confirming ? "Saving…" : "Save as latest activity" }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const selectedFile = ref<File | null>(null);
const result = ref<any>(null);
const loading = ref(false);
const confirming = ref(false);
const error = ref("");
const isDragOver = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

onMounted(() => {});

const DURATION_META: Record<string, { seconds: number; label: string }> = {
  peak_power: { seconds: 1, label: "Peak" },
  "3s_power": { seconds: 3, label: "3 sec" },
  "5s_power": { seconds: 5, label: "5 sec" },
  "10s_power": { seconds: 10, label: "10 sec" },
  "20s_power": { seconds: 20, label: "20 sec" },
  "30s_power": { seconds: 30, label: "30 sec" },
  "1min_power": { seconds: 60, label: "1 min" },
  "2min_power": { seconds: 120, label: "2 min" },
  "3min_power": { seconds: 180, label: "3 min" },
  "5min_power": { seconds: 300, label: "5 min" },
  "8min_power": { seconds: 480, label: "8 min" },
  "10min_power": { seconds: 600, label: "10 min" },
  "12min_power": { seconds: 720, label: "12 min" },
  "15min_power": { seconds: 900, label: "15 min" },
  "20min_power": { seconds: 1200, label: "20 min" },
  "30min_power": { seconds: 1800, label: "30 min" },
  "60min_power": { seconds: 3600, label: "60 min" },
};

function labelFor(key: string): string {
  return DURATION_META[key]?.label ?? key;
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

// Filtra solo i record che sono effettivamente migliorati (wouldEnterAt non null)
const newRecords = computed(() => {
  return (result.value?.recordChecks || []).filter((r: any) => r.wouldEnterAt);
});

const chartData = computed(() => {
  if (!result.value) return { path: "", areaPath: "", coords: [] as any[] };

  const { short_intervals } = result.value.power_records[0];
  const { middle_intervals } = result.value.power_records[1];
  const { long_intervals } = result.value.power_records[2];
  const all = { ...short_intervals, ...middle_intervals, ...long_intervals };

  const points = Object.entries(all)
    .map(([key, watts]) => ({
      key,
      watts: watts as number,
      ...DURATION_META[key],
    }))
    .filter((p) => p.watts > 0)
    .sort((a, b) => a.seconds - b.seconds);

  if (points.length < 2) return { path: "", areaPath: "", coords: [] as any[] };

  const width = 900;
  const height = 260;
  const padTop = 20;
  const padBottom = 20;

  const logMin = Math.log(points[0]!.seconds);
  const logMax = Math.log(points[points.length - 1]!.seconds);
  const maxWatts = Math.max(...points.map((p) => p.watts));

  const coords = points.map((p) => {
    const x = ((Math.log(p.seconds) - logMin) / (logMax - logMin || 1)) * width;
    const y =
      height - padBottom - (p.watts / maxWatts) * (height - padTop - padBottom);
    return { ...p, x, y };
  });

  const path = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
    .join(" ");
  const areaPath = `${path} L ${coords[coords.length - 1]!.x} ${height} L ${coords[0]!.x} ${height} Z`;

  return { path, areaPath, coords };
});

const gridLines = [20, 90, 160, 230];

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
  --mono: ui-monospace, "SFMono-Regular", "JetBrains Mono", Consolas, monospace;
  --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;

  width: 100%;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  transition:
    background-color 0.2s,
    color 0.2s;
}

.page > *,
.page section {
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 32px;
  padding-right: 32px;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 32px;
  padding-bottom: 24px;
}
.eyebrow {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  margin: 0 0 6px;
}
.page-header h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
}

.theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.theme-toggle svg {
  width: 18px;
  height: 18px;
}
.theme-toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.dropzone {
  border: 1.5px dashed var(--border);
  border-radius: 14px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  background: var(--surface);
  transition:
    border-color 0.15s,
    background-color 0.15s;
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
.dropzone.has-file {
  border-style: solid;
  border-color: var(--accent);
}
.dropzone-icon {
  width: 30px;
  height: 30px;
  color: var(--text-muted);
}
.dropzone-text {
  margin: 0;
  color: var(--text-muted);
  font-size: 15px;
}
.dropzone-text.file-name {
  color: var(--text);
  font-family: var(--mono);
  font-weight: 600;
}
.hidden-input {
  display: none;
}

.analyze-btn {
  padding: 12px 28px;
  border: none;
  border-radius: 10px;
  background: var(--accent);
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition:
    background-color 0.15s,
    opacity 0.15s;
}
.analyze-btn:hover:not(:disabled) {
  background: var(--accent-strong);
}
.analyze-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
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

.error-banner {
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  font-size: 13px;
  margin-bottom: 20px;
}

.records-banner {
  background: var(--accent-soft);
  border: 1px solid var(--accent);
  border-radius: 12px;
  padding: 18px 20px;
}
.records-banner h3 {
  margin: 0 0 10px;
  font-size: 15px;
}
.records-banner ul {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.records-banner li {
  font-size: 13px;
}
.rank-tag {
  font-weight: 700;
  color: var(--accent-strong);
}

.no-records-banner {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 20px;
  color: var(--text-muted);
  font-size: 13px;
}

.results {
  padding-bottom: 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
}
.hero-stat {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hero-stat.accent {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.hero-label {
  font-size: 12px;
  color: var(--text-muted);
}
.hero-value {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;
  font-size: 26px;
  font-weight: 700;
}
.hero-value small {
  font-size: 13px;
  color: var(--text-muted);
  margin-left: 3px;
  font-weight: 500;
}
.hero-stat.accent .hero-value {
  color: var(--accent-strong);
}

.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  align-items: start;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px;
}
.card-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 18px;
}
.card-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}
.card-subtitle {
  font-size: 12px;
  color: var(--text-muted);
}

.curve-chart {
  width: 100%;
  height: 220px;
  overflow: visible;
}
.grid-line {
  stroke: var(--border);
  stroke-width: 1;
}
.curve-path {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2.5;
}
.curve-area {
  fill: var(--accent);
  opacity: 0.1;
  stroke: none;
}
.curve-dot {
  fill: var(--surface);
  stroke: var(--accent);
  stroke-width: 2.5;
}

.curve-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  gap: 4px;
}
.curve-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  flex-shrink: 0;
}
.curve-label strong {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--accent-strong);
}
.curve-label small {
  color: var(--text-muted);
}

.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-muted);
}
.metric-row:last-child {
  border-bottom: none;
}
.metric-row strong {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;
  color: var(--text);
  font-size: 15px;
  font-weight: 600;
}
.metric-row strong small {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.interval-groups {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.chip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  gap: 10px;
}
.chip {
  background: var(--surface-alt);
  border-radius: 10px;
  padding: 12px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.chip-value {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-strong);
}
.chip-value small {
  font-size: 10px;
  color: var(--text-muted);
  margin-left: 2px;
}
.chip-label {
  font-size: 10px;
  color: var(--text-muted);
}

.confirm-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.confirm-text {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
}
.confirm-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.confirm-btn:hover:not(:disabled) {
  background: var(--accent-strong);
}
.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 1100px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
  .interval-groups {
    grid-template-columns: 1fr;
  }
  .hero-row {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 640px) {
  .hero-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .page > *,
  .page section {
    padding-left: 16px;
    padding-right: 16px;
  }
  .confirm-section {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
