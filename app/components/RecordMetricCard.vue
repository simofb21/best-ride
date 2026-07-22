<template>
  <div class="metric-card">
    <div class="metric-header">
      <span class="metric-label">{{ label }}</span>
      <div class="header-actions">
        <span class="metric-unit">{{ isTimeUnit(unit) ? "h:m:s" : unit }}</span>
        <button
          v-if="deletable"
          class="icon-btn delete-icon"
          @click="$emit('delete-record')"
        >
          <v-icon icon="mdi-trash-can-outline" size="16" />
        </button>
      </div>
    </div>

    <div class="entries">
      <div v-for="(entry, index) in entries" :key="index" class="entry-row">
        <v-icon
          icon="mdi-medal"
          size="24"
          :color="medalColor(index)"
          class="rank-medal"
        />
        <!-- Sola lettura -->
        <template v-if="!isEditing(index + 1)">
          <span class="value-display">
            {{ isTimeUnit(unit) ? formatHMS(entry.value) : entry.value }}
          </span>
          <span class="date-display">{{ formatDateDisplay(entry.date) }}</span>
          <span class="description-display">{{
            entry.description || "—"
          }}</span>
        </template>

        <!-- Modalità modifica -->
        <template v-else>
          <TimeInput v-if="isTimeUnit(unit)" v-model="draft.value" />
          <input
            v-else
            type="number"
            class="value-input"
            v-model.number="draft.value"
          />
          <input type="date" class="date-input" v-model="draft.date" />
          <input
            type="text"
            class="description-input"
            placeholder="Add a note..."
            v-model="draft.description"
          />
        </template>

        <div class="row-actions">
          <button
            v-if="!isEditing(index + 1)"
            class="icon-btn"
            @click="startEdit(index + 1, entry)"
          >
            <v-icon icon="mdi-pencil-outline" size="17" />
          </button>
          <button
            v-else
            class="icon-btn save-icon"
            @click="saveEdit(index + 1)"
          >
            <v-icon icon="mdi-check" size="18" />
          </button>

          <button
            class="icon-btn delete-icon"
            @click="$emit('delete-entry', index + 1)"
          >
            <v-icon icon="mdi-delete-outline" size="17" />
          </button>
        </div>
      </div>

      <button class="add-btn" @click="$emit('add-entry', unit)">
        <v-icon icon="mdi-plus" size="16" />
        Add performance
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const MEDAL_COLORS = ["yellow-darken-2", "grey", "orange"]; // oro, argento, bronzo

function medalColor(index: number): string {
  return MEDAL_COLORS[index] ?? "grey";
}
interface RecordEntry {
  value: number;
  date: string;
  description?: string | null;
}

const props = defineProps<{
  label: string;
  unit: string;
  entries: RecordEntry[];
  deletable?: boolean; // true per i custom (si può eliminare l'intera card), false per i fissi
}>();

const emit = defineEmits<{
  (e: "save-entry", rank: number, entry: RecordEntry): void;
  (e: "add-entry", unit: string): void;
  (e: "delete-entry", rank: number): void;
  (e: "delete-record"): void;
}>();

function formatDateDisplay(date: string) {
  return new Date(date).toLocaleDateString();
}
function formatDateForInput(date: string) {
  return new Date(date).toISOString().split("T")[0];
}

// --- Edit inline (matita → spunta), interno al componente ---
const editingRank = ref<number | null>(null);
const draft = reactive<RecordEntry>({ value: 0, date: "", description: "" });

function isEditing(rank: number) {
  return editingRank.value === rank;
}

function startEdit(rank: number, entry: RecordEntry) {
  editingRank.value = rank;
  draft.value = entry.value;
  draft.date = formatDateForInput(entry.date);
  draft.description = entry.description || "";
}

function saveEdit(rank: number) {
  emit("save-entry", rank, {
    value: draft.value,
    date: draft.date,
    description: draft.description || null,
  });
  editingRank.value = null;
}
</script>

<style scoped>
.metric-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}
.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.metric-label {
  font-weight: 600;
  font-size: 14px;
}
.metric-unit {
  color: var(--text-muted);
  font-size: 12px;
}

.entry-row {
  display: grid;
  grid-template-columns: 26px 60px 90px 1fr auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.rank-badge {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--accent);
  font-weight: 700;
}

.value-display,
.date-display,
.description-display {
  font-size: 13px;
  color: var(--text);
}
.description-display {
  color: var(--text-muted);
  font-size: 12px;
}

.value-input,
.date-input,
.description-input {
  border: 1px solid var(--accent);
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 12px;
  background: var(--bg);
  color: var(--text);
  width: 100%;
}

.row-actions {
  display: flex;
  gap: 2px;
}
.icon-btn {
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
}
.icon-btn:hover {
  background: var(--border);
  color: var(--text);
}
.save-icon {
  color: var(--accent);
}
.save-icon:hover {
  color: var(--accent-strong);
}
.delete-icon:hover {
  color: #ef4444;
}

.add-btn {
  border: 1px dashed var(--border);
  background: transparent;
  color: var(--text-muted);
  border-radius: 8px;
  padding: 8px;
  font-size: 12px;
  width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 4px;
}
.add-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
@media (max-width: 480px) {
  .custom-records-grid,
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .entry-row {
    grid-template-columns: 24px 1fr auto;
    grid-template-areas:
      "medal value actions"
      "medal date actions"
      "medal desc actions";
    row-gap: 4px;
  }

  .value-display,
  .value-input {
    grid-area: value;
  }
  .date-display,
  .date-input {
    grid-area: date;
  }
  .description-display,
  .description-input {
    grid-area: desc;
  }
  .rank-medal {
    grid-area: medal;
  }
  .row-actions {
    grid-area: actions;
  }
}
</style>
