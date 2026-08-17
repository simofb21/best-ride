<template>
  <div class="complete-profile-page">
    <div class="card">
      <template v-if="!consentGiven">
        <h1>{{ $t("completeProfile.consent.title") }}</h1>
        <p class="intro">{{ $t("completeProfile.consent.intro") }}</p>

        <label class="consent-row">
          <input type="checkbox" v-model="privacyAccepted" />
          <span>
            {{ $t("completeProfile.consent.acceptPrefix") }}
            <NuxtLink to="/privacy-policy" target="_blank"
              >{{ $t("navbar.privacyPolicy") }}</NuxtLink
            >
            {{ $t("completeProfile.consent.acceptSuffix") }}
          </span>
        </label>

        <p v-if="error" class="error">{{ error }}</p>

        <button :disabled="!privacyAccepted || loading" @click="acceptPrivacy">
          {{ loading ? $t("common.saving") : $t("completeProfile.consent.continue") }}
        </button>
      </template>

      <template v-else>
        <h1>{{ $t("completeProfile.form.title") }}</h1>
        <p class="intro">{{ $t("completeProfile.form.intro") }}</p>

        <form @submit.prevent="saveProfile">
          <label>
            {{ $t("completeProfile.form.weight") }}
            <input v-model.number="profile.weightKg" type="number" step="0.1" />
          </label>
          <label>
            FTP (W)
            <input v-model.number="profile.ftp" type="number" />
          </label>
          <label>
            {{ $t("completeProfile.form.threshold") }}
            <input v-model.number="profile.anaerobicThreshold" type="number" />
          </label>
          <label>
            {{ $t("completeProfile.form.birthDate") }}
            <input v-model="profile.dateOfBirth" type="date" />
          </label>
          <label>
            {{ $t("completeProfile.form.sex") }}
            <select v-model="profile.sex">
              <option :value="null">{{ $t("completeProfile.form.unspecified") }}</option>
              <option value="M">{{ $t("completeProfile.form.male") }}</option>
              <option value="F">{{ $t("completeProfile.form.female") }}</option>
            </select>
          </label>
          <label>
            {{ $t("completeProfile.form.yearlyDistance") }}
            <input
              v-model.number="profile.yearlyDistanceKm"
              type="number"
              step="0.1"
            />
          </label>
          <label>
            {{ $t("completeProfile.form.yearlyHours") }}
            <input
              v-model.number="profile.yearlyHours"
              type="number"
              step="0.1"
            />
          </label>
          <p v-if="error" class="error">{{ error }}</p>

          <button type="submit" :disabled="loading">
            {{ loading ? $t("common.saving") : $t("completeProfile.form.finish") }}
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
const { t } = useI18n();
import { onMounted } from "vue";

onMounted(() => {
  document.title = "Complete Profile - Best Ride";
});
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
    error.value = err?.data?.message || t("common.genericError");
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
    error.value = err?.data?.message || t("common.saveError");
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
