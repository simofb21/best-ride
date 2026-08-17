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
      <div v-if="mapError" class="no-data">
        {{ mapError }}
      </div>
      <div v-else-if="!normalizedPoints.length" class="no-data">
        No GPS data in this activity
      </div>
      <div v-else ref="mapContainer" class="map-container" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from "vue";
import "leaflet/dist/leaflet.css";

const props = defineProps<{
  gpsTrack: Array<{ lat: number; lng: number } | [number, number]>;
}>();

const isOpen = ref(true);
const mapContainer = ref<HTMLElement | null>(null);
const mapError = ref("");
let mapInstance: any = null;

const normalizedPoints = computed<[number, number][]>(() => {
  if (!Array.isArray(props.gpsTrack)) return [];

  return props.gpsTrack
    .map((point: any) => {
      const lat = point?.lat ?? point?.position_lat ?? point?.[0];
      const lng = point?.lng ?? point?.position_long ?? point?.[1];

      if (
        typeof lat !== "number" ||
        typeof lng !== "number" ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        Math.abs(lat) > 90 ||
        Math.abs(lng) > 180 ||
        (lat === 0 && lng === 0)
      ) {
        return null;
      }

      return [lat, lng] as [number, number];
    })
    .filter((point): point is [number, number] => point !== null);
});

const toggleMap = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && mapInstance) {
    setTimeout(() => mapInstance.invalidateSize(), 100);
  }
};

const initMap = async () => {
  if (!normalizedPoints.value.length) return;

  await nextTick();
  if (!mapContainer.value) return;

  mapError.value = "";

  try {
    const leaflet = await import("leaflet");
    const L = (leaflet as any).default ?? leaflet;

    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }

    const points = normalizedPoints.value;

    if (!points.length) {
      mapError.value = "No valid GPS coordinates in this activity";
      return;
    }

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
  } catch (error) {
    console.error("Leaflet initialization failed:", error);
    mapError.value = "Unable to load the route map";
  }
};

watch(
  mapContainer,
  (container) => {
    if (container) initMap();
  },
  { flush: "post" },
);

watch(
  normalizedPoints,
  () => {
    initMap();
  },
  { deep: true, flush: "post" },
);

onBeforeUnmount(() => {
  mapInstance?.remove();
  mapInstance = null;
});
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
