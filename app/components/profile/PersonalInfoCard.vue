<template>
  <div class="card full-width">
    <div class="card-header">
      <h2>Personal info</h2>
      <v-btn
        v-if="!isEditing"
        icon="mdi-pencil-outline"
        size="small"
        variant="text"
        color="grey-darken-1"
        @click="startEdit"
      />
      <v-btn
        v-else
        icon="mdi-check"
        size="small"
        variant="text"
        color="primary"
        @click="saveProfile"
      />
    </div>

    <!-- First Name -->
    <div class="info-row">
      <span>First name</span>
      <strong v-if="!isEditing">{{ profile.firstName }}</strong>
      <v-text-field
        v-else
        v-model="draft.firstName"
        density="compact"
        variant="outlined"
        hide-details
        class="edit-field"
      />
    </div>

    <!-- Last Name -->
    <div class="info-row">
      <span>Last name</span>
      <strong v-if="!isEditing">{{ profile.lastName }}</strong>
      <v-text-field
        v-else
        v-model="draft.lastName"
        density="compact"
        variant="outlined"
        hide-details
        class="edit-field"
      />
    </div>

    <!-- Weight -->
    <div class="info-row">
      <span>Weight</span>
      <strong v-if="!isEditing">
        {{ profile.weightKg }} <small>kg</small>
      </strong>
      <v-text-field
        v-else
        v-model.number="draft.weightKg"
        type="number"
        step="0.1"
        suffix="kg"
        density="compact"
        variant="outlined"
        hide-details
        class="edit-field"
      />
    </div>

    <!-- Sex -->
    <div class="info-row">
      <span>Sex</span>
      <strong v-if="!isEditing">
        {{
          profile.sex === "M" ? "Male" : profile.sex === "F" ? "Female" : "—"
        }}
      </strong>
      <v-select
        v-else
        v-model="draft.sex"
        :items="sexOptions"
        item-title="title"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        class="edit-field"
      />
    </div>

    <!-- Date of Birth -->
    <div class="info-row">
      <span>Date of Birth</span>
      <strong v-if="!isEditing">
        {{
          profile.dateOfBirth
            ? new Date(profile.dateOfBirth).toLocaleDateString()
            : "—"
        }}
      </strong>
      <v-menu v-else :close-on-content-click="false">
        <template #activator="{ props: menuProps }">
          <v-text-field
            v-bind="menuProps"
            :model-value="formattedDateOfBirth"
            prepend-inner-icon="mdi-calendar"
            readonly
            density="compact"
            variant="outlined"
            hide-details
            class="edit-field"
          />
        </template>

        <v-date-picker
          v-model="draft.dateOfBirth"
          hide-header
          color="primary"
        />
      </v-menu>
    </div>

    <!-- FTP -->
    <div class="info-row">
      <span>FTP</span>
      <strong v-if="!isEditing">{{ profile.ftp }} <small>W</small></strong>
      <v-text-field
        v-else
        v-model.number="draft.ftp"
        type="number"
        suffix="W"
        density="compact"
        variant="outlined"
        hide-details
        class="edit-field"
      />
    </div>

    <!-- Anaerobic Threshold -->
    <div class="info-row">
      <span>Anaerobic Threshold</span>
      <strong v-if="!isEditing">
        {{ profile.anaerobicThreshold }} <small>bpm</small>
      </strong>
      <v-text-field
        v-else
        v-model.number="draft.anaerobicThreshold"
        type="number"
        suffix="bpm"
        density="compact"
        variant="outlined"
        hide-details
        class="edit-field"
      />
    </div>

    <!-- Readonly Stats -->
    <div class="info-row">
      <span>Distance this year</span>
      <strong>{{ profile.yearlyDistanceKm }} <small>km</small></strong>
    </div>

    <div class="info-row">
      <span>Hours this year</span>
      <strong>{{ profile.yearlyHours }} <small>h</small></strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";

export interface ProfileData {
  firstName: string;
  lastName: string;
  weightKg: number | null;
  ftp: number | null;
  anaerobicThreshold: number | null;
  yearlyDistanceKm: number | null;
  yearlyHours: number | null;
  sex: string | null;
  dateOfBirth: string | null;
}

const props = defineProps<{
  profile: ProfileData;
}>();

const emit = defineEmits<{
  (e: "update", updatedProfile: Partial<ProfileData>): void;
}>();

const isEditing = ref(false);

// Opzioni per la selezione del sesso
const sexOptions = [
  { title: "Prefer not to say", value: null },
  { title: "Male", value: "M" },
  { title: "Female", value: "F" },
];

const draft = reactive({
  firstName: "",
  lastName: "",
  weightKg: 0,
  ftp: 0,
  anaerobicThreshold: 0,
  sex: null as string | null,
  dateOfBirth: null as Date | null, // v-date-picker richiede un oggetto Date
});

function startEdit() {
  draft.firstName = props.profile.firstName;
  draft.lastName = props.profile.lastName;
  draft.weightKg = props.profile.weightKg ?? 0;
  draft.ftp = props.profile.ftp ?? 0;
  draft.anaerobicThreshold = props.profile.anaerobicThreshold ?? 0;
  draft.sex = props.profile.sex;

  // Convertiamo la stringa proveniente dalle props in oggetto Date
  draft.dateOfBirth = props.profile.dateOfBirth
    ? new Date(props.profile.dateOfBirth)
    : null;

  isEditing.value = true;
}

// Computed per mostrare la data formattata nel v-text-field
const formattedDateOfBirth = computed(() => {
  if (!draft.dateOfBirth) return "";
  const d = new Date(draft.dateOfBirth);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
});

function saveProfile() {
  // Riconvertiamo l'oggetto Date in formato stringa YYYY-MM-DD prima di inviare
  const payload = {
    ...draft,
    dateOfBirth: draft.dateOfBirth
      ? new Date(draft.dateOfBirth).toISOString().split("T")[0]
      : null,
  };

  emit("update", payload);
  isEditing.value = false;
}
</script>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-header h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 48px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
  color: var(--text-muted);
}

.info-row:last-child {
  border-bottom: none;
}

.info-row strong {
  color: var(--text);
  font-weight: 600;
}

.info-row strong small {
  color: var(--text-muted);
  font-weight: 500;
}

/* Dimensione contenuta per gli input di Vuetify nelle righe */
.edit-field {
  max-width: 180px;
  background-color: white;
}
</style>
