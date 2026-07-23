<template>
  <div class="profile-page">
    <h1 class="page-title">My Profile</h1>

    <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>
    <div v-if="loading" class="state-message">Loading...</div>

    <div v-else-if="profile" class="profile-container">
      <!-- ================= DESKTOP LAYOUT ================= -->
      <div class="desktop-layout">
        <!-- 1. Box Personal Info espanso su tutta la larghezza -->
        <PersonalInfoCard :profile="profile" @update="handleProfileSave" />

        <!-- 2. Box W/kg -->
        <FtpCard :ftp="profile.ftp" :weight-kg="profile.weightKg" />

        <!-- 3. Power Profile: Testo a sinistra, Grafico a destra -->
        <div class="card power-profile-wrapper">
          <h2>Power Profile</h2>
          <PowerProfileRadar />
        </div>

        <!-- 4. Zone: Potenza a sinistra, Frequenza Cardiaca a destra -->
        <div class="zones-grid">
          <FtpZones v-if="profile.ftp" :ftp="profile.ftp" />
          <ThresholdZones
            v-if="profile.anaerobicThreshold"
            :threshold="profile.anaerobicThreshold"
          />
        </div>
      </div>

      <!-- ================= MOBILE LAYOUT (ACCORDION RECTANGLES) ================= -->
      <div class="mobile-layout">
        <!-- Rettangolo 1: Personal Info -->
        <div class="mobile-accordion">
          <button class="accordion-header" @click="toggleSection('info')">
            <span>Personal Info</span>
            <v-icon
              :icon="
                activeSection === 'info' ? 'mdi-chevron-up' : 'mdi-chevron-down'
              "
            />
          </button>
          <div v-if="activeSection === 'info'" class="accordion-content">
            <PersonalInfoCard :profile="profile" @update="handleProfileSave" />
          </div>
        </div>

        <!-- Rettangolo 2: Power Profile (Include FTP Card + Radar + Testo) -->
        <div class="mobile-accordion">
          <button
            class="accordion-header"
            @click="toggleSection('powerProfile')"
          >
            <span>Power Profile</span>
            <v-icon
              :icon="
                activeSection === 'powerProfile'
                  ? 'mdi-chevron-up'
                  : 'mdi-chevron-down'
              "
            />
          </button>
          <div
            v-if="activeSection === 'powerProfile'"
            class="accordion-content stack-content"
          >
            <FtpCard :ftp="profile.ftp" :weight-kg="profile.weightKg" />
            <div class="card">
              <PowerProfileRadar />
            </div>
          </div>
        </div>

        <!-- Rettangolo 3: Power Zones -->
        <div class="mobile-accordion">
          <button class="accordion-header" @click="toggleSection('powerZones')">
            <span>Power Zones</span>
            <v-icon
              :icon="
                activeSection === 'powerZones'
                  ? 'mdi-chevron-up'
                  : 'mdi-chevron-down'
              "
            />
          </button>
          <div v-if="activeSection === 'powerZones'" class="accordion-content">
            <FtpZones v-if="profile.ftp" :ftp="profile.ftp" />
          </div>
        </div>

        <!-- Rettangolo 4: Heart Rate Zones -->
        <div class="mobile-accordion">
          <button class="accordion-header" @click="toggleSection('hrZones')">
            <span>Heart Rate Zones</span>
            <v-icon
              :icon="
                activeSection === 'hrZones'
                  ? 'mdi-chevron-up'
                  : 'mdi-chevron-down'
              "
            />
          </button>
          <div v-if="activeSection === 'hrZones'" class="accordion-content">
            <ThresholdZones
              v-if="profile.anaerobicThreshold"
              :threshold="profile.anaerobicThreshold"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import PersonalInfoCard, {
  type ProfileData,
} from "~/components/profile/PersonalInfoCard.vue";
import FtpCard from "~/components/profile/FtpCard.vue";
import PowerProfileRadar from "~/components/profile/PowerProfileRadar.vue";
import FtpZones from "~/components/profile/FtpZones.vue";
import ThresholdZones from "~/components/profile/ThresholdZones.vue";

definePageMeta({ middleware: "auth" });

const profile = ref<ProfileData | null>(null);
const loading = ref(true);
const errorMessage = ref("");

// Stato fisarmonica per Mobile
const activeSection = ref<string | null>("info");

function toggleSection(section: string) {
  activeSection.value = activeSection.value === section ? null : section;
}

onMounted(async () => {
  try {
    profile.value = await $fetch("/api/profile");
  } catch (err: any) {
    errorMessage.value = err?.data?.message || "Error loading profile data";
  } finally {
    loading.value = false;
  }
});

async function handleProfileSave(draftData: Partial<ProfileData>) {
  errorMessage.value = "";
  try {
    profile.value = await $fetch("/api/profile", {
      method: "PATCH",
      body: draftData,
    });
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || "Something went wrong while saving";
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 16px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 24px;
}

.state-message {
  color: var(--text-muted);
  padding: 40px 0;
  text-align: center;
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

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px;
}

.power-profile-wrapper h2 {
  font-size: 16px;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 16px;
}

/* DESKTOP LAYOUT CONFIGURATION */
.desktop-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.zones-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* MOBILE LAYOUT CONFIGURATION */
.mobile-layout {
  display: none;
  flex-direction: column;
  gap: 12px;
}

.mobile-accordion {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  overflow: hidden;
}

.accordion-header {
  width: 100%;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  border: none;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  cursor: pointer;
  text-align: left;
}

.accordion-content {
  padding: 16px;
  border-top: 1px solid var(--border);
}

.stack-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* SWITCH MEDIA QUERIES */
@media (max-width: 768px) {
  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: flex;
  }
}
</style>
