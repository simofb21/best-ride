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
import { generateSocialImage, generateCoachImage } from "~/composable/imageGen";
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
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.error("Errore generazione immagine:", err);
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
