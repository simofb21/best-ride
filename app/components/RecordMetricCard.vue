<template>
  <div class="metric-card">
    <div class="metric-header">
      <template v-if="!isEditingLabel">
        <span class="metric-label">{{ label }}</span>
        <button
          v-if="editableLabel"
          class="icon-btn label-edit-btn"
          @click="startEditLabel"
        >
          <v-icon icon="mdi-pencil-outline" size="14" />
        </button>
      </template>
      <template v-else>
        <input
          v-model="labelDraft"
          type="text"
          class="label-input"
          maxlength="100"
        />
        <button class="icon-btn save-icon" @click="saveLabel">
          <v-icon icon="mdi-check" size="16" />
        </button>
        <button class="icon-btn" @click="cancelEditLabel">
          <v-icon icon="mdi-close" size="16" />
        </button>
      </template>

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
          size="22"
          :color="medalColor(index)"
          class="rank-medal"
        />

        <!-- Sola lettura -->
        <template v-if="!isEditing(index + 1)">
          <span class="value-display">
            {{ isTimeUnit(unit) ? formatHMS(entry.value) : entry.value }}
          </span>
          <span class="date-display">{{ formatDateDisplay(entry.date) }}</span>

          <button
            v-if="entry.description"
            class="icon-btn description-toggle"
            @click="toggleDescription(index)"
          >
            <v-icon icon="mdi-eye-outline" size="16" />
          </button>
          <span v-else class="description-empty">—</span>
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

        <!-- Descrizione espansa, sotto la riga -->
        <div v-if="expandedDescription === index" class="description-expanded">
          {{ entry.description }}
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
interface RecordEntry {
  value: number;
  date: string;
  description?: string | null;
}

const props = defineProps<{
  label: string;
  unit: string;
  entries: RecordEntry[];
  deletable?: boolean;
  editableLabel?: boolean; // true per i custom, false/assente per i fissi
}>();
// definisce gli eventi che il componente può emettere, con i relativi tipi di argomenti
const emit = defineEmits<{
  (e: "save-entry", rank: number, entry: RecordEntry): void;
  (e: "add-entry", unit: string): void;
  (e: "delete-entry", rank: number): void;
  (e: "delete-record"): void;
  (e: "rename", newLabel: string): void;
}>();

const MEDAL_COLORS = ["yellow-darken-2", "grey", "orange"];
function medalColor(index: number): string {
  return MEDAL_COLORS[index] ?? "grey";
}

function formatDateDisplay(date: string) {
  return new Date(date).toLocaleDateString();
}
function formatDateForInput(date: string) {
  return new Date(date).toISOString().split("T")[0];
}

// --- Editing del nome ---
const isEditingLabel = ref(false);
const labelDraft = ref("");

function startEditLabel() {
  labelDraft.value = props.label;
  isEditingLabel.value = true;
}
function cancelEditLabel() {
  isEditingLabel.value = false;
}
function saveLabel() {
  const trimmed = labelDraft.value.trim();
  if (trimmed && trimmed !== props.label) {
    emit("rename", trimmed);
  }
  isEditingLabel.value = false;
}

// --- Descrizione dietro icona occhio ---
const expandedDescription = ref<number | null>(null);

function toggleDescription(index: number) {
  expandedDescription.value =
    expandedDescription.value === index ? null : index;
}

// --- Edit inline entry (matita → spunta) ---
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
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}
.metric-label {
  font-weight: 600;
  font-size: 14px;
}
.label-edit-btn {
  opacity: 0.5;
}
.label-edit-btn:hover {
  opacity: 1;
}
.label-input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--accent);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 13px;
  background: var(--bg);
  color: var(--text);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.metric-unit {
  color: var(--text-muted);
  font-size: 12px;
  white-space: nowrap;
}

.entry-row {
  display: grid;
  grid-template-columns: 26px 60px 90px 1fr auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.value-display,
.date-display {
  font-size: 13px;
  color: var(--text);
}

.description-toggle {
  color: var(--text-muted);
}
.description-toggle:hover {
  color: var(--accent);
}
.description-empty {
  color: var(--text-muted);
  font-size: 12px;
  text-align: center;
}

.description-expanded {
  grid-column: 1 / -1;
  background: var(--surface-alt);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
  max-width: 100%;
  word-wrap: break-word;
  white-space: normal;
  margin-top: -4px;
  margin-bottom: 4px;
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

/* ============ MOBILE ============ */
@media (max-width: 480px) {
  .entry-row {
    grid-template-columns: 22px 1fr auto;
    grid-template-areas:
      "medal value actions"
      "medal date actions";
    row-gap: 4px;
  }

  .value-display,
  .value-input {
    grid-area: value;
  }
  .date-display,
  .date-input {
    grid-area: date;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .rank-medal {
    grid-area: medal;
  }
  .row-actions {
    grid-area: actions;
  }
  .description-input {
    grid-column: 2 / span 1;
  }

  /* L'icona occhio si sposta accanto alla data su mobile, per risparmiare spazio */
  .description-toggle,
  .description-empty {
    grid-area: date;
    margin-left: auto;
  }

  .description-expanded {
    font-size: 11px;
    padding: 8px 10px;
  }
}
</style>
