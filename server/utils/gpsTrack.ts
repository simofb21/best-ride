export interface GpsPoint {
  lat: number;
  lng: number;
}

// Il formato FIT usa "semicircles" per lat/lng — servono convertiti in gradi decimali
const SEMICIRCLE_TO_DEGREES = 180 / Math.pow(2, 31);

export function extractGpsTrack(records: any[]): GpsPoint[] {
  return (
    records
      .filter(
        (r) =>
          typeof r.position_lat === "number" &&
          typeof r.position_long === "number",
      )
      .map((r) => ({
        lat: r.position_lat * SEMICIRCLE_TO_DEGREES,
        lng: r.position_long * SEMICIRCLE_TO_DEGREES,
      }))
      // Sottocampiona: se ci sono migliaia di punti, non serve mandarli tutti al frontend
      .filter((_, i) => i % 3 === 0)
  );
}
