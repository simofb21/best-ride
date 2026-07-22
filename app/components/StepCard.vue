<template>
  <div class="step-card">
    <v-icon :icon="icon" size="30" />
    <h3>{{ title }}</h3>
    <p><slot /></p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  title: string;
}>();
</script>

<style scoped>
.step-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.step-card .v-icon {
  color: var(--accent-strong);
  margin-bottom: 4px;
}
.step-card h3 {
  margin: 0;
  font-size: 15px;
  color: var(--text);
}
.step-card p {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}
</style>
