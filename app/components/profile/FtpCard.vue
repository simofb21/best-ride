<template>
  <div v-if="wkg" class="card ftp-card">
    <div class="wkg-hero">
      <span class="wkg-unit">Your FTP is </span>
      <span class="wkg-value"> {{ wkg.toFixed(2) }}</span>
      <span class="wkg-unit">W/kg</span>
    </div>
    <p v-if="ftpMessage" class="ftp-message">{{ ftpMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  ftp: number | null;
  weightKg: number | null;
}>();

const wkg = computed(() => {
  if (!props.ftp || !props.weightKg) return null;
  return props.ftp / props.weightKg;
});

const ftpMessage = computed(() => {
  if (wkg.value == null) return "";
  return getFtpMessage(wkg.value);
});
</script>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px;
}

.ftp-card {
  text-align: center;
  border-color: var(--accent);
  background: var(--accent-soft);
  width: 100%;
}

.wkg-hero {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  margin-bottom: 10px;
}

.wkg-value {
  font-family: var(--mono);
  font-size: 40px;
  font-weight: 800;
  color: var(--accent-strong);
}

.wkg-unit {
  font-size: 14px;
  color: var(--text-muted);
}

.ftp-message {
  margin: 0;
  font-size: 14px;
  color: var(--text);
}
</style>
