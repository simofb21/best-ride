<template>
  <div class="activity-info-page">
    <h1>Latest Activity</h1>
    <p class="eyebrow">
      View the details of your most recent activity, including stats, records,
      and more. Upload a new activity to see it here.
    </p>

    <div v-if="loading" class="state-message">Loading...</div>
    <div v-else-if="loadError" class="empty-state">
      <p>{{ loadError }}</p>
      <NuxtLink to="/upload" class="cta-btn">Upload an activity</NuxtLink>
    </div>

    <div v-else-if="data" class="activity-layout">
      <ShareActivityButton
        v-if="data"
        :activity-data="{
          activity: data.activity,
          training_load: data.training_load,
          power_records: data.power_records,
        }"
      />
      <div class="slot-general">
        <ActivityStatsPanel
          title="General"
          icon="mdi-speedometer"
          :stats="generalStats"
        />
      </div>
      <div class="slot-other">
        <ActivityStatsPanel
          title="Other Info"
          icon="mdi-format-list-bulleted"
          :stats="otherStats"
        />
      </div>
      <div class="slot-records">
        <ActivityRecordsPanel :record-checks="data.recordChecks || []" />
      </div>
      <div class="slot-curve">
        <PowerCurveChart
          v-if="data.power_records"
          :power-records="data.power_records"
        />
      </div>
      <div class="slot-map">
        <ActivityMap v-if="data.gpsTrack" :gps-track="data.gpsTrack" />
      </div>
      <div class="slot-zones">
        <ActivityZonesPanel
          v-if="data.powerZoneTime"
          :power-zone-time="data.powerZoneTime"
          :heart-rate-zone-time="data.heartRateZoneTime"
        />
      </div>
      <div class="slot-laps">
        <ActivityLaps v-if="data.laps" :laps="data.laps" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ActivityStatsPanel from "~/components/activity/ActivityStatsPanel.vue";
import PowerCurveChart from "~/components/activity/PowerCurveChart.vue";
import ShareActivityButton from "~/components/activity/ShareActivity.vue";
definePageMeta({ middleware: "auth" });

const data = ref<any>(null);
const loading = ref(true);
const loadError = ref("");

onMounted(async () => {
  document.title = "Latest Activity - Best Ride";

  try {
    data.value = await $fetch("/api/activities/last");
  } catch (err: any) {
    loadError.value =
      err?.data?.message || "No activity found yet. Upload one to get started.";
  } finally {
    loading.value = false;
  }
});

const generalStats = computed(() => {
  if (!data.value) return [];
  const a = data.value.activity;
  return [
    { label: "Avg Speed", value: a.average_speed, unit: "km/h" },
    { label: "Distance", value: a.distance, unit: "km" },
    { label: "Duration", value: formatDuration(a.duration || 0) },
    { label: "Elevation Gain", value: a.elevation_gain, unit: "m" },
    { label: "Avg Heart Rate", value: a.average_heartrate, unit: "bpm" },
    { label: "Avg Power", value: a.average_watts, unit: "W" },
    { label: "Normalized Power", value: a.normalized_power, unit: "W" },
  ];
});

const otherStats = computed(() => {
  if (!data.value) return [];
  const a = data.value.activity;
  const t = data.value.training_load;
  return [
    { label: "Max Speed", value: a.max_speed, unit: "km/h" },
    {
      label: "Max Cadence",
      value: a.max_cadence ?? a.average_cadence,
      unit: "rpm",
    },
    { label: "Max Heart Rate", value: a.max_heartrate, unit: "bpm" },
    {
      label: "Avg Temperature",
      value: a.average_temperature ?? "—",
      unit: a.average_temperature ? "°C" : "",
    },
    { label: "TSS", value: t?.tss ?? "—" },
    { label: "Intensity Factor", value: t?.intensity_factor ?? "—" },
    { label: "Energy", value: a.kilojoules, unit: "kJ" },
    { label: "Calories", value: a.kcalories, unit: "kcal" },
  ];
});

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}
</script>

<style scoped>
.activity-info-page h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text, #111827);
}

.activity-info-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
  padding-bottom: 80px;

  /* overflow-x: hidden; previene che elementi larghi spingano la pagina di lato */
}
.state-message,
.empty-state {
  padding: 60px 32px;
  text-align: center;
  color: var(--text-muted);
}
.empty-state {
  font-size: 16px;
  color: red;
  margin-bottom: 4rem;
}
.cta-btn {
  display: inline-block; /* <-- AGGIUNGI QUESTO */
  margin-top: 24px; /* Ora questo margine funzionerà perfettamente! */
  background: var(--accent);
  color: #fff;
  padding: 10px 20px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
}

.activity-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    "general other"
    "records records"
    "curve curve"
    "map zones"
    "laps laps";
  gap: 20px;
}

.slot-general {
  grid-area: general;
}
.slot-other {
  grid-area: other;
}
.slot-records {
  grid-area: records;
}
.slot-curve {
  grid-area: curve;
}
.slot-map {
  grid-area: map;
}
.slot-zones {
  grid-area: zones;
}
.slot-laps {
  grid-area: laps;
  margin-bottom: 20px;
}

@media (max-width: 900px) {
  .activity-layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "general"
      "other"
      "records"
      "curve"
      "map"
      "zones"
      "laps";
  }
}
.slot-general,
.slot-other,
.slot-records,
.slot-curve,
.slot-map,
.slot-zones,
.slot-laps {
  min-width: 0; /* fix classico per CSS Grid: previene overflow dei figli */
}
</style>
