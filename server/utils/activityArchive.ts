import {
  ACTIVITY_ARCHIVE_SCHEMA_VERSION,
  ActivityCalculationFlag,
  ActivitySensorFlag,
  HEART_RATE_ZONE_COUNT,
  MAX_ACTIVITY_FILENAME_LENGTH,
  MAX_ACTIVITY_NAME_LENGTH,
  MAX_ACTIVITY_NOTES_LENGTH,
  MAX_ARCHIVED_LAPS,
  POWER_CURVE_METRIC_ORDER,
  POWER_ZONE_COUNT,
  type ArchivedActivityCreateData,
  type CompactHeartRateZoneSeconds,
  type CompactLap,
  type CompactPowerCurve,
  type CompactPowerZoneSeconds,
  type CompactRecordAchievement,
} from "../../shared/utils/activityArchive";

const MAX_POSTGRES_INTEGER = 2_147_483_647;
const MAX_SMALLINT = 32_767;
const SOURCE_ID_PATTERN = /^[0-9a-f]{64}$/i;
const RECORD_METRIC_PATTERN = /^[a-z0-9_]{1,50}$/;

type UnknownObject = Record<string, unknown>;

export interface BuildArchivedActivityInput {
  sourceId: unknown;
  filename: unknown;
  name?: unknown;
  perceivedExertion?: unknown;
  notes?: unknown;
  ftpUsed: unknown;
  anaerobicThresholdUsed: unknown;
  /** Current rich `lastActivityData` object produced by upload.post.ts. */
  activityData: unknown;
}

export class ActivityArchiveValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActivityArchiveValidationError";
  }
}

function isObject(value: unknown): value is UnknownObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown): number | null {
  if (
    value == null ||
    typeof value === "boolean" ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function roundedInRange(
  value: unknown,
  minimum: number,
  maximum: number,
): number | null {
  const number = finiteNumber(value);
  if (number == null || number < minimum || number > maximum) return null;
  return Math.round(number);
}

function positiveIntegerOrNull(
  value: unknown,
  maximum = MAX_SMALLINT,
): number | null {
  const rounded = roundedInRange(value, Number.EPSILON, maximum);
  return rounded != null && rounded > 0 ? rounded : null;
}

function nonNegativeInteger(value: unknown, maximum = MAX_POSTGRES_INTEGER) {
  return roundedInRange(value, 0, maximum) ?? 0;
}

function positiveScaledIntegerOrNull(
  value: unknown,
  scale: number,
  maximum: number,
): number | null {
  const number = finiteNumber(value);
  if (number == null || number <= 0) return null;
  const scaled = Math.round(number * scale);
  return scaled > 0 && scaled <= maximum ? scaled : null;
}

function scaledIntegerOrNull(
  value: unknown,
  scale: number,
  minimum: number,
  maximum: number,
): number | null {
  const number = finiteNumber(value);
  if (number == null) return null;
  const scaled = Math.round(number * scale);
  return scaled >= minimum && scaled <= maximum ? scaled : null;
}

function truncateCodePoints(value: string, maximum: number): string {
  return Array.from(value).slice(0, maximum).join("");
}

function sanitizeSingleLine(value: unknown, maximum: number): string {
  if (typeof value !== "string") return "";
  return truncateCodePoints(
    value
      .replace(/[\u0000-\u001f\u007f]+/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
    maximum,
  );
}

function sanitizeNotes(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim();
  const result = truncateCodePoints(normalized, MAX_ACTIVITY_NOTES_LENGTH);
  return result || null;
}

function sanitizeSourceId(value: unknown): string {
  const sourceId = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!SOURCE_ID_PATTERN.test(sourceId)) {
    throw new ActivityArchiveValidationError(
      "Activity sourceId must be a SHA-256 hexadecimal digest",
    );
  }
  return sourceId;
}

function sanitizeFilename(value: unknown): string {
  const filename = sanitizeSingleLine(value, MAX_ACTIVITY_FILENAME_LENGTH);
  return filename || "activity.fit";
}

function defaultActivityName(filename: string, activityDate: Date): string {
  const withoutPath = filename.split(/[\\/]/).pop() ?? "";
  const withoutExtension = withoutPath.replace(/\.(?:fit|zip)$/i, "").trim();
  return (
    sanitizeSingleLine(withoutExtension, MAX_ACTIVITY_NAME_LENGTH) ||
    `Activity ${activityDate.toISOString().slice(0, 10)}`
  );
}

function sanitizeActivityDate(value: unknown): Date {
  if (value == null || value === "") {
    throw new ActivityArchiveValidationError("Activity date is missing");
  }
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) {
    throw new ActivityArchiveValidationError("Activity date is invalid");
  }
  return date;
}

function requireInteger(
  value: unknown,
  field: string,
  minimum: number,
  maximum: number,
): number {
  const number = finiteNumber(value);
  if (
    number == null ||
    !Number.isInteger(number) ||
    number < minimum ||
    number > maximum
  ) {
    throw new ActivityArchiveValidationError(`${field} is invalid`);
  }
  return number;
}

function sanitizePerceivedExertion(value: unknown): number | null {
  if (value == null || value === "") return null;
  return requireInteger(value, "Perceived exertion", 1, 10);
}

function compactPowerCurve(value: unknown): CompactPowerCurve {
  const result = POWER_CURVE_METRIC_ORDER.map(() => 0) as CompactPowerCurve;

  if (!Array.isArray(value)) return result;

  // Also accept an already compact V1 vector, which makes the helper
  // idempotent for migrations and reprocessing jobs.
  if (value.every((item) => !isObject(item))) {
    for (let index = 0; index < POWER_CURVE_METRIC_ORDER.length; index++) {
      result[index] = positiveIntegerOrNull(value[index]) ?? 0;
    }
    return result;
  }

  const metrics = new Map<string, unknown>();
  for (const group of value) {
    if (!isObject(group)) continue;
    for (const intervals of Object.values(group)) {
      if (!isObject(intervals)) continue;
      for (const [metricKey, metricValue] of Object.entries(intervals)) {
        metrics.set(metricKey, metricValue);
      }
    }
  }

  for (let index = 0; index < POWER_CURVE_METRIC_ORDER.length; index++) {
    result[index] =
      positiveIntegerOrNull(metrics.get(POWER_CURVE_METRIC_ORDER[index]!)) ?? 0;
  }
  return result;
}

function compactZoneSeconds(value: unknown, expectedLength: number): number[] {
  const result = Array.from({ length: expectedLength }, () => 0);
  if (!Array.isArray(value)) return result;

  for (let index = 0; index < expectedLength; index++) {
    const zone = value[index];
    const seconds = isObject(zone) ? zone.seconds : zone;
    result[index] = nonNegativeInteger(seconds);
  }
  return result;
}

function compactLap(value: unknown, fallbackLapNumber: number): CompactLap | null {
  if (!isObject(value)) return null;

  const lapNumber =
    positiveIntegerOrNull(value.lapNumber, MAX_POSTGRES_INTEGER) ??
    fallbackLapNumber;
  const durationSeconds = positiveIntegerOrNull(
    value.durationSeconds,
    MAX_POSTGRES_INTEGER,
  );
  const distanceMeters = positiveScaledIntegerOrNull(
    value.distanceKm,
    1_000,
    MAX_POSTGRES_INTEGER,
  );
  const avgSpeedDeciKmh = positiveScaledIntegerOrNull(
    value.avgSpeedKmh,
    10,
    MAX_SMALLINT,
  );
  const avgPowerWatts = positiveIntegerOrNull(value.avgPowerWatts);
  const avgCadenceRpm = positiveIntegerOrNull(value.avgCadence, 1_000);
  const avgHeartRateBpm = positiveIntegerOrNull(value.avgHeartRate, 300);

  return [
    lapNumber,
    durationSeconds,
    distanceMeters,
    avgSpeedDeciKmh,
    avgPowerWatts,
    avgCadenceRpm,
    avgHeartRateBpm,
  ];
}

function selectEvenly<T>(values: T[], maximum: number): T[] {
  if (values.length <= maximum) return values;
  return Array.from({ length: maximum }, (_, index) => {
    const sourceIndex = Math.round(
      (index * (values.length - 1)) / (maximum - 1),
    );
    return values[sourceIndex]!;
  });
}

function compactLaps(value: unknown): CompactLap[] {
  if (!Array.isArray(value)) return [];
  const laps = value.flatMap((lap, index) => {
    const compact = compactLap(lap, index + 1);
    return compact ? [compact] : [];
  });
  return selectEvenly(laps, MAX_ARCHIVED_LAPS);
}

function compactRecordAchievements(
  value: unknown,
): CompactRecordAchievement[] {
  if (!Array.isArray(value)) return [];

  const achievements: CompactRecordAchievement[] = [];
  const seenMetrics = new Set<string>();

  for (const rawRecord of value) {
    if (!isObject(rawRecord)) continue;
    const metricKey =
      typeof rawRecord.metricKey === "string"
        ? rawRecord.metricKey.trim().toLowerCase()
        : "";
    const rank = roundedInRange(rawRecord.wouldEnterAt, 1, 3);
    const newValue = finiteNumber(rawRecord.newValue);

    if (
      !RECORD_METRIC_PATTERN.test(metricKey) ||
      seenMetrics.has(metricKey) ||
      rank == null ||
      newValue == null ||
      newValue <= 0 ||
      newValue > 100_000
    ) {
      continue;
    }

    const previousBestValue = finiteNumber(rawRecord.currentBest);
    const previousBest =
      previousBestValue != null &&
      previousBestValue > 0 &&
      previousBestValue <= 100_000
        ? Number(previousBestValue.toFixed(2))
        : null;

    achievements.push([
      metricKey,
      rank as 1 | 2 | 3,
      Number(newValue.toFixed(2)),
      previousBest,
    ]);
    seenMetrics.add(metricKey);
  }

  return achievements;
}

function buildSensorMask(params: {
  activity: UnknownObject;
  powerCurveWatts: CompactPowerCurve;
  powerZoneSeconds: CompactPowerZoneSeconds;
  heartRateZoneSeconds: CompactHeartRateZoneSeconds;
  laps: CompactLap[];
  hasGps: boolean;
}): number {
  const {
    activity,
    powerCurveWatts,
    powerZoneSeconds,
    heartRateZoneSeconds,
    laps,
    hasGps,
  } = params;
  let mask = 0;

  const hasPower =
    positiveIntegerOrNull(activity.average_watts) != null ||
    positiveIntegerOrNull(activity.max_watts) != null ||
    positiveIntegerOrNull(activity.normalized_power) != null ||
    powerCurveWatts.some((value) => value > 0) ||
    powerZoneSeconds.some((value) => value > 0) ||
    laps.some((lap) => lap[4] != null);
  if (hasPower) mask |= ActivitySensorFlag.power;

  const hasHeartRate =
    positiveIntegerOrNull(activity.average_heartrate, 300) != null ||
    positiveIntegerOrNull(activity.max_heartrate, 300) != null ||
    heartRateZoneSeconds.some((value) => value > 0) ||
    laps.some((lap) => lap[6] != null);
  if (hasHeartRate) mask |= ActivitySensorFlag.heartRate;

  const hasCadence =
    positiveIntegerOrNull(activity.average_cadence, 1_000) != null ||
    positiveIntegerOrNull(activity.max_cadence, 1_000) != null ||
    laps.some((lap) => lap[5] != null);
  if (hasCadence) mask |= ActivitySensorFlag.cadence;

  if (finiteNumber(activity.average_temperature) != null) {
    mask |= ActivitySensorFlag.temperature;
  }

  if (hasGps) mask |= ActivitySensorFlag.gps;

  return mask;
}

function hasSensor(mask: number, flag: number): boolean {
  return (mask & flag) === flag;
}

/**
 * Converts the rich, current-activity payload into the bounded historical
 * representation expected by the Activity model. The function is pure: it
 * neither reads from nor writes to Prisma, and never includes GPS data.
 */
export function buildArchivedActivityData(
  input: BuildArchivedActivityInput,
): ArchivedActivityCreateData {
  if (!isObject(input.activityData)) {
    throw new ActivityArchiveValidationError("Activity payload is invalid");
  }

  const activity = isObject(input.activityData.activity)
    ? input.activityData.activity
    : null;
  if (!activity) {
    throw new ActivityArchiveValidationError("Activity summary is missing");
  }

  const trainingLoad = isObject(input.activityData.training_load)
    ? input.activityData.training_load
    : {};
  const analysisProfile = isObject(input.activityData.analysis_profile)
    ? input.activityData.analysis_profile
    : {};
  const calculationContext = isObject(input.activityData.calculation_context)
    ? input.activityData.calculation_context
    : {};

  const sourceId = sanitizeSourceId(input.sourceId);
  const filename = sanitizeFilename(input.filename);
  const activityDate = sanitizeActivityDate(activity.activityDate);
  const suppliedName = sanitizeSingleLine(input.name, MAX_ACTIVITY_NAME_LENGTH);

  const powerCurveWatts = compactPowerCurve(input.activityData.power_records);
  const powerZoneSeconds = compactZoneSeconds(
    input.activityData.powerZoneTime,
    POWER_ZONE_COUNT,
  ) as CompactPowerZoneSeconds;
  const heartRateZoneSeconds = compactZoneSeconds(
    input.activityData.heartRateZoneTime,
    HEART_RATE_ZONE_COUNT,
  ) as CompactHeartRateZoneSeconds;
  const laps = compactLaps(input.activityData.laps);
  const recordAchievements = compactRecordAchievements(
    input.activityData.recordChecks,
  );

  const sensorMask = buildSensorMask({
    activity,
    powerCurveWatts,
    powerZoneSeconds,
    heartRateZoneSeconds,
    laps,
    hasGps:
      (typeof input.activityData.gpsTrackPolyline === "string" &&
        input.activityData.gpsTrackPolyline.length > 0) ||
      (Array.isArray(input.activityData.gpsTrack) &&
        input.activityData.gpsTrack.length > 0),
  });
  const hasPower = hasSensor(sensorMask, ActivitySensorFlag.power);
  const hasHeartRate = hasSensor(sensorMask, ActivitySensorFlag.heartRate);
  const hasCadence = hasSensor(sensorMask, ActivitySensorFlag.cadence);

  let calculationFlags = 0;
  if (calculationContext.ftpFallback === true) {
    calculationFlags |= ActivityCalculationFlag.ftpFallback;
  }
  if (calculationContext.anaerobicThresholdFallback === true) {
    calculationFlags |= ActivityCalculationFlag.anaerobicThresholdFallback;
  }

  const temperature = scaledIntegerOrNull(
    activity.average_temperature,
    10,
    -1_000,
    1_000,
  );

  return {
    sourceId,
    filename,
    name: suppliedName || defaultActivityName(filename, activityDate),
    activityDate,
    perceivedExertion: sanitizePerceivedExertion(input.perceivedExertion),
    notes: sanitizeNotes(input.notes),
    ftpUsed: requireInteger(input.ftpUsed, "FTP", 0, 2_000),
    anaerobicThresholdUsed: requireInteger(
      input.anaerobicThresholdUsed,
      "Anaerobic threshold",
      0,
      300,
    ),
    weightDeciKg: scaledIntegerOrNull(
      analysisProfile.weightKg,
      10,
      200,
      3_000,
    ),
    calculationFlags,
    archiveSchemaVersion: ACTIVITY_ARCHIVE_SCHEMA_VERSION,

    durationSeconds: nonNegativeInteger(activity.duration),
    distanceMeters: nonNegativeInteger(
      (finiteNumber(activity.distance) ?? 0) * 1_000,
    ),
    elevationGainMeters: nonNegativeInteger(activity.elevation_gain),
    avgSpeedDeciKmh: positiveScaledIntegerOrNull(
      activity.average_speed,
      10,
      MAX_SMALLINT,
    ),
    maxSpeedDeciKmh: positiveScaledIntegerOrNull(
      activity.max_speed,
      10,
      MAX_SMALLINT,
    ),
    avgPowerWatts: hasPower
      ? positiveIntegerOrNull(activity.average_watts)
      : null,
    maxPowerWatts: hasPower
      ? positiveIntegerOrNull(activity.max_watts)
      : null,
    normalizedPowerWatts: hasPower
      ? positiveIntegerOrNull(activity.normalized_power)
      : null,
    avgCadenceRpm: hasCadence
      ? positiveIntegerOrNull(activity.average_cadence, 1_000)
      : null,
    maxCadenceRpm: hasCadence
      ? positiveIntegerOrNull(activity.max_cadence, 1_000)
      : null,
    avgHeartRateBpm: hasHeartRate
      ? positiveIntegerOrNull(activity.average_heartrate, 300)
      : null,
    maxHeartRateBpm: hasHeartRate
      ? positiveIntegerOrNull(activity.max_heartrate, 300)
      : null,
    kilojoules: hasPower
      ? positiveIntegerOrNull(activity.kilojoules, MAX_POSTGRES_INTEGER)
      : null,
    caloriesKcal: positiveIntegerOrNull(
      activity.kcalories,
      MAX_POSTGRES_INTEGER,
    ),
    avgTemperatureDeciCelsius: hasSensor(
      sensorMask,
      ActivitySensorFlag.temperature,
    )
      ? temperature
      : null,
    trainingStress: hasPower
      ? roundedInRange(trainingLoad.tss, 0, MAX_POSTGRES_INTEGER)
      : null,
    intensityFactorMilli: hasPower
      ? scaledIntegerOrNull(
          trainingLoad.intensity_factor,
          1_000,
          0,
          MAX_SMALLINT,
        )
      : null,

    powerCurveWatts,
    powerZoneSeconds,
    heartRateZoneSeconds,
    laps,
    recordAchievements,
    sensorMask,
  };
}

export {
  compactLaps,
  compactPowerCurve,
  compactRecordAchievements,
  compactZoneSeconds,
};
