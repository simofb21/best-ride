<template>
  <CollapsiblePanel :title="title" :icon="icon">
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-item">
        <span class="stat-label">{{ stat.label }}</span>
        <span class="stat-value"
          >{{ stat.value
          }}<small v-if="stat.unit"> {{ stat.unit }}</small></span
        >
      </div>
    </div>
  </CollapsiblePanel>
</template>

<script setup lang="ts">
import CollapsiblePanel from "~/components/ui/CollapsiblePanel.vue";

defineProps<{
  title: string;
  icon?: string;
  stats: Array<{ label: string; value: string | number; unit?: string }>;
}>();
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}
.stat-value {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}
.stat-value small {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}
</style>
