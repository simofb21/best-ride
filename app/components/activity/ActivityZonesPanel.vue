<template>
  <CollapsiblePanel title="Time in Zones" icon="mdi-chart-donut" full-width>
    <div class="zones-columns">
      <div class="zones-col">
        <h4>Power Zones</h4>
        <div v-for="z in powerZoneTime" :key="z.name" class="zone-bar-row">
          <span class="zone-dot" :style="{ background: z.color }" />
          <span class="zone-name">{{ z.name }}</span>
          <span class="zone-time"
            >{{ formatSeconds(z.seconds) }}
            <small>({{ z.percent }}%)</small></span
          >
        </div>
      </div>

      <div class="zones-col">
        <h4>Heart Rate Zones</h4>
        <div v-for="z in heartRateZoneTime" :key="z.name" class="zone-bar-row">
          <span class="zone-dot" :style="{ background: z.color }" />
          <span class="zone-name">{{ z.name }}</span>
          <span class="zone-time"
            >{{ formatSeconds(z.seconds) }}
            <small>({{ z.percent }}%)</small></span
          >
        </div>
      </div>
    </div>
  </CollapsiblePanel>
</template>

<script setup lang="ts">
import CollapsiblePanel from "~/components/ui/CollapsiblePanel";

defineProps<{
  powerZoneTime: Array<{
    name: string;
    color: string;
    seconds: number;
    percent: number;
  }>;
  heartRateZoneTime: Array<{
    name: string;
    color: string;
    seconds: number;
    percent: number;
  }>;
}>();

function formatSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s`;
}
</script>

<style scoped>
.zones-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.zones-col h4 {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 10px;
}
.zone-bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 12px;
}
.zone-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.zone-name {
  flex: 1;
  color: var(--text);
}
.zone-time {
  font-family: var(--mono);
  color: var(--text-muted);
}

@media (max-width: 700px) {
  .zones-columns {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
