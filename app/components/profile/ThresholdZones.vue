<template>
  <div class="zones-card">
    <div class="zones-header">
      <h3>Heart Rate Zones</h3>
      <span class="reference-value"
        >Threshold: {{ threshold }}<small>bpm</small></span
      >
    </div>

    <div class="zones-list">
      <div v-for="zone in zones" :key="zone.name" class="zone-row">
        <span class="zone-color-dot" :style="{ background: zone.color }" />
        <div class="zone-info">
          <span class="zone-name">{{ zone.name }}</span>
          <span class="zone-description">{{ zone.description }}</span>
        </div>
        <span class="zone-range">
          {{ zone.minValue }}{{ zone.maxValue ? `–${zone.maxValue}` : "+"
          }}<small>bpm</small>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ threshold: number }>();

const zones = computed(() => computeZones(props.threshold, HR_ZONES));
</script>

<style scoped>
.zones-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
}

.zones-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
}
.zones-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}
.reference-value {
  font-family: var(--mono);
  font-weight: 700;
  color: var(--accent-strong);
}
.reference-value small {
  color: var(--text-muted);
  font-weight: 500;
  margin-left: 2px;
}

.zones-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.zone-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}
.zone-row:last-child {
  border-bottom: none;
}

.zone-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.zone-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.zone-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.zone-description {
  font-size: 11px;
  color: var(--text-muted);
}

.zone-range {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
}
.zone-range small {
  color: var(--text-muted);
  font-weight: 500;
}

@media (max-width: 480px) {
  .zone-description {
    display: none;
  }
}
</style>
