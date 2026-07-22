<template>
  <div class="dashboard">
    <p class="greeting">Welcome back, {{ user?.firstName }}</p>

    <div v-if="loading" class="state-message">Loading your stats...</div>

    <template v-else-if="stats">
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-value"
            >{{ stats.yearlyDistanceKm ?? 0 }}<small>km</small></span
          >
          <span class="stat-label">Ridden this year</span>
        </div>
        <div class="stat-card">
          <span class="stat-value"
            >{{ stats.yearlyHours ?? 0 }}<small>h</small></span
          >
          <span class="stat-label">Hours on the bike</span>
        </div>
        <div class="stat-card accent" v-if="wkg">
          <span class="stat-value"
            >{{ wkg.toFixed(2) }}<small>W/kg</small></span
          >
          <span class="stat-label">Current FTP ratio</span>
        </div>
      </div>

      <p v-if="ftpMessage" class="ftp-message">{{ ftpMessage }}</p>

      <div class="shortcuts">
        <NuxtLink to="/upload" class="shortcut-card">
          <v-icon icon="mdi-cloud-upload-outline" size="26" />
          <span>Upload new activity</span>
        </NuxtLink>
        <NuxtLink to="/activity-info" class="shortcut-card">
          <v-icon icon="mdi-chart-line" size="26" />
          <span>Latest ride</span>
        </NuxtLink>
        <NuxtLink to="/records" class="shortcut-card">
          <v-icon icon="mdi-trophy-outline" size="26" />
          <span>My records</span>
        </NuxtLink>
        <NuxtLink to="/record-custom" class="shortcut-card">
          <v-icon icon="mdi-star-outline" size="26" />
          <span>Custom records</span>
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { user } = useUserSession();

interface ProfileStats {
  weightKg: number | null;
  ftp: number | null;
  yearlyDistanceKm: number | null;
  yearlyHours: number | null;
}

const stats = ref<ProfileStats | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    stats.value = await $fetch("/api/profile");
  } finally {
    loading.value = false;
  }
});

const wkg = computed(() => {
  if (!stats.value?.ftp || !stats.value?.weightKg) return null;
  return stats.value.ftp / stats.value.weightKg;
});

const ftpMessage = computed(() => {
  if (wkg.value == null) return "";
  return getFtpMessage(wkg.value);
});
</script>

<style scoped>
.dashboard {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.greeting {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.state-message {
  color: var(--text-muted);
}

.stats-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px 28px;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stat-card.accent {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.stat-value {
  font-family: var(--mono);
  font-variant-numeric: tabular-nums;
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
}
.stat-card.accent .stat-value {
  color: var(--accent-strong);
}
.stat-value small {
  font-size: 14px;
  color: var(--text-muted);
  margin-left: 4px;
  font-weight: 500;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
}

.ftp-message {
  font-size: 14px;
  color: var(--text-muted);
  max-width: 480px;
}

.shortcuts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 900px;
}

.shortcut-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  transition:
    border-color 0.15s,
    transform 0.15s;
}
.shortcut-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}
.shortcut-card .v-icon {
  color: var(--accent-strong);
}

@media (max-width: 700px) {
  .shortcuts {
    grid-template-columns: repeat(2, 1fr);
  }
  .stats-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
