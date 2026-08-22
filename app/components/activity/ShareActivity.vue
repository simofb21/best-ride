<template>
  <div class="share-activity-container" data-export-ignore>
    <div class="d-flex align-center gap-3 wrap">
      <!-- Bottone Social Instagram Story -->
      <v-btn
        color="primary"
        variant="flat"
        rounded="lg"
        size="large"
        :loading="loading"
        :disabled="loading"
        class="text-none font-weight-bold"
        @click="handleSocialShare"
      >
        <template #prepend>
          <v-icon icon="mdi-instagram" size="20" />
        </template>
        Share for Social
      </v-btn>

      <!-- Dropdown Coach Share -->
      <v-menu location="bottom end" transition="scale-transition">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            color="surface-variant"
            variant="tonal"
            rounded="lg"
            size="large"
            :loading="loading"
            :disabled="loading"
            class="text-none font-weight-bold"
          >
            <template #prepend>
              <v-icon icon="mdi-share-variant-outline" size="20" />
            </template>
            Share for Coach
            <template #append>
              <v-icon icon="mdi-chevron-down" size="18" />
            </template>
          </v-btn>
        </template>

        <v-list
          density="compact"
          rounded="lg"
          elevation="4"
          class="py-1 min-w-200"
        >
          <v-list-item
            value="png"
            class="py-2"
            @click="handleCoachShare('png')"
          >
            <template #prepend>
              <v-icon icon="mdi-file-image-outline" size="20" class="me-2" />
            </template>
            <v-list-item-title class="font-weight-medium">
              Scarica Immagine (.png)
            </v-list-item-title>
          </v-list-item>

          <v-divider class="my-1" />

          <v-list-item
            value="pdf"
            class="py-2"
            @click="handleCoachShare('pdf')"
          >
            <template #prepend>
              <v-icon icon="mdi-file-pdf-box" size="20" class="me-2" />
            </template>
            <v-list-item-title class="font-weight-medium">
              Scarica Report (.pdf)
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
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
      const reportName =
        props.activityData.activity?.title ||
        props.activityData.activity?.name ||
        "activity-report";
      await generateCoachPdf(reportName);
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
  margin-bottom: 1.25rem;
  width: 100%;
}

.gap-3 {
  gap: 12px;
}

.min-w-200 {
  min-width: 200px;
}

/* Modifiche Layout Mobile (< 600px) */
@media (max-width: 600px) {
  .share-activity-container .d-flex {
    flex-direction: column;
    align-items: stretch !important;
    width: 100%;
  }

  /* I bottoni occupano tutta la larghezza */
  .share-activity-container :deep(.v-btn) {
    width: 100%;
    justify-content: center;
  }

  /* Previene che il menu dropdown superi i bordi dello schermo */
  .min-w-200 {
    min-width: auto !important;
    max-width: calc(100vw - 32px);
  }
}
</style>
