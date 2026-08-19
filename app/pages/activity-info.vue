<template>
  <div class="activity-info-page">
    <h1>{{ $t("activity.title") }}</h1>
    <p class="eyebrow">{{ $t("activity.eyebrow") }}</p>

    <div v-if="loading" class="state-message">{{ $t("common.loading") }}</div>
    <div v-else-if="loadError" class="empty-state">
      <p>{{ loadError }}</p>
      <NuxtLink to="/upload" class="cta-btn">
        {{ $t("activity.upload") }}
      </NuxtLink>
    </div>

    <div v-else-if="data" ref="pageRef" class="activity-layout">
      <ShareActivityButton
        v-if="data"
        :activity-data="{
          activity: data.activity,
          training_load: data.training_load,
          power_records: data.power_records,
          gpsTrack: data.gpsTrack,
        }"
        :page-element="pageRef"
      />
      <div class="slot-general">
        <ActivityStatsPanel
          :title="$t('common.general')"
          icon="mdi-speedometer"
          :stats="generalStats"
        />
      </div>
      <div class="slot-other">
        <ActivityStatsPanel
          :title="$t('activity.otherInfo')"
          icon="mdi-format-list-bulleted"
          :stats="otherStats"
        />
      </div>
      <div class="slot-ai">
        <AiTrainingAnalysis
          :initial-analysis="data.aiAnalysis"
          :initial-status="data.aiAnalysisStatus"
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
import AiTrainingAnalysis from "~/components/activity/AiTrainingAnalysis.vue";
definePageMeta({ middleware: "auth" });
const { t } = useI18n();
const appToast = useAppToast();
useHead(() => ({ title: `${t("activity.title")} - Best Ride` }));
const pageRef = ref<HTMLElement | null>(null);

const data = ref<any>(null);
const loading = ref(true);
const loadError = ref("");

onMounted(async () => {
  try {
    data.value = await $fetch("/api/activities/last");
  } catch (error: any) {
    const status =
      error?.statusCode ??
      error?.status ??
      error?.response?.status ??
      error?.response?.statusCode;
    if (status === 404) {
      loadError.value = t("activity.notFound");
    } else {
      loadError.value = t("notifications.loadActivityFailed");
      appToast.error(error, loadError.value, {
        toastId: "activity-load-failed",
      });
    }
  } finally {
    loading.value = false;
  }
});

const generalStats = computed(() => {
  if (!data.value) return [];
  const a = data.value.activity;
  return [
    { label: t("activity.stats.avgSpeed"), value: a.average_speed, unit: "km/h" },
    { label: t("activity.stats.distance"), value: a.distance, unit: "km" },
    { label: t("activity.stats.duration"), value: formatDuration(a.duration || 0) },
    { label: t("activity.stats.elevationGain"), value: a.elevation_gain, unit: "m" },
    { label: t("activity.stats.avgHeartRate"), value: a.average_heartrate, unit: "bpm" },
    { label: t("activity.stats.avgPower"), value: a.average_watts, unit: "W" },
    { label: t("activity.stats.normalizedPower"), value: a.normalized_power, unit: "W" },
  ];
});

const otherStats = computed(() => {
  if (!data.value) return [];
  const a = data.value.activity;
  const trainingLoad = data.value.training_load;
  return [
    { label: t("activity.stats.maxSpeed"), value: a.max_speed, unit: "km/h" },
    {
      label: t("activity.stats.maxCadence"),
      value: a.max_cadence ?? a.average_cadence,
      unit: "rpm",
    },
    { label: t("activity.stats.maxHeartRate"), value: a.max_heartrate, unit: "bpm" },
    {
      label: t("activity.stats.avgTemperature"),
      value: a.average_temperature ?? "—",
      unit: a.average_temperature ? "°C" : "",
    },
    { label: t("activity.stats.stress"), value: trainingLoad?.tss ?? "—" },
    { label: t("activity.stats.fatigue"), value: trainingLoad?.intensity_factor ?? "—" },
    { label: t("activity.stats.energy"), value: a.kilojoules, unit: "kJ" },
    { label: t("activity.stats.calories"), value: a.kcalories, unit: "kcal" },
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
    "ai ai"
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
.slot-ai {
  grid-area: ai;
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
      "ai"
      "records"
      "curve"
      "map"
      "zones"
      "laps";
  }
}
.slot-general,
.slot-other,
.slot-ai,
.slot-records,
.slot-curve,
.slot-map,
.slot-zones,
.slot-laps {
  min-width: 0; /* fix classico per CSS Grid: previene overflow dei figli */
}
</style>
