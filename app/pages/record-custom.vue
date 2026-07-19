<template>
  <div class="custom-records-page">
    <h1>Custom Records</h1>
    <p class="subtitle">
      Create your own records and track up to 3 best performances for each.
    </p>

    <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>

    <button class="create-btn" @click="openCreateForm">
      <v-icon icon="mdi-plus" size="16" />
      New custom record
    </button>

    <div class="custom-records-grid">
      <div v-for="record in customRecords" :key="record.id" class="metric-card">
        <div class="metric-header">
          <span class="metric-label">{{ record.label }}</span>
          <div class="header-actions">
            <span class="metric-unit">{{ record.unit }}</span>
            <button
              class="icon-btn delete-icon"
              @click="confirmDeleteRecord(record.id)"
            >
              <v-icon icon="mdi-trash-can-outline" size="16" />
            </button>
          </div>
        </div>

        <div class="entries">
          <div
            v-for="(entry, index) in record.entries"
            :key="index"
            class="entry-row"
          >
            <span class="rank-badge">#{{ index + 1 }}</span>

            <template v-if="!isEditing(record.id, index + 1)">
              <span class="value-display">{{ entry.value }}</span>
              <span class="date-display">{{
                formatDateDisplay(entry.date)
              }}</span>
              <span class="description-display">{{
                entry.description || "—"
              }}</span>
            </template>

            <template v-else>
              <input
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
                v-if="!isEditing(record.id, index + 1)"
                class="icon-btn"
                @click="startEdit(record.id, index + 1, entry)"
              >
                <v-icon icon="mdi-pencil-outline" size="17" />
              </button>
              <button
                v-else
                class="icon-btn save-icon"
                @click="saveEdit(record.id, index + 1)"
              >
                <v-icon icon="mdi-check" size="18" />
              </button>

              <button
                class="icon-btn delete-icon"
                @click="confirmDeleteEntry(record.id, index + 1)"
              >
                <v-icon icon="mdi-delete-outline" size="17" />
              </button>
            </div>
          </div>

          <button
            v-if="(record.entries?.length || 0) < 3"
            class="add-btn"
            @click="openAddEntryForm(record.id)"
          >
            <v-icon icon="mdi-plus" size="16" />
            Add performance
          </button>
        </div>
      </div>
    </div>

    <!-- Dialog: crea nuovo record custom -->
    <v-dialog v-model="showCreateDialog" max-width="360">
      <v-card>
        <v-card-title>New custom record</v-card-title>
        <v-card-text class="dialog-form">
          <label>
            Name
            <input
              v-model="newRecord.label"
              type="text"
              placeholder="e.g. Stelvio Climb"
            />
          </label>
          <label>
            Unit
            <input
              v-model="newRecord.unit"
              type="text"
              placeholder="e.g. min, km/h, points"
            />
          </label>
          <label class="toggle-label">
            <input type="checkbox" v-model="newRecord.lowerIsBetter" />
            Lower value is better (e.g. race times)
          </label>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="submitNewRecord">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: aggiungi nuova performance a un record esistente -->
    <v-dialog v-model="showAddEntryDialog" max-width="360">
      <v-card>
        <v-card-title>New performance</v-card-title>
        <v-card-text class="dialog-form">
          <label>
            Value
            <input v-model.number="newEntry.value" type="number" />
          </label>
          <label>
            Date
            <input v-model="newEntry.date" type="date" />
          </label>
          <label>
            Description (optional)
            <input v-model="newEntry.description" type="text" />
          </label>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showAddEntryDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="primary" @click="submitNewEntry">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: conferma cancellazione entry -->
    <v-dialog v-model="showDeleteEntryDialog" max-width="340">
      <v-card>
        <v-card-title>Delete this performance?</v-card-title>
        <v-card-text>This action cannot be undone.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteEntryDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="error" @click="performDeleteEntry">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: conferma cancellazione intero record -->
    <v-dialog v-model="showDeleteRecordDialog" max-width="340">
      <v-card>
        <v-card-title>Delete this record?</v-card-title>
        <v-card-text
          >All performances for this record will be permanently
          deleted.</v-card-text
        >
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteRecordDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="error" @click="performDeleteRecord">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });

interface CustomRecordEntry {
  value: number;
  date: string;
  description?: string | null;
}

interface CustomRecordItem {
  id: number;
  label: string;
  unit: string;
  lowerIsBetter: boolean;
  entries: CustomRecordEntry[];
}

const customRecords = ref<CustomRecordItem[]>([]);
const errorMessage = ref("");

function formatDateDisplay(date: string) {
  return new Date(date).toLocaleDateString();
}
function formatDateForInput(date: string) {
  return new Date(date).toISOString().split("T")[0];
}

async function fetchCustomRecords() {
  customRecords.value = await $fetch("/api/custom-records");
}
onMounted(fetchCustomRecords);

// --- Creazione nuovo record custom ---
const showCreateDialog = ref(false);
const newRecord = ref({ label: "", unit: "", lowerIsBetter: false });

function openCreateForm() {
  newRecord.value = { label: "", unit: "", lowerIsBetter: false };
  showCreateDialog.value = true;
}

async function submitNewRecord() {
  if (!newRecord.value.label || !newRecord.value.unit) return;

  errorMessage.value = "";
  try {
    await $fetch("/api/custom-records", {
      method: "POST",
      body: newRecord.value,
    });
    showCreateDialog.value = false;
    await fetchCustomRecords();
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || "Something went wrong while creating the record";
  }
}

// --- Edit inline di un'entry esistente ---
const editingKey = ref<string | null>(null); // formato "recordId:rank"
const draft = reactive({ value: 0, date: "", description: "" });

function isEditing(recordId: number, rank: number) {
  return editingKey.value === `${recordId}:${rank}`;
}

function startEdit(recordId: number, rank: number, entry: CustomRecordEntry) {
  editingKey.value = `${recordId}:${rank}`;
  draft.value = entry.value;
  draft.date = formatDateForInput(entry.date);
  draft.description = entry.description || "";
}

async function saveEdit(recordId: number, rank: number) {
  errorMessage.value = "";
  try {
    await $fetch(`/api/custom-records/${recordId}`, {
      method: "PATCH",
      body: {
        rank,
        value: draft.value,
        date: draft.date,
        description: draft.description || null,
      },
    });
    editingKey.value = null;
    await fetchCustomRecords();
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || "Something went wrong while saving";
  }
}

// --- Aggiunta nuova performance ---
const showAddEntryDialog = ref(false);
const addingRecordId = ref<number | null>(null);
const newEntry = ref({
  value: null as number | null,
  date: "",
  description: "",
});

function openAddEntryForm(recordId: number) {
  addingRecordId.value = recordId;
  newEntry.value = {
    value: null,
    date: new Date().toISOString().split("T")[0],
    description: "",
  };
  showAddEntryDialog.value = true;
}

async function submitNewEntry() {
  if (
    !addingRecordId.value ||
    newEntry.value.value == null ||
    !newEntry.value.date
  )
    return;

  errorMessage.value = "";
  try {
    await $fetch(`/api/custom-records/${addingRecordId.value}`, {
      method: "PATCH",
      body: {
        value: newEntry.value.value,
        date: newEntry.value.date,
        description: newEntry.value.description || null,
      },
    });
    showAddEntryDialog.value = false;
    await fetchCustomRecords();
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || "Something went wrong while saving";
  }
}

// --- Cancellazione singola entry ---
const showDeleteEntryDialog = ref(false);
const pendingDeleteEntry = ref<{ recordId: number; rank: number } | null>(null);

function confirmDeleteEntry(recordId: number, rank: number) {
  pendingDeleteEntry.value = { recordId, rank };
  showDeleteEntryDialog.value = true;
}

async function performDeleteEntry() {
  if (!pendingDeleteEntry.value) return;

  errorMessage.value = "";
  try {
    await $fetch(
      `/api/custom-records/${pendingDeleteEntry.value.recordId}/entries/${pendingDeleteEntry.value.rank}`,
      { method: "DELETE" },
    );
    showDeleteEntryDialog.value = false;
    pendingDeleteEntry.value = null;
    await fetchCustomRecords();
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || "Something went wrong while deleting";
    showDeleteEntryDialog.value = false;
  }
}

// --- Cancellazione intero record custom ---
const showDeleteRecordDialog = ref(false);
const pendingDeleteRecordId = ref<number | null>(null);

function confirmDeleteRecord(recordId: number) {
  pendingDeleteRecordId.value = recordId;
  showDeleteRecordDialog.value = true;
}

async function performDeleteRecord() {
  if (!pendingDeleteRecordId.value) return;

  errorMessage.value = "";
  try {
    await $fetch(`/api/custom-records/${pendingDeleteRecordId.value}`, {
      method: "DELETE",
    });
    showDeleteRecordDialog.value = false;
    pendingDeleteRecordId.value = null;
    await fetchCustomRecords();
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || "Something went wrong while deleting";
    showDeleteRecordDialog.value = false;
  }
}
</script>

<style scoped>
/* Stile minimo per ora, lo rifiniamo insieme dopo */
.custom-records-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
}
.subtitle {
  color: var(--text-muted);
  margin-bottom: 20px;
}
.create-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 24px;
}
.custom-records-grid {
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
.toggle-label {
  flex-direction: row !important;
  align-items: center;
  gap: 8px !important;
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
