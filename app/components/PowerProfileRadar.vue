<template>
  <div class="power-profile">
    <div v-if="loading" class="state-message">Loading power profile...</div>

    <div v-else-if="error" class="state-message error">{{ error }}</div>

    <template v-else-if="data">
      <svg class="radar-svg" viewBox="0 0 400 400">
        <!-- Griglia di riferimento: anelli concentrici a 20/40/60/80/100 -->
        <polygon
          v-for="ring in [20, 40, 60, 80, 100]"
          :key="ring"
          :points="ringPoints(ring)"
          class="radar-ring"
        />

        <!-- Linee assiali dal centro a ogni vertice -->
        <line
          v-for="(point, i) in axisEndpoints"
          :key="'axis-' + i"
          x1="200"
          y1="200"
          :x2="point.x"
          :y2="point.y"
          class="radar-axis"
        />

        <!-- Poligono dei dati dell'atleta -->
        <polygon :points="dataPoints" class="radar-shape" />
        <circle
          v-for="(point, i) in dataCoords"
          :key="'dot-' + i"
          :cx="point.x"
          :cy="point.y"
          r="4"
          class="radar-dot"
        />

        <!-- Etichette degli assi -->
        <text
          v-for="(point, i) in labelPositions"
          :key="'label-' + i"
          :x="point.x"
          :y="point.y"
          class="axis-label"
          text-anchor="middle"
        >
          {{ data.profile[i]!.shortLabel }}
        </text>
      </svg>

      <div class="legend">
        <div v-for="item in data.profile" :key="item.key" class="legend-row">
          <span class="legend-label"
            >{{ item.shortLabel }} — {{ item.label }}</span
          >
          <span v-if="item.hasData" class="legend-value">
            {{ item.wkg }} W/kg <span class="tier-tag">{{ item.tier }}</span>
          </span>
          <span v-else class="legend-value muted">No data yet</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface ProfileEntry {
  key: string;
  label: string;
  shortLabel: string;
  rawWatts: number | null;
  wkg: number | null;
  score: number;
  tier: string | null;
  hasData: boolean;
}

interface PowerProfileData {
  weightKg: number;
  profile: ProfileEntry[];
}

const data = ref<PowerProfileData | null>(null);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    data.value = await $fetch("/api/power-profile");
  } catch (err: any) {
    error.value = err?.data?.message || "Could not load power profile";
  } finally {
    loading.value = false;
  }
});

const CENTER = 200;
const RADIUS = 150;

// Calcola la posizione (x,y) su un dato asse, a un dato raggio (0-100 -> 0-RADIUS)
function pointOnAxis(
  axisIndex: number,
  totalAxes: number,
  radiusValue: number,
) {
  const angle = (Math.PI * 2 * axisIndex) / totalAxes - Math.PI / 2; // -90° per partire dall'alto
  return {
    x: CENTER + radiusValue * Math.cos(angle),
    y: CENTER + radiusValue * Math.sin(angle),
  };
}

const totalAxes = computed(() => data.value?.profile.length ?? 6);

function ringPoints(percent: number): string {
  const r = (percent / 100) * RADIUS;
  return Array.from({ length: totalAxes.value }, (_, i) => {
    const p = pointOnAxis(i, totalAxes.value, r);
    return `${p.x},${p.y}`;
  }).join(" ");
}

const axisEndpoints = computed(() => {
  return Array.from({ length: totalAxes.value }, (_, i) =>
    pointOnAxis(i, totalAxes.value, RADIUS),
  );
});

const labelPositions = computed(() => {
  return Array.from({ length: totalAxes.value }, (_, i) =>
    pointOnAxis(i, totalAxes.value, RADIUS + 24),
  );
});

const dataCoords = computed(() => {
  if (!data.value) return [];
  return data.value.profile.map((entry, i) => {
    const r = (entry.score / 100) * RADIUS;
    return pointOnAxis(i, totalAxes.value, r);
  });
});

const dataPoints = computed(() => {
  return dataCoords.value.map((p) => `${p.x},${p.y}`).join(" ");
});
</script>

<style scoped>
.power-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.state-message {
  color: var(--text-muted);
  padding: 40px 0;
}
.state-message.error {
  color: #ef4444;
}

.radar-svg {
  width: 100%;
  max-width: 420px;
  height: auto;
}

.radar-ring {
  fill: none;
  stroke: var(--border);
  stroke-width: 1;
}

.radar-axis {
  stroke: var(--border);
  stroke-width: 1;
}

.radar-shape {
  fill: var(--accent);
  fill-opacity: 0.18;
  stroke: var(--accent);
  stroke-width: 2;
}

.radar-dot {
  fill: var(--accent-strong);
}

.axis-label {
  font-size: 13px;
  font-weight: 700;
  fill: var(--text);
  font-family: var(--mono);
}

.legend {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}
.legend-row:last-child {
  border-bottom: none;
}

.legend-label {
  color: var(--text-muted);
}

.legend-value {
  font-family: var(--mono);
  font-weight: 700;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
}
.legend-value.muted {
  color: var(--text-muted);
  font-weight: 500;
}

.tier-tag {
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-family: var(--sans);
  font-weight: 600;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
}
</style>
