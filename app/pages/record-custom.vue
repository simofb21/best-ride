<!-- app/pages/records-custom.vue -->
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
      <RecordMetricCard
        v-for="record in customRecords"
        :key="record.id"
        :label="record.label"
        :unit="record.unit"
        :entries="record.entries"
        :deletable="true"
        @save-entry="(rank, entry) => saveEntry(record.id, rank, entry)"
        @add-entry="() => openAddEntryForm(record.id, record.unit)"
        @delete-entry="(rank) => confirmDeleteEntry(record.id, rank)"
        @delete-record="() => confirmDeleteRecord(record.id)"
      />
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
            Type
            <select v-model="newRecord.unitType" @change="onUnitTypeChange">
              <option
                v-for="opt in UNIT_TYPE_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </label>

          <label v-if="newRecord.unitType === 'other'">
            Custom unit (max 20 characters)
            <input
              v-model="newRecord.customUnit"
              type="text"
              maxlength="20"
              placeholder="e.g. points, reps"
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
            <TimeInput
              v-if="isTimeUnit(addingRecordUnit)"
              v-model="newEntry.value"
            />
            <input v-else v-model.number="newEntry.value" type="number" />
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

async function fetchCustomRecords() {
  customRecords.value = await $fetch("/api/custom-records");
}
onMounted(fetchCustomRecords);

// --- Creazione nuovo record custom ---
const showCreateDialog = ref(false);
const newRecord = ref({
  label: "",
  unitType: "time" as string,
  customUnit: "",
  lowerIsBetter: true,
});

function onUnitTypeChange() {
  const typeConfig = UNIT_TYPE_OPTIONS.find(
    (t) => t.value === newRecord.value.unitType,
  );
  newRecord.value.lowerIsBetter = typeConfig?.lowerIsBetterDefault ?? false;
}

function openCreateForm() {
  newRecord.value = {
    label: "",
    unitType: "time",
    customUnit: "",
    lowerIsBetter: true,
  };
  showCreateDialog.value = true;
}

async function submitNewRecord() {
  if (!newRecord.value.label.trim()) return;

  if (
    newRecord.value.unitType === "other" &&
    !newRecord.value.customUnit.trim()
  ) {
    errorMessage.value = "Please specify the custom unit";
    return;
  }

  errorMessage.value = "";
  try {
    await $fetch("/api/custom-records", {
      method: "POST",
      body: {
        ...newRecord.value,
        label: newRecord.value.label.trim(),
        customUnit: newRecord.value.customUnit.trim(),
      },
    });
    showCreateDialog.value = false;
    await fetchCustomRecords();
  } catch (err: any) {
    errorMessage.value = err?.data?.message || "Something went wrong";
  }
}

// --- Salvataggio entry (creazione o modifica), delegato dal componente ---
async function saveEntry(
  recordId: number,
  rank: number,
  entry: CustomRecordEntry,
) {
  errorMessage.value = "";
  try {
    await $fetch(`/api/custom-records/${recordId}`, {
      method: "PATCH",
      body: {
        rank,
        value: entry.value,
        date: entry.date,
        description: entry.description,
      },
    });
    await fetchCustomRecords();
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || "Something went wrong while saving";
  }
}

// --- Aggiunta nuova performance ---
const showAddEntryDialog = ref(false);
const addingRecordId = ref<number | null>(null);
const addingRecordUnit = ref<string>("");
const newEntry = ref({ value: 0, date: "", description: "" });

function openAddEntryForm(recordId: number, unit: string) {
  addingRecordId.value = recordId;
  addingRecordUnit.value = unit;
  newEntry.value = {
    value: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
  };
  showAddEntryDialog.value = true;
}

async function submitNewEntry() {
  if (!addingRecordId.value || !newEntry.value.date) return;

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
.custom-records-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
}
.custom-records-page h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
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
.dialog-form input,
.dialog-form select {
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
