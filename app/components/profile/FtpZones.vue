<template>
  <div class="zones-card">
    <div class="zones-header">
      <h3>Power Zones</h3>
      <span class="reference-value"> FTP: {{ ftp }}<small>W</small> </span>
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

        <span
          class="zone-range"
        >
          {{ zone.minValue }}{{ zone.maxValue ? `–${zone.maxValue}` : "+"
          }}<small>W</small>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ ftp: number }>();

const zones = computed(() => computeZones(props.ftp, FTP_ZONES));
</script>

<style scoped>
.zones-card {
  background: var(--surface, #ffffff);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 16px;
  padding: 24px 28px;
  width: 100%; /* Sostituito max-width con width: 100% */
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04);
}

.zones-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.zones-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text, #111827);
}

.reference-value {
  font-weight: 700;
  font-size: 13px;
  color: var(--text, #111827);
  background: var(--surface-subtle, #f3f4f6);
  padding: 4px 10px;
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
  gap: 8px; /* Sostituito i bordi divisori con uno spacing pulito a schede */
}

.zone-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 12px;
  border-radius: 10px;
  transition: background-color 0.15s ease;
}

.zone-row:hover {
  background-color: var(--surface-hover, rgba(0, 0, 0, 0.025));
}

/* --- BADGE / FISH DELLA ZONA --- */
.zone-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border-radius: 20px;
  /* Trasparenza adattiva basata sul colore dinamico della zona */
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
  white-space: nowrap;
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

@media (max-width: 520px) {
  .zones-card {
    padding: 20px 16px;
  }

  .zone-description {
    display: none;
  }
}
</style>
