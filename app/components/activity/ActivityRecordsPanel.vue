<template>
  <CollapsiblePanel
    title="Activity Records"
    icon="mdi-trophy-outline"
    full-width
  >
    <div v-if="!groupedRecords.length" class="no-records">
      No record data available for this activity.
    </div>

    <div v-else class="records-groups">
      <div
        v-for="group in groupedRecords"
        :key="group.category"
        class="record-group"
      >
        <h4 class="group-title">{{ group.label }}</h4>

        <div class="records-grid">
          <div v-for="r in group.items" :key="r.metricKey" class="record-item">
            <div class="record-top">
              <v-icon
                v-if="getMedalColor(r.wouldEnterAt)"
                icon="mdi-medal"
                size="18"
                :color="getMedalColor(r.wouldEnterAt)!"
              />
              <span class="record-label">{{ r.label }}</span>
            </div>

            <div class="record-bottom">
              <span class="record-value">
                {{ isTimeUnit(r.unit) ? formatHMS(r.newValue) : r.newValue }}
                <small v-if="!isTimeUnit(r.unit)">{{ r.unit }}</small>
              </span>

              <span v-if="r.wouldEnterAt" class="rank-tag"
                >#{{ r.wouldEnterAt }} all-time</span
              >
              <span v-if="r.currentBest" class="prev-best">
                (prev:
                {{
                  isTimeUnit(r.unit) ? formatHMS(r.currentBest) : r.currentBest
                }}{{ !isTimeUnit(r.unit) ? r.unit : "" }})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CollapsiblePanel>
</template>

<script setup lang="ts">
import CollapsiblePanel from "~/components/ui/CollapsiblePanel.vue";

interface RecordCheck {
  metricKey: string;
  label: string;
  unit: string;
  newValue: number;
  wouldEnterAt: number | null;
  currentBest: number | null;
}

const props = withDefaults(defineProps<{ recordChecks?: RecordCheck[] }>(), {
  recordChecks: () => [],
});

const CATEGORY_ORDER = [
  "general",
  "short_power",
  "mid_power",
  "long_power",
  "heart_rate",
] as const;
const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  short_power: "Short Power",
  mid_power: "Mid Power",
  long_power: "Long Power",
  heart_rate: "Heart Rate",
};

const groupedRecords = computed(() => {
  // console.log("recordChecks ricevuti dal componente:", props.recordChecks);
  // console.log(
  //   "RECORD_METRICS disponibile?",
  //   typeof RECORD_METRICS,
  //   RECORD_METRICS?.length,
  // );

  return CATEGORY_ORDER.map((category) => {
    const metricsInCategory = RECORD_METRICS.filter(
      (m) => m.category === category,
    );


    const items = metricsInCategory
      .map((m) => props.recordChecks.find((r) => r.metricKey === m.key))
      .filter((r): r is RecordCheck => !!r);


    return { category, label: CATEGORY_LABELS[category]!, items };
  }).filter((group) => group.items.length > 0);
});
</script>

<style scoped>
.no-records {
  color: var(--text-muted);
  font-size: 13px;
  font-style: italic;
}

.records-groups {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.group-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  margin: 0 0 10px;
}

.records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.record-item {
  background: var(--surface-alt);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.record-top {
  display: flex;
  align-items: center;
  gap: 6px;
}
.record-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
}

.record-bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
}
.record-value {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}
.record-value small {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
  margin-left: 2px;
}

.rank-tag {
  font-size: 10px;
  font-weight: 700;
  color: var(--accent-strong);
  background: var(--accent-soft);
  padding: 2px 6px;
  border-radius: 4px;
}
.prev-best {
  font-size: 10px;
  color: var(--text-muted);
}

@media (max-width: 480px) {
  .records-grid {
    grid-template-columns: 1fr;
  }
}
</style>
