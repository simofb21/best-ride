<template>
  <div class="card curve-card">
    <div class="card-header">
      <h2>Power curve</h2>
      <span class="card-subtitle">Best average power by duration</span>
    </div>

    <svg class="curve-chart" viewBox="0 0 900 260" preserveAspectRatio="none">
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
      <path v-if="chartData.path" :d="chartData.path" class="curve-path" />
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
</template>

<script setup lang="ts">
const props = defineProps<{ powerRecords: any[] }>();
import CollapsiblePanel from "~/components/ui/CollapsiblePanel.vue";

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

const gridLines = [20, 90, 160, 230];

const chartData = computed(() => {
  const { short_intervals } = props.powerRecords[0];
  const { middle_intervals } = props.powerRecords[1];
  const { long_intervals } = props.powerRecords[2];
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

  const width = 900,
    height = 260,
    padTop = 20,
    padBottom = 20;
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
</script>

<style scoped>
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
</style>
