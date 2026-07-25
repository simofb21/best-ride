export interface LapSummary {
  lapNumber: number;
  durationSeconds: number;
  distanceKm: number;
  avgSpeedKmh: number;
  avgPowerWatts: number;
}

export function extractLaps(fitData: any): LapSummary[] {
  const laps = fitData.laps || [];

  return laps.map((lap: any, index: number) => ({
    lapNumber: index + 1,
    durationSeconds: Math.round(lap.total_elapsed_time ?? 0),
    distanceKm: Number((lap.total_distance ?? 0).toFixed(2)),
    avgSpeedKmh: Number((lap.avg_speed ?? 0).toFixed(1)),
    avgPowerWatts: Math.round(lap.avg_power ?? 0),
  }));
}
