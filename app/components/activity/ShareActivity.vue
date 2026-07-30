<template>
  <div class="share-section">
    <button
      class="share-btn coach"
      :disabled="generating"
      @click="handleShare('coach')"
    >
      <v-icon icon="mdi-account-tie-outline" size="18" />
      {{ generating === "coach" ? "Generating..." : "Share for Coach" }}
    </button>

    <button
      class="share-btn social"
      :disabled="generating"
      @click="handleShare('social')"
    >
      <v-icon icon="mdi-instagram" size="18" />
      {{ generating === "social" ? "Generating..." : "Share for Social" }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  activityData: {
    activity: any;
    training_load?: any;
    power_records: any[];
  };
}>();
import {
  generateCoachImage,
  generateSocialImage,
} from "../../composable/imageGen";
const generating = ref<"coach" | "social" | null>(null);

async function handleShare(variant: "coach" | "social") {
  generating.value = variant;

  try {
    const blob =
      variant === "coach"
        ? await generateCoachImage(props.activityData)
        : await generateSocialImage(props.activityData);

    const filename =
      variant === "coach" ? "ride-report-coach.png" : "ride-summary-social.png";
    const file = new File([blob], filename, { type: "image/png" });

    // Su mobile con supporto Web Share API: apre il menu nativo di condivisione
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        files: [file],
        title: variant === "coach" ? "Ride Report" : "Ride Summary",
      });
    } else {
      // Fallback desktop: scarica direttamente il file
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.error("Errore nella generazione/condivisione immagine:", err);
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
