// server/utils/recordModels.ts
import { prisma } from "./db"; // stessa cartella, percorso relativo corretto

export const METRIC_MODEL_MAP: Record<string, string> = {
  peak_power: "recordPeakPower",
  "3s_power": "record3s",
  "5s_power": "record5s",
  "10s_power": "record10s",
  "20s_power": "record20s",
  "30s_power": "record30s",
  "1min_power": "record1min",
  "2min_power": "record2min",
  "3min_power": "record3min",
  "5min_power": "record5min",
  "8min_power": "record8min",
  "10min_power": "record10min",
  "12min_power": "record12min",
  "15min_power": "record15min",
  "20min_power": "record20min",
  "30min_power": "record30min",
  "60min_power": "record60min",
  distance: "recordDistance",
  elevation_gain: "recordElevationGain",
  duration: "recordDuration",
  kilojoules: "recordKilojoules",
  max_cadence: "recordMaxCadence",
  max_speed: "recordMaxSpeed",
  max_heartrate: "recordMaxHeartrate",
  hr_5min: "recordHr5min",
  hr_20min: "recordHr20min",
  hr_1h: "recordHr1h",
};

export function getModel(metricKey: string) {
  const modelName = METRIC_MODEL_MAP[metricKey];
  if (!modelName) {
    throw createError({
      statusCode: 400,
      message: `Unknown metric: ${metricKey}`,
    });
  }
  return (prisma as any)[modelName];
}
