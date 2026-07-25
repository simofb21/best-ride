<template>
  <div class="panel" :class="{ 'span-2': fullWidth }">
    <button class="panel-header" @click="isOpen = !isOpen">
      <span class="panel-title">
        <v-icon v-if="icon" :icon="icon" size="18" class="panel-icon" />
        {{ title }}
      </span>
      <v-icon
        class="chevron"
        :icon="isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        size="20"
      />
    </button>

    <div class="panel-body" :class="{ 'is-open': isOpen }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    icon?: string;
    fullWidth?: boolean;
    defaultOpen?: boolean;
  }>(),
  { defaultOpen: true },
);

const isOpen = ref(props.defaultOpen);
</script>

<style scoped>
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
}
.panel.span-2 {
  grid-column: span 2;
}

.panel-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  text-align: left;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.panel-icon {
  color: var(--accent-strong);
}
.chevron {
  color: var(--text-muted);
  flex-shrink: 0;
}

.panel-body {
  padding: 0 20px 20px;
}

@media (min-width: 701px) {
  .chevron {
    display: none;
  }
  .panel-header {
    cursor: default;
  }
}

@media (max-width: 700px) {
  .panel.span-2 {
    grid-column: span 1;
  }
  .panel-body {
    display: none;
  }
  .panel-body.is-open {
    display: block;
  }
}
</style>
