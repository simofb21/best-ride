<template>
  <div class="card full-width">
    <div class="card-header">
      <h2>Personal info</h2>
      <button v-if="!isEditing" class="icon-btn" @click="startEdit">
        <v-icon icon="mdi-pencil-outline" size="18" />
      </button>
      <button v-else class="icon-btn save-icon" @click="saveProfile">
        <v-icon icon="mdi-check" size="20" />
      </button>
    </div>

    <div class="info-row">
      <span>First name</span>
      <strong v-if="!isEditing">{{ profile.firstName }}</strong>
      <input v-else v-model="draft.firstName" type="text" class="edit-input" />
    </div>

    <div class="info-row">
      <span>Last name</span>
      <strong v-if="!isEditing">{{ profile.lastName }}</strong>
      <input v-else v-model="draft.lastName" type="text" class="edit-input" />
    </div>

    <div class="info-row">
      <span>Weight</span>
      <strong v-if="!isEditing">
        {{ profile.weightKg }} <small>kg</small>
      </strong>
      <input
        v-else
        v-model.number="draft.weightKg"
        type="number"
        step="0.1"
        class="edit-input"
      />
    </div>

    <div class="info-row">
      <span>Sex</span>
      <strong v-if="!isEditing">
        {{
          profile.sex === "M" ? "Male" : profile.sex === "F" ? "Female" : "—"
        }}
      </strong>
      <select v-else v-model="draft.sex" class="edit-input">
        <option :value="null">Prefer not to say</option>
        <option value="M">Male</option>
        <option value="F">Female</option>
      </select>
    </div>

    <div class="info-row">
      <span>Date of Birth</span>
      <strong v-if="!isEditing">
        {{
          profile.dateOfBirth
            ? new Date(profile.dateOfBirth).toLocaleDateString()
            : "—"
        }}
      </strong>
      <input
        v-else
        v-model="draft.dateOfBirth"
        type="date"
        class="edit-input"
      />
    </div>

    <div class="info-row">
      <span>FTP</span>
      <strong v-if="!isEditing">{{ profile.ftp }} <small>W</small></strong>
      <input
        v-else
        v-model.number="draft.ftp"
        type="number"
        class="edit-input"
      />
    </div>

    <div class="info-row">
      <span>Anaerobic Threshold</span>
      <strong v-if="!isEditing">
        {{ profile.anaerobicThreshold }} <small>bpm</small>
      </strong>
      <input
        v-else
        v-model.number="draft.anaerobicThreshold"
        type="number"
        class="edit-input"
      />
    </div>

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
import { ref, reactive } from "vue";

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
const draft = reactive({
  firstName: "",
  lastName: "",
  weightKg: 0,
  ftp: 0,
  anaerobicThreshold: 0,
  sex: null as string | null,
  dateOfBirth: null as string | null,
});

function startEdit() {
  draft.firstName = props.profile.firstName;
  draft.lastName = props.profile.lastName;
  draft.weightKg = props.profile.weightKg ?? 0;
  draft.ftp = props.profile.ftp ?? 0;
  draft.anaerobicThreshold = props.profile.anaerobicThreshold ?? 0;
  draft.sex = props.profile.sex;
  draft.dateOfBirth = props.profile.dateOfBirth;
  isEditing.value = true;
}

function saveProfile() {
  emit("update", { ...draft });
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

.icon-btn {
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
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

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
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

.edit-input {
  border: 1px solid var(--accent);
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 13px;
  background: var(--bg);
  color: var(--text);
  width: 140px;
  text-align: right;
}
</style>
