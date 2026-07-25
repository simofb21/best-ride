<template>
  <div class="records-page">
    <h1>My Records</h1>
    <p class="subtitle">
      Fill in your records manually, or let them be set automatically when you
      upload an activity.
    </p>

    <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>

    <RecordCategorySection
      title="General"
      :metrics="metricsByCategory.general"
      :records="records"
      @save-entry="saveEntry"
      @add-entry="openAddForm"
      @delete-entry="confirmDelete"
    />

    <RecordCategorySection
      title="Power"
      :subcategories="powerSubcategories"
      :records="records"
      @save-entry="saveEntry"
      @add-entry="openAddForm"
      @delete-entry="confirmDelete"
    />

    <RecordCategorySection
      title="Heart Rate"
      :metrics="metricsByCategory.heart_rate"
      :records="records"
      @save-entry="saveEntry"
      @add-entry="openAddForm"
      @delete-entry="confirmDelete"
    />

    <RecordCategorySection
      title="Other"
      :metrics="metricsByCategory.other"
      :records="records"
      @save-entry="saveEntry"
      @add-entry="openAddForm"
      @delete-entry="confirmDelete"
    />

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
import RecordCategorySection from "~/components/records/RecordCategorySection.vue";
import { RECORD_METRICS } from "@/../shared/utils/recordMetric";
import { ref, computed, watch } from "vue";
const records = ref<Record<string, any[]>>({});
const errorMessage = ref("");

const metricsByCategory = computed(() => {
  const grouped: Record<string, typeof RECORD_METRICS> = {};
  for (const cat of ["general", "heart_rate", "other"] as const) {
    grouped[cat] = RECORD_METRICS.filter((m) => m.category === cat);
  }
  return grouped;
});

const powerSubcategories = computed(() => [
  {
    key: "short_power",
    label: "Short",
    metrics: RECORD_METRICS.filter((m) => m.category === "short_power"),
  },
  {
    key: "mid_power",
    label: "Mid",
    metrics: RECORD_METRICS.filter((m) => m.category === "mid_power"),
  },
  {
    key: "long_power",
    label: "Long",
    metrics: RECORD_METRICS.filter((m) => m.category === "long_power"),
  },
]);

function metricLabel(key: string | null) {
  return RECORD_METRICS.find((m) => m.key === key)?.label ?? key ?? "";
}
function metricUnit(key: string | null) {
  return RECORD_METRICS.find((m) => m.key === key)?.unit ?? "";
}

async function fetchRecords() {
  try {
    const rawRecords = await $fetch<Record<string, any[]>>("/api/records");

    // Puliamo e normalizziamo i dati ricevuti dal backend
    const normalized: Record<string, any[]> = {};

    for (const [key, entries] of Object.entries(rawRecords || {})) {
      if (Array.isArray(entries)) {
        normalized[key] = entries.map((entry) => ({
          ...entry,
          // Convertiamo il valore da stringa a numero float/int
          value:
            entry.value !== null && entry.value !== undefined
              ? Number(entry.value)
              : 0,
          // Convertiamo la data da ISO string ("2026-07-23T...") a "2026-07-23"
          entryDate: entry.entryDate ? entry.entryDate.split("T")[0] : "",
          // Garantiamo un campo date standard se usata dai figli
          date: entry.entryDate ? entry.entryDate.split("T")[0] : "",
        }));
      } else {
        normalized[key] = [];
      }
    }

    records.value = normalized;
  } catch (err: any) {
    errorMessage.value = "Impossibile caricare i dati dei record.";
    console.error("Errore nel recupero dei record:", err);
  }
}
onMounted(fetchRecords);

// --- Salvataggio entry (creazione o modifica), delegato dal componente ---
async function saveEntry(
  metricKey: string,
  rank: number,
  entry: { value: number; date: string; description: string | null },
) {
  errorMessage.value = "";
  try {
    await $fetch("/api/records", {
      method: "POST",
      body: {
        metricKey,
        rank,
        value: entry.value,
        entryDate: entry.date,
        description: entry.description,
      },
    });
    await fetchRecords();
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || "Something went wrong while saving";
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
.records-page h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text, #111827);
}
.subtitle {
  color: var(--text-muted);
  margin-bottom: 28px;
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
