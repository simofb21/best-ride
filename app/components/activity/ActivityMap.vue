<template>
  <div class="map-panel">
    <button class="panel-header" @click="toggleMap">
      <span>Route Map</span>
      <v-icon
        class="chevron"
        :icon="isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        size="20"
      />
    </button>

    <div class="panel-body" :class="{ 'is-open': isOpen }">
      <ClientOnly>
        <div v-if="!gpsTrack || !gpsTrack.length" class="no-data">
          No GPS data in this activity
        </div>
        <div v-else ref="mapContainer" class="map-container" />
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import "leaflet/dist/leaflet.css";

const props = defineProps<{
  gpsTrack: Array<{ lat: number; lng: number } | [number, number]>;
}>();

const isOpen = ref(true);
const mapContainer = ref<HTMLElement | null>(null);
let mapInstance: any = null;

const toggleMap = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && mapInstance) {
    setTimeout(() => mapInstance.invalidateSize(), 100);
  }
};

const initMap = async () => {
  if (!props.gpsTrack || !props.gpsTrack.length) return;

  await nextTick();
  if (!mapContainer.value) return;

  const L = await import("leaflet");

  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  // Costante di conversione standard semicircles -> gradi
  const SEMICIRCLES_TO_DEGREES = 180 / Math.pow(2, 31);

  const points: [number, number][] = props.gpsTrack
    .map((p: any) => {
      if (!p) return null;

      let lat = p.lat ?? p.position_lat ?? p[0];
      let lng = p.lng ?? p.position_long ?? p[1];

      if (typeof lat !== "number" || typeof lng !== "number") return null;

      // significa che sono stati divisi per errore per (180 / 2^31). Ristabiliamo i semicircles!
      if (Math.abs(lat) < 0.1 && lat !== 0) {
        lat = lat / SEMICIRCLES_TO_DEGREES;
        lng = lng / SEMICIRCLES_TO_DEGREES;
      }

      // Se i valori sono grandi (Semicircles standard), convertili normalmente in gradi
      if (Math.abs(lat) > 180) {
        lat = lat * SEMICIRCLES_TO_DEGREES;
        lng = lng * SEMICIRCLES_TO_DEGREES;
      }

      // Escludi punti 0,0 invalidi
      if (Math.abs(lat) < 0.001 && Math.abs(lng) < 0.001) return null;

      return [lat, lng] as [number, number];
    })
    .filter((p): p is [number, number] => p !== null);

  if (!points.length) return;

  // Inizializza la mappa sulla prima coordinata
  mapInstance = L.map(mapContainer.value).setView(points[0], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(mapInstance);

  // Se c'è più di un punto, disegna la linea
  if (points.length > 1) {
    const polyline = L.polyline(points, {
      color: "#22c55e",
      weight: 4,
      opacity: 0.8,
    }).addTo(mapInstance);

    // Inquadra tutti i punti sulla mappa con un po' di padding
    mapInstance.fitBounds(polyline.getBounds(), { padding: [30, 30] });

    // Marker di Fine percorso (Rosso)
    L.circleMarker(points[points.length - 1], {
      radius: 6,
      color: "#ef4444",
      fillColor: "#ef4444",
      fillOpacity: 1,
    }).addTo(mapInstance);
  }

  // Marker di Inizio percorso (Verde)
  L.circleMarker(points[0], {
    radius: 6,
    color: "#22c55e",
    fillColor: "#22c55e",
    fillOpacity: 1,
  }).addTo(mapInstance);

  setTimeout(() => {
    mapInstance?.invalidateSize();
  }, 200);
};

onMounted(() => {
  initMap();
});

watch(
  () => props.gpsTrack,
  () => {
    initMap();
  },
  { deep: true },
);
</script>

<style scoped>
.map-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
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
}
.panel-body {
  padding: 0 20px 20px;
}
.map-container {
  height: 360px;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  z-index: 1; /* Assicura che la mappa stia sotto eventuali dialog/header */
}
.no-data {
  color: var(--text-muted);
  font-size: 13px;
  padding: 20px 0;
  text-align: center;
}

@media (min-width: 701px) {
  .chevron {
    display: none;
  }
}
@media (max-width: 700px) {
  .panel-body {
    display: none;
  }
  .panel-body.is-open {
    display: block;
  }
  .map-container {
    height: 260px;
  }
  body {
    max-width: 300px;
  }
}
</style>
