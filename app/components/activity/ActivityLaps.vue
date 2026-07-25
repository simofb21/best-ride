<template>
  <CollapsiblePanel title="Laps" icon="mdi-flag-checkered" full-width>
    <div v-if="!laps.length" class="no-data">No laps recorded</div>
    <table v-else class="laps-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Time</th>
          <th>Distance</th>
          <th>Avg Speed</th>
          <th>Avg Power</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="lap in laps" :key="lap.lapNumber">
          <td>{{ lap.lapNumber }}</td>
          <td>{{ formatDuration(lap.durationSeconds) }}</td>
          <td>{{ lap.distanceKm }} km</td>
          <td>{{ lap.avgSpeedKmh }} km/h</td>
          <td>{{ lap.avgPowerWatts }} W</td>
        </tr>
      </tbody>
    </table>
  </CollapsiblePanel>
</template>

<script setup lang="ts">
import CollapsiblePanel from "~/components/ui/CollapsiblePanel.vue";
defineProps<{
  laps: Array<{
    lapNumber: number;
    durationSeconds: number;
    distanceKm: number;
    avgSpeedKmh: number;
    avgPowerWatts: number;
  }>;
}>();

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
</script>

<style scoped>
.no-data {
  color: var(--text-muted);
  font-size: 13px;
}
.laps-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.laps-table th {
  text-align: left;
  color: var(--text-muted);
  font-weight: 600;
  padding: 8px;
  border-bottom: 1px solid var(--border);
}
.laps-table td {
  padding: 8px;
  color: var(--text);
  font-family: var(--mono);
  border-bottom: 1px solid var(--border);
}
@media (max-width: 700px) {
  .laps-table {
    font-size: 11px;
  }
}
</style>
