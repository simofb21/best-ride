<template>
  <section class="category-section">
    <button class="category-header" @click="toggleOpen">
      <span class="category-title">{{ title }}</span>

      <!-- Selettore sotto-categoria (solo per Power) -->
      <div v-if="subcategories" class="subcategory-selector" @click.stop>
        <v-menu>
          <template #activator="{ props: menuProps }">
            <button class="subcategory-btn" v-bind="menuProps">
              {{ activeSubcategory?.label }}
              <v-icon icon="mdi-chevron-down" size="16" />
            </button>
          </template>
          <v-list density="compact">
            <v-list-item
              v-for="sub in subcategories"
              :key="sub.key"
              :active="sub.key === activeSubcategory?.key"
              @click="activeSubcategory = sub"
            >
              <v-list-item-title>{{ sub.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <v-icon
        class="chevron"
        :icon="isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        size="20"
      />
    </button>

    <div class="category-body" :class="{ 'is-open': isOpen }">
      <div class="metrics-grid">
        <!-- Usa PersonalizedRecordCard qui -->
        <RecordCard
          v-for="metric in activeMetrics"
          :key="metric.key"
          :label="metric.label"
          :unit="metric.unit"
          :entries="records[metric.key] || []"
          :deletable="false"
          @save-entry="
            (rank, entry) => $emit('save-entry', metric.key, rank, entry)
          "
          @add-entry="() => $emit('add-entry', metric.key, metric.unit)"
          @delete-entry="(rank) => $emit('delete-entry', metric.key, rank)"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
// Importazione del componente corretto:
import RecordCard from "./RecordCard.vue";

interface MetricConfig {
  key: string;
  label: string;
  unit: string;
}

interface SubcategoryConfig {
  key: string;
  label: string;
  metrics: MetricConfig[];
}

const props = defineProps<{
  title: string;
  metrics?: MetricConfig[];
  subcategories?: SubcategoryConfig[];
  records: Record<string, any[]>;
}>();

defineEmits<{
  (e: "save-entry", metricKey: string, rank: number, entry: any): void;
  (e: "add-entry", metricKey: string, unit: string): void;
  (e: "delete-entry", metricKey: string, rank: number): void;
}>();

const isOpen = ref(false);

function toggleOpen() {
  isOpen.value = !isOpen.value;
}

const activeSubcategory = ref<SubcategoryConfig | null>(
  props.subcategories?.[0] ?? null,
);

watch(
  () => props.subcategories,
  (newSub) => {
    if (newSub && newSub.length > 0) {
      activeSubcategory.value = newSub[0];
    }
  },
  { immediate: true },
);

const activeMetrics = computed(() => {
  if (props.subcategories && props.subcategories.length > 0) {
    return activeSubcategory.value?.metrics ?? [];
  }
  return props.metrics ?? [];
});
</script>

<style scoped>
.category-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  margin-bottom: 20px;
  overflow: hidden;
}

.category-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}

.category-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.subcategory-selector {
  margin-left: auto;
}

.subcategory-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
}
.subcategory-btn:hover {
  border-color: var(--accent);
}

.chevron {
  color: var(--text-muted);
  flex-shrink: 0;
}

.category-body {
  display: block;
  padding: 0 20px 20px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

@media (min-width: 701px) {
  .chevron {
    display: none;
  }
  .category-header {
    cursor: default;
  }
}

@media (max-width: 700px) {
  .category-body {
    display: none;
  }
  .category-body.is-open {
    display: block;
  }
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
