import { resolveFitDurationSeconds } from "./activityDuration";

export interface LapSummary {
  lapNumber: number;
  durationSeconds: number;
  distanceKm: number;
  avgSpeedKmh: number;
  avgPowerWatts: number;
  avgCadence: number;
  avgHeartRate: number;
}

export function extractLaps(fitData: any): LapSummary[] {
  const laps = fitData.laps || [];

  return laps.map((lap: any, index: number) => ({
    lapNumber: index + 1,
    durationSeconds: resolveFitDurationSeconds(lap) ?? 0,
    distanceKm: Number((lap.total_distance ?? 0).toFixed(2)),
    avgSpeedKmh: Number((lap.avg_speed ?? 0).toFixed(1)),
    avgPowerWatts: Math.round(lap.avg_power ?? 0),
    avgCadence: Math.round(lap.avg_cadence ?? 0),
    avgHeartRate: Math.round(lap.avg_heart_rate ?? 0),
  }));
}
