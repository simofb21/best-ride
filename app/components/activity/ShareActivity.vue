<template>
  <div class="share-section">
    <button
      class="share-btn social"
      :disabled="!!generating"
      @click="handleShare('social')"
    >
      <v-icon icon="mdi-instagram" size="18" />
      {{ generating === "social" ? "Generating..." : "Share for Social" }}
    </button>

    <button
      class="share-btn coach"
      :disabled="!!generating"
      @click="handleShare('coach')"
    >
      <v-icon icon="mdi-account-tie-outline" size="18" />
      {{ generating === "coach" ? "Generating..." : "Share for Coach" }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { isCancelledAction } from "~/composables/useAppToast";
import { generateSocialImage, generateCoachImage } from "~/composables/imageGen";

const props = defineProps<{
  activityData: {
    activity: any;
    training_load?: any;
    power_records: any[];
    gpsTrack?: Array<{ lat: number; lng: number }>;
  };
  // Riferimento all'elemento della pagina da screenshottare per il report allenatore
  pageElement?: HTMLElement | null;
}>();

const generating = ref<"social" | "coach" | null>(null);
const { t } = useI18n();
const appToast = useAppToast();

async function handleShare(variant: "social" | "coach") {
  generating.value = variant;

  try {
    const blob =
      variant === "social"
        ? await generateSocialImage(props.activityData)
        : await generateCoachImage(
            props.activityData,
            props.pageElement ?? undefined,
          );

    const filename =
      variant === "social"
        ? "best-ride-social.png"
        : "best-ride-coach-report.png";
    const file = new File([blob], filename, { type: "image/png" });

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({ files: [file], title: "Best Ride" });
      appToast.success(t("notifications.activityShared"), {
        toastId: `activity-${variant}-shared`,
      });
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      appToast.success(t("notifications.activityDownloaded"), {
        toastId: `activity-${variant}-downloaded`,
      });
    }
  } catch (err) {
    if (isCancelledAction(err)) return;
    console.error("Errore generazione immagine:", err);
    appToast.error(null, t("notifications.shareFailed"), {
      toastId: `activity-${variant}-share-failed`,
    });
  } finally {
    generating.value = null;
  }
}
</script>

<style scoped>
.share-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.share-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
}
.share-btn:hover:not(:disabled) {
  border-color: var(--accent);
}
.share-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.share-btn.coach {
  border-color: var(--accent);
  color: var(--accent-strong);
}
@media (max-width: 480px) {
  .share-section {
    flex-direction: column;
  }
}
</style>
