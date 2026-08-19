/**
 * Version of the compact activity archive contract.
 *
 * Changing the meaning, units, or ordering of a persisted tuple requires a
 * new version. Existing rows must always be decoded with the version they
 * were written with.
 *
 * V2 stores `durationSeconds` as moving time (or active timer time when the
 * device does not provide moving time). V1 rows used elapsed time, including
 * pauses, and retain that meaning when decoded.
 */
export const ACTIVITY_ARCHIVE_SCHEMA_VERSION = 2 as const;

/**
 * Version 1 power-curve order. Values are integer watts; `0` means that the
 * FIT file did not contain a complete window for that duration.
 *
 * Never reorder this array in place. Add a new order version instead.
 */
export const POWER_CURVE_ORDER_VERSION = 1 as const;
export const POWER_CURVE_METRIC_ORDER = [
  "peak_power",
  "3s_power",
  "5s_power",
  "10s_power",
  "20s_power",
  "30s_power",
  "1min_power",
  "2min_power",
  "3min_power",
  "5min_power",
  "8min_power",
  "10min_power",
  "12min_power",
  "15min_power",
  "20min_power",
  "30min_power",
  "60min_power",
] as const;

export type PowerCurveMetricKey = (typeof POWER_CURVE_METRIC_ORDER)[number];

export type CompactPowerCurve = [
  peakPower: number,
  power3Seconds: number,
  power5Seconds: number,
  power10Seconds: number,
  power20Seconds: number,
  power30Seconds: number,
  power1Minute: number,
  power2Minutes: number,
  power3Minutes: number,
  power5Minutes: number,
  power8Minutes: number,
  power10Minutes: number,
  power12Minutes: number,
  power15Minutes: number,
  power20Minutes: number,
  power30Minutes: number,
  power60Minutes: number,
];

export const POWER_ZONE_COUNT = 7 as const;
export const HEART_RATE_ZONE_COUNT = 5 as const;

/** Fixed Z1..Z7 order. Values are whole seconds. */
export type CompactPowerZoneSeconds = [
  z1: number,
  z2: number,
  z3: number,
  z4: number,
  z5: number,
  z6: number,
  z7: number,
];

/** Fixed Z1..Z5 order. Values are whole seconds. */
export type CompactHeartRateZoneSeconds = [
  z1: number,
  z2: number,
  z3: number,
  z4: number,
  z5: number,
];

/**
 * Historical activities keep at most 64 representative laps. When an
 * activity has more laps, indices are sampled evenly so both the first and
 * final lap are retained. Sixty-four is enough for normal interval workouts
 * while preventing auto-lap-heavy FIT files from growing without bounds.
 */
export const MAX_ARCHIVED_LAPS = 64 as const;

/**
 * Compact lap tuple, in this exact order and units:
 * [lap number, seconds, metres, 0.1 km/h, watts, rpm, bpm].
 *
 * Missing lap metrics are `null`, never zero. This is especially important
 * because the upstream FIT lap summary historically used zero as a missing
 * sensor sentinel.
 */
export type CompactLap = [
  lapNumber: number,
  durationSeconds: number | null,
  distanceMeters: number | null,
  avgSpeedDeciKmh: number | null,
  avgPowerWatts: number | null,
  avgCadenceRpm: number | null,
  avgHeartRateBpm: number | null,
];

/**
 * Only actual top-three achievements are archived:
 * [metric key, resulting rank, value, previous best].
 */
export type CompactRecordAchievement = [
  metricKey: string,
  rank: 1 | 2 | 3,
  value: number,
  previousBest: number | null,
];

export const ActivitySensorFlag = {
  power: 1 << 0,
  heartRate: 1 << 1,
  cadence: 1 << 2,
  temperature: 1 << 3,
  /** GPS availability only; coordinates are never part of the archive. */
  gps: 1 << 4,
} as const;

export const ActivityCalculationFlag = {
  ftpFallback: 1 << 0,
  anaerobicThresholdFallback: 1 << 1,
} as const;

export const MAX_ACTIVITY_NAME_LENGTH = 120 as const;
export const MAX_ACTIVITY_NOTES_LENGTH = 800 as const;
export const MAX_ACTIVITY_FILENAME_LENGTH = 255 as const;

/**
 * Prisma-compatible create data, deliberately independent from the generated
 * Prisma client. The caller only needs to add `userId` (and relations, if
 * desired). No raw FIT samples or GPS coordinates are part of this contract.
 */
export interface ArchivedActivityCreateData {
  sourceId: string;
  filename: string;
  name: string;
  activityDate: Date;
  perceivedExertion: number | null;
  notes: string | null;
  ftpUsed: number;
  anaerobicThresholdUsed: number;
  weightDeciKg: number | null;
  calculationFlags: number;
  archiveSchemaVersion: typeof ACTIVITY_ARCHIVE_SCHEMA_VERSION;

  durationSeconds: number;
  distanceMeters: number;
  elevationGainMeters: number;
  avgSpeedDeciKmh: number | null;
  maxSpeedDeciKmh: number | null;
  avgPowerWatts: number | null;
  maxPowerWatts: number | null;
  normalizedPowerWatts: number | null;
  avgCadenceRpm: number | null;
  maxCadenceRpm: number | null;
  avgHeartRateBpm: number | null;
  maxHeartRateBpm: number | null;
  kilojoules: number | null;
  caloriesKcal: number | null;
  avgTemperatureDeciCelsius: number | null;
  trainingStress: number | null;
  intensityFactorMilli: number | null;

  powerCurveWatts: CompactPowerCurve;
  powerZoneSeconds: CompactPowerZoneSeconds;
  heartRateZoneSeconds: CompactHeartRateZoneSeconds;
  laps: CompactLap[];
  recordAchievements: CompactRecordAchievement[];
  sensorMask: number;
}
