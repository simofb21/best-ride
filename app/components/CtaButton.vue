<template>
  <NuxtLink v-if="to" :to="to" class="cta-btn" :class="{ secondary }">
    <slot />
  </NuxtLink>
  <a v-else-if="href" :href="href" class="cta-btn" :class="{ secondary }">
    <slot />
  </a>
  <button v-else class="cta-btn" :class="{ secondary }" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  to?: string;
  href?: string;
  secondary?: boolean;
}>();

defineEmits<{ (e: "click"): void }>();
</script>

<style scoped>
.cta-btn {
  display: inline-block;
  background: var(--accent);
  color: #fff;
  padding: 14px 32px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  text-align: center;
}
.cta-btn:hover {
  background: var(--accent-strong);
}

.cta-btn.secondary {
  background: transparent;
  color: var(--text-muted);
  padding: 0;
  font-size: 13px;
  font-weight: 500;
  text-decoration: underline;
}
.cta-btn.secondary:hover {
  background: transparent;
  color: var(--accent-strong);
}
</style>
