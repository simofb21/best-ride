<template>
  <div class="time-input">
    <div class="time-field">
      <input type="number" min="0" v-model.number="hours" placeholder="0" />
      <span class="unit-label">h</span>
    </div>
    <span class="separator">:</span>
    <div class="time-field">
      <input
        type="number"
        min="0"
        max="59"
        v-model.number="minutes"
        placeholder="0"
      />
      <span class="unit-label">m</span>
    </div>
    <span class="separator">:</span>
    <div class="time-field">
      <input
        type="number"
        min="0"
        max="59"
        v-model.number="seconds"
        placeholder="0"
      />
      <span class="unit-label">s</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: number }>();
const emit = defineEmits<{ (e: "update:modelValue", value: number): void }>();

const hours = computed({
  get: () => Math.floor(props.modelValue / 3600),
  set: (v) => emitTotal(v, minutes.value, seconds.value),
});
const minutes = computed({
  get: () => Math.floor((props.modelValue % 3600) / 60),
  set: (v) => emitTotal(hours.value, v, seconds.value),
});
const seconds = computed({
  get: () => Math.round(props.modelValue % 60),
  set: (v) => emitTotal(hours.value, minutes.value, v),
});

function emitTotal(h: number, m: number, s: number) {
  emit("update:modelValue", hmsToSeconds(h, m, s));
}
</script>

<style scoped>
.time-input {
  display: flex;
  align-items: center;
  gap: 4px;
}
.time-field {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  overflow: hidden;
}
.time-field input {
  width: 44px;
  padding: 5px 4px 5px 8px;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 12px;
  text-align: right;
}
.time-field input:focus {
  outline: none;
}
.unit-label {
  color: var(--text-muted);
  font-size: 11px;
  padding-right: 6px;
}
.separator {
  color: var(--text-muted);
  font-size: 12px;
}
</style>
