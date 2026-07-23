<template>
  <div class="zones-card">
    <div class="zones-header">
      <h3>Heart Rate Zones</h3>
      <span class="reference-value">
        Threshold: {{ threshold }}<small>bpm</small>
      </span>
    </div>

    <div class="zones-list">
      <div
        v-for="zone in zones"
        :key="zone.name"
        class="zone-row"
        :style="{ '--zone-color': zone.color }"
      >
        <div class="zone-badge">
          <span class="zone-dot" />
          <span class="zone-name">{{ zone.name }}</span>
        </div>

        <span class="zone-description">{{ zone.description }}</span>

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
  background: var(--surface, #ffffff);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 16px;
  padding: 20px 32px;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
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
  color: var(--text, #111827);
}

.reference-value {
  font-weight: 700;
  font-size: 13px;
  color: var(--text, #111827);
  background: var(--surface-subtle, #f3f4f6);
  padding: 4px 8px;
  border-radius: 6px;
}

.reference-value small {
  color: var(--text-muted, #6b7280);
  margin-left: 2px;
  font-weight: 500;
}

.zones-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.zone-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 10px;
  transition: background-color 0.15s ease;
}

.zone-row:hover {
  background-color: var(--surface-hover, rgba(0, 0, 0, 0.02));
}

/* --- BADGE / FISH DELLA ZONA --- */
.zone-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 20px;
  /* Sfondo sfumato basato sul colore della zona */
  background-color: color-mix(in srgb, var(--zone-color) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--zone-color) 25%, transparent);
  flex-shrink: 0;
}

.zone-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--zone-color);
  box-shadow: 0 0 6px var(--zone-color);
}

.zone-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--text, #111827);
  letter-spacing: 0.01em;
}

/* --- DESCRIZIONE E RANGE --- */
.zone-description {
  font-size: 12px;
  color: var(--text-muted, #6b7280);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.zone-range {
  font-family: var(--mono, monospace);
  font-variant-numeric: tabular-nums;
  font-size: 13px;
  font-weight: 700;
  color: var(--text, #111827);
  white-space: nowrap;
}

.zone-range small {
  color: var(--text-muted, #6b7280);
  font-weight: 500;
  margin-left: 2px;
}

@media (max-width: 480px) {
  .zone-description {
    display: none;
  }
}
</style>
