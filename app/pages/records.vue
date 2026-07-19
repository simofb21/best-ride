<template>
  <div class="records-page">
    <h1>My Records</h1>
    <p class="subtitle">
      Track your best performances. Add up to 3 results per metric.
    </p>

    <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>

    <section
      v-for="category in categories"
      :key="category.key"
      class="category-section"
    >
      <h2>{{ category.label }}</h2>

      <div class="metrics-grid">
        <div
          v-for="metric in metricsByCategory[category.key]"
          :key="metric.key"
          class="metric-card"
        >
          <div class="metric-header">
            <span class="metric-label">{{ metric.label }}</span>
            <span class="metric-unit">{{
              isTimeUnit(metric.unit) ? "h:m:s" : metric.unit
            }}</span>
          </div>

          <div class="entries">
            <div
              v-for="entry in records[metric.key] || []"
              :key="entry.rank"
              class="entry-row"
            >
              <span class="rank-badge">#{{ entry.rank }}</span>

              <!-- Sola lettura -->
              <template v-if="!isEditing(metric.key, entry.rank)">
                <span class="value-display">
                  {{
                    isTimeUnit(metric.unit)
                      ? formatHMS(entry.value)
                      : entry.value
                  }}
                </span>
                <span class="date-display">{{
                  formatDateDisplay(entry.entryDate)
                }}</span>
                <span class="description-display">{{
                  entry.description || "—"
                }}</span>
              </template>

              <!-- Modalità modifica -->
              <template v-else>
                <TimeInput
                  v-if="isTimeUnit(metric.unit)"
                  v-model="draft.value"
                />
                <input
                  v-else
                  type="number"
                  class="value-input"
                  v-model.number="draft.value"
                />
                <input
                  type="date"
                  class="date-input"
                  v-model="draft.entryDate"
                />
                <input
                  type="text"
                  class="description-input"
                  placeholder="Add a note..."
                  v-model="draft.description"
                />
              </template>

              <div class="row-actions">
                <button
                  v-if="!isEditing(metric.key, entry.rank)"
                  class="icon-btn"
                  @click="startEdit(metric.key, entry)"
                >
                  <v-icon icon="mdi-pencil-outline" size="17" />
                </button>
                <button
                  v-else
                  class="icon-btn save-icon"
                  @click="saveEdit(metric.key, entry.rank)"
                >
                  <v-icon icon="mdi-check" size="18" />
                </button>

                <button
                  class="icon-btn delete-icon"
                  @click="confirmDelete(metric.key, entry.rank)"
                >
                  <v-icon icon="mdi-delete-outline" size="17" />
                </button>
              </div>
            </div>

            <button
              v-if="(records[metric.key]?.length || 0) < 3"
              class="add-btn"
              @click="openAddForm(metric.key)"
            >
              <v-icon icon="mdi-plus" size="16" />
              Add performance
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Dialog: aggiungi nuova performance -->
    <v-dialog v-model="showAddDialog" max-width="360">
      <v-card>
        <v-card-title
          >New performance — {{ metricLabel(addingMetric) }}</v-card-title
        >
        <v-card-text class="dialog-form">
          <label>
            Value ({{
              isTimeUnit(metricUnit(addingMetric))
                ? "h:m:s"
                : metricUnit(addingMetric)
            }})
            <TimeInput
              v-if="isTimeUnit(metricUnit(addingMetric))"
              v-model="newEntry.value"
            />
            <input v-else v-model.number="newEntry.value" type="number" />
          </label>
          <label>
            Date
            <input v-model="newEntry.entryDate" type="date" />
          </label>
          <label>
            Description (optional)
            <input v-model="newEntry.description" type="text" />
          </label>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showAddDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="submitNewEntry">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: conferma cancellazione -->
    <v-dialog v-model="showDeleteDialog" max-width="340">
      <v-card>
        <v-card-title>Delete this record?</v-card-title>
        <v-card-text>This action cannot be undone.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="performDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const records = ref<Record<string, any[]>>({});
const errorMessage = ref("");

const categories = [
  { key: "short_power", label: "Short Power Efforts" },
  { key: "mid_power", label: "Mid Power Efforts" },
  { key: "long_power", label: "Long Power Efforts" },
  { key: "other", label: "Other Records" },
];

const metricsByCategory = computed(() => {
  const grouped: Record<string, typeof RECORD_METRICS> = {};
  for (const cat of categories) {
    grouped[cat.key] = RECORD_METRICS.filter((m) => m.category === cat.key);
  }
  return grouped;
});

function metricLabel(key: string | null) {
  return RECORD_METRICS.find((m) => m.key === key)?.label ?? key ?? "";
}
function metricUnit(key: string | null) {
  return RECORD_METRICS.find((m) => m.key === key)?.unit ?? "";
}
function formatDateDisplay(date: string) {
  return new Date(date).toLocaleDateString();
}
function formatDateForInput(date: string) {
  return new Date(date).toISOString().split("T")[0];
}

async function fetchRecords() {
  records.value = await $fetch("/api/records");
}
onMounted(fetchRecords);

// --- Edit inline (matita → spunta) ---
const editingKey = ref<string | null>(null); // formato "metricKey:rank"
const draft = reactive({ value: 0, entryDate: "", description: "" });

function isEditing(metricKey: string, rank: number) {
  return editingKey.value === `${metricKey}:${rank}`;
}

function startEdit(metricKey: string, entry: any) {
  editingKey.value = `${metricKey}:${entry.rank}`;
  draft.value = entry.value;
  draft.entryDate = formatDateForInput(entry.entryDate);
  draft.description = entry.description || "";
}

async function saveEdit(metricKey: string, rank: number) {
  errorMessage.value = "";

  try {
    await $fetch("/api/records", {
      method: "POST",
      body: {
        metricKey,
        rank,
        value: draft.value,
        entryDate: draft.entryDate,
        description: draft.description || null,
      },
    });

    editingKey.value = null;
    await fetchRecords();
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || "Something went wrong while saving";
    console.error("Validation details:", err?.data?.data);
  }
}

// --- Aggiunta nuova performance ---
const showAddDialog = ref(false);
const addingMetric = ref<string | null>(null);
const newEntry = ref({ value: 0, entryDate: "", description: "" });

function openAddForm(metricKey: string) {
  addingMetric.value = metricKey;
  newEntry.value = {
    value: 0,
    entryDate: new Date().toISOString().split("T")[0],
    description: "",
  };
  showAddDialog.value = true;
}

async function submitNewEntry() {
  if (!addingMetric.value || !newEntry.value.entryDate) return;

  errorMessage.value = "";

  try {
    await $fetch("/api/records", {
      method: "POST",
      body: {
        metricKey: addingMetric.value,
        value: newEntry.value.value,
        entryDate: newEntry.value.entryDate,
        description: newEntry.value.description || null,
      },
    });

    showAddDialog.value = false;
    await fetchRecords();
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || "Something went wrong while saving";
    console.error("Validation details:", err?.data?.data);
  }
}

// --- Cancellazione con conferma ---
const showDeleteDialog = ref(false);
const pendingDelete = ref<{ metricKey: string; rank: number } | null>(null);

function confirmDelete(metricKey: string, rank: number) {
  pendingDelete.value = { metricKey, rank };
  showDeleteDialog.value = true;
}

async function performDelete() {
  if (!pendingDelete.value) return;

  errorMessage.value = "";

  try {
    await $fetch(
      `/api/records/${pendingDelete.value.metricKey}/${pendingDelete.value.rank}`,
      { method: "DELETE" },
    );

    showDeleteDialog.value = false;
    pendingDelete.value = null;
    await fetchRecords();
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || "Something went wrong while deleting";
    showDeleteDialog.value = false;
  }
}
</script>

<style scoped>
.records-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
}
.subtitle {
  color: var(--text-muted);
  margin-bottom: 32px;
}

.category-section {
  margin-bottom: 40px;
}
.category-section h2 {
  font-size: 16px;
  margin-bottom: 16px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.metric-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
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
  font-family: monospace;
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

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 8px;
}
.dialog-form label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted);
}
.dialog-form input {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
}
.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 20px;
}
</style>
