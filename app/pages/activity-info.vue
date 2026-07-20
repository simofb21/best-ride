<!-- app/pages/activity-info.vue -->
<template>
  <div class="page" :class="isDark ? 'theme-dark' : 'theme-light'">
    <header class="page-header">
      <div>
        <p class="eyebrow">Latest Activity</p>
        <h1>Your Ride Summary</h1>
      </div>
    </header>

    <div v-if="loading" class="state-message">
      Loading your latest activity...
    </div>

    <div v-else-if="loadError" class="empty-state">
      <p>{{ loadError }}</p>
      <NuxtLink to="/upload" class="cta-btn">Upload an activity</NuxtLink>
    </div>

    <section v-else-if="data" class="results">
      <!-- HERO STATS -->
      <div class="hero-row">
        <div class="hero-stat accent">
          <span class="hero-label">Normalized Power</span>
          <span class="hero-value"
            >{{ data.activity.normalized_power }}<small>W</small></span
          >
        </div>
        <div class="hero-stat">
          <span class="hero-label">Average Power</span>
          <span class="hero-value"
            >{{ data.activity.average_watts }}<small>W</small></span
          >
        </div>
        <div class="hero-stat">
          <span class="hero-label">Max Power</span>
          <span class="hero-value"
            >{{ data.activity.max_watts }}<small>W</small></span
          >
        </div>
        <div class="hero-stat">
          <span class="hero-label">Duration</span>
          <span class="hero-value">{{
            formatDuration(data.activity.duration)
          }}</span>
        </div>
        <div class="hero-stat">
          <span class="hero-label">Distance</span>
          <span class="hero-value"
            >{{ data.activity.distance }}<small>km</small></span
          >
        </div>
        <div class="hero-stat">
          <span class="hero-label">Elevation</span>
          <span class="hero-value"
            >{{ data.activity.elevation_gain }}<small>m</small></span
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
                >{{ data.activity.average_speed }} <small>km/h</small></strong
              >
            </div>
            <div class="metric-row">
              <span>Max speed</span
              ><strong
                >{{ data.activity.max_speed }} <small>km/h</small></strong
              >
            </div>
            <div class="metric-row">
              <span>Avg cadence</span
              ><strong
                >{{ data.activity.average_cadence }} <small>rpm</small></strong
              >
            </div>
            <div class="metric-row">
              <span>Avg heart rate</span
              ><strong
                >{{ data.activity.average_heartrate }}
                <small>bpm</small></strong
              >
            </div>
            <div class="metric-row">
              <span>Max heart rate</span
              ><strong
                >{{ data.activity.max_heartrate }} <small>bpm</small></strong
              >
            </div>
            <div class="metric-row">
              <span>Energy</span
              ><strong>{{ data.activity.kilojoules }} <small>kJ</small></strong>
            </div>
            <div class="metric-row">
              <span>Calories</span
              ><strong
                >{{ data.activity.kcalories }} <small>kcal</small></strong
              >
            </div>
            <div class="metric-row">
              <span>Intensity Factor</span
              ><strong>{{ data.training_load?.intensity_factor }}</strong>
            </div>
            <div class="metric-row">
              <span>TSS</span><strong>{{ data.training_load?.tss }}</strong>
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
              v-for="(value, key) in data.power_records[0].short_intervals"
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
              v-for="(value, key) in data.power_records[1].middle_intervals"
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
              v-for="(value, key) in data.power_records[2].long_intervals"
              :key="key"
              class="chip"
            >
              <span class="chip-value">{{ value }}<small>W</small></span>
              <span class="chip-label">{{ labelFor(key) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const data = ref<any>(null);
const loading = ref(true);
const loadError = ref("");
const isDark = ref(false);

onMounted(async () => {
  try {
    data.value = await $fetch("/api/activities/last");
  } catch (err: any) {
    loadError.value =
      err?.data?.message || "No activity found yet. Upload one to get started.";
  } finally {
    loading.value = false;
  }
});

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

const chartData = computed(() => {
  if (!data.value) return { path: "", areaPath: "", coords: [] as any[] };

  const { short_intervals } = data.value.power_records[0];
  const { middle_intervals } = data.value.power_records[1];
  const { long_intervals } = data.value.power_records[2];
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

.state-message {
  padding: 60px 32px;
  text-align: center;
  color: var(--text-muted);
}

.empty-state {
  padding: 60px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--text-muted);
}
.cta-btn {
  background: var(--accent);
  color: #fff;
  padding: 10px 20px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
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
}
</style>
