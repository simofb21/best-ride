<template>
  <div class="complete-profile-page">
    <div class="card">
      <template v-if="!consentGiven">
        <h1>Before you continue</h1>
        <p class="intro">
          Best Ride needs to process some personal data (weight, FTP, birth
          date, activity data) to calculate your training metrics and personal
          records.
        </p>

        <label class="consent-row">
          <input type="checkbox" v-model="privacyAccepted" />
          <span>
            I have read and accept the
            <NuxtLink to="/privacy-policy" target="_blank"
              >Privacy Policy</NuxtLink
            >
            and consent to the processing of my personal data as described.
          </span>
        </label>

        <p v-if="error" class="error">{{ error }}</p>

        <button :disabled="!privacyAccepted || loading" @click="acceptPrivacy">
          {{ loading ? "Saving..." : "Accept and continue" }}
        </button>
      </template>

      <template v-else>
        <h1>Complete your profile</h1>
        <p class="intro">
          These details help us calculate your training zones and power profile
          accurately.
        </p>

        <form @submit.prevent="saveProfile">
          <label>
            Weight (kg)
            <input v-model.number="profile.weightKg" type="number" step="0.1" />
          </label>
          <label>
            FTP (W)
            <input v-model.number="profile.ftp" type="number" />
          </label>
          <label>
            Anaerobic Threshold (bpm)
            <input v-model.number="profile.anaerobicThreshold" type="number" />
          </label>
          <label>
            Date of birth
            <input v-model="profile.dateOfBirth" type="date" />
          </label>
          <label>
            Sex
            <select v-model="profile.sex">
              <option :value="null">Prefer not to say</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </label>
          <label>
            Distance ridden this year so far (km)
            <input
              v-model.number="profile.yearlyDistanceKm"
              type="number"
              step="0.1"
            />
          </label>
          <label>
            Hours ridden this year so far
            <input
              v-model.number="profile.yearlyHours"
              type="number"
              step="0.1"
            />
          </label>
          <p v-if="error" class="error">{{ error }}</p>

          <button type="submit" :disabled="loading">
            {{ loading ? "Saving..." : "Finish setup" }}
          </button>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const consentGiven = ref(false);
const privacyAccepted = ref(false);
const loading = ref(false);
const error = ref("");

const profile = ref({
  weightKg: null as number | null,
  ftp: null as number | null,
  anaerobicThreshold: null as number | null,
  dateOfBirth: "",
  sex: null as string | null,
  yearlyDistanceKm: null as number | null,
  yearlyHours: null as number | null,
});

onMounted(async () => {
  const status = await $fetch("/api/profile/consent-status");
  consentGiven.value = status.hasAccepted;
});

async function acceptPrivacy() {
  if (!privacyAccepted.value) return;

  loading.value = true;
  error.value = "";

  try {
    await $fetch("/api/profile/accept-privacy", { method: "POST" });
    consentGiven.value = true;
  } catch (err: any) {
    error.value = err?.data?.message || "Something went wrong";
  } finally {
    loading.value = false;
  }
}

async function saveProfile() {
  loading.value = true;
  error.value = "";

  try {
    await $fetch("/api/profile", {
      method: "PATCH",
      body: profile.value,
    });
    await navigateTo("/");
  } catch (err: any) {
    error.value = err?.data?.message || "Something went wrong while saving";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.complete-profile-page {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 32px;
  width: 100%;
  max-width: 440px;
}
.card h1 {
  margin: 0 0 8px;
  font-size: 20px;
}
.intro {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0 0 20px;
  line-height: 1.5;
}

.consent-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: var(--text);
  line-height: 1.5;
  margin-bottom: 20px;
}
.consent-row input {
  margin-top: 2px;
  flex-shrink: 0;
}
.consent-row a {
  color: var(--accent-strong);
}

form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
}
input,
select {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
}

button {
  margin-top: 8px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  color: #ef4444;
  font-size: 13px;
  margin: 4px 0 0;
}
</style>
