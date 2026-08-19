<template>
  <div class="share-activity-container" data-export-ignore>
    <div class="share-buttons flex gap-2">
      <!-- Bottone Social Instagram Story -->
      <button
        @click="handleSocialShare"
        :disabled="loading"
        class="btn btn-primary"
      >
        <span>📸 Share for Social</span>
      </button>

      <!-- Bottone / Dropdown Coach Share -->
      <div class="dropdown dropdown-end">
        <button :disabled="loading" class="btn btn-secondary dropdown-toggle">
          <span>📋 Share for Coach</span>
        </button>
        <ul class="dropdown-menu">
          <li>
            <a @click="handleCoachShare('png')">🖼️ Scarica Immagine (.png)</a>
          </li>
          <li>
            <a @click="handleCoachShare('pdf')">📄 Scarica Report (.pdf)</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  generateSocialImage,
  generateCoachImage,
  generateCoachPdf,
} from "~/composables/imageGen";

const props = defineProps<{
  activityData: {
    activity: any;
    training_load?: any;
    power_records?: any;
    gpsTrack?: Array<[number, number]> | Array<{ lat: number; lng: number }>;
  };
  pageElement?: HTMLElement | null;
}>();

const { locale } = useI18n();
const loading = ref(false);

const handleSocialShare = async () => {
  try {
    loading.value = true;
    await generateSocialImage(
      props.activityData.activity,
      props.activityData.gpsTrack,
      locale.value,
    );
  } catch (err) {
    console.error("Errore generazione Social Image:", err);
  } finally {
    loading.value = false;
  }
};

const handleCoachShare = async (format: "png" | "pdf") => {
  try {
    loading.value = true;
    if (format === "png") {
      await generateCoachImage();
    } else {
      await generateCoachPdf(
        props.activityData.activity?.name || "activity-report",
      );
    }
  } catch (err) {
    console.error("Errore generazione Coach Report:", err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.share-activity-container {
  grid-column: 1 / -1;
  margin-bottom: 1rem;
}
</style>
