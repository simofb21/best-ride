<template>
  <CollapsiblePanel
    :title="$t('activityComponents.laps.title')"
    icon="mdi-flag-checkered"
    full-width
  >
    <div v-if="!laps.length" class="no-data">
      {{ $t("activityComponents.laps.none") }}
    </div>
    <div v-else class="table-scroll">
      <table class="laps-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ $t("activityComponents.laps.time") }}</th>
            <th>{{ $t("activity.stats.distance") }}</th>
            <th>{{ $t("activity.stats.avgSpeed") }}</th>
            <th>{{ $t("activity.stats.avgPower") }}</th>
            <th>{{ $t("activityComponents.laps.avgCadence") }}</th>
            <th>{{ $t("activity.stats.avgHeartRate") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lap in laps" :key="lap.lapNumber">
            <td>{{ lap.lapNumber }}</td>
            <td>{{ formatDuration(lap.durationSeconds) }}</td>
            <td>{{ lap.distanceKm }} km</td>
            <td>{{ lap.avgSpeedKmh }} km/h</td>
            <td>{{ lap.avgPowerWatts }} W</td>
            <td>{{ lap.avgCadence }} rpm</td>
            <td>{{ lap.avgHeartRate }} bpm</td>
          </tr>
        </tbody>
      </table>
    </div>
  </CollapsiblePanel>
</template>

<script setup lang="ts">
import CollapsiblePanel from "~/components/ui/CollapsiblePanel";
defineProps<{
  laps: Array<{
    lapNumber: number;
    durationSeconds: number;
    distanceKm: number;
    avgSpeedKmh: number;
    avgPowerWatts: number;
    avgCadence: number;
    avgHeartRate: number;
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

.table-scroll {
  overflow-x: auto;
  max-width: 100%;
  -webkit-overflow-scrolling: touch;
}

.laps-table {
  width: 100%;
  min-width: 480px; /* mai più stretta di così — sotto questa soglia scrolla invece di schiacciarsi */
  border-collapse: collapse;
  font-size: 13px;
}
.laps-table th {
  text-align: left;
  color: var(--text-muted);
  font-weight: 600;
  padding: 8px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.laps-table td {
  padding: 8px;
  color: var(--text);
  font-family: var(--mono);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

@media (max-width: 700px) {
  .laps-table {
    font-size: 11px;
    min-width: 420px;
  }
}
</style>
