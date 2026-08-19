import { createHash } from "node:crypto";
import { z } from "zod";

const localizedReportSchema = z.object({
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(700),
  loadAssessment: z.string().min(1).max(450),
  strengths: z.array(z.string().min(1).max(180)).max(3),
  cautions: z.array(z.string().min(1).max(180)).max(3),
  nextSession: z.string().min(1).max(300),
});

export const trainingAnalysisReportSchema = z.object({
  schemaVersion: z.literal(1),
  workoutType: z.enum([
    "recovery",
    "endurance",
    "tempo",
    "threshold",
    "vo2max",
    "anaerobic",
    "sprint",
    "mixed",
    "unknown",
  ]),
  loadLevel: z.enum(["low", "moderate", "high", "very_high"]),
  recoveryHours: z.number().int().min(0).max(120),
  it: localizedReportSchema,
  en: localizedReportSchema,
});

export type TrainingAnalysisReport = z.infer<
  typeof trainingAnalysisReportSchema
>;

export interface TrainingAnalysisUser {
  weightKg: unknown;
  ftp: number | null;
  anaerobicThreshold: number | null;
  sex: string | null;
  dateOfBirth: Date | string | null;
  trainingStress: number;
  trainingStressActivityCount: number;
  trainingStressStartedAt: Date | string | null;
  trainingStressLastActivityAt: Date | string | null;
}

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
}

const reportJsonSchema = {
  type: "object",
  properties: {
    // generateContent usa ancora il tipo Schema protobuf: `enum` viene
    // interpretato come una lista di stringhe anche su un campo integer.
    // Un intervallo chiuso esprime lo stesso vincolo senza produrre un 400.
    schemaVersion: { type: "integer", minimum: 1, maximum: 1 },
    workoutType: {
      type: "string",
      enum: [
        "recovery",
        "endurance",
        "tempo",
        "threshold",
        "vo2max",
        "anaerobic",
        "sprint",
        "mixed",
        "unknown",
      ],
    },
    loadLevel: {
      type: "string",
      enum: ["low", "moderate", "high", "very_high"],
    },
    recoveryHours: { type: "integer", minimum: 0, maximum: 120 },
    it: localizedJsonSchema(),
    en: localizedJsonSchema(),
  },
  required: [
    "schemaVersion",
    "workoutType",
    "loadLevel",
    "recoveryHours",
    "it",
    "en",
  ],
} as const;

function localizedJsonSchema() {
  return {
    type: "object",
    properties: {
      title: { type: "string" },
      summary: { type: "string" },
      loadAssessment: { type: "string" },
      strengths: {
        type: "array",
        maxItems: 3,
        items: { type: "string" },
      },
      cautions: {
        type: "array",
        maxItems: 3,
        items: { type: "string" },
      },
      nextSession: { type: "string" },
    },
    required: [
      "title",
      "summary",
      "loadAssessment",
      "strengths",
      "cautions",
      "nextSession",
    ],
  } as const;
}

function finiteNumber(value: unknown, decimals = 1): number | undefined {
  if (
    value == null ||
    typeof value === "boolean" ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return undefined;
  }
  const number = Number(value);
  if (!Number.isFinite(number)) return undefined;
  return Number(number.toFixed(decimals));
}

function positiveNumber(value: unknown, decimals = 1): number | undefined {
  const number = finiteNumber(value, decimals);
  return number != null && number > 0 ? number : undefined;
}

function isoDate(value: unknown): string | undefined {
  if (!value) return undefined;
  const date = new Date(value as string | number | Date);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function ageInYears(
  value: TrainingAnalysisUser["dateOfBirth"],
): number | undefined {
  if (!value) return undefined;
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return undefined;

  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const birthdayPassed =
    today.getUTCMonth() > birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() &&
      today.getUTCDate() >= birth.getUTCDate());
  if (!birthdayPassed) age--;

  return age >= 10 && age <= 100 ? age : undefined;
}

function compactObject<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => {
      if (item == null) return false;
      if (Array.isArray(item)) return item.length > 0;
      if (typeof item === "object") return Object.keys(item).length > 0;
      return true;
    }),
  );
}

function flattenPowerCurve(value: unknown): Array<[string, number]> {
  if (!Array.isArray(value)) return [];

  const rows: Array<[string, number]> = [];
  for (const group of value) {
    if (!group || typeof group !== "object") continue;
    for (const intervals of Object.values(group as Record<string, unknown>)) {
      if (!intervals || typeof intervals !== "object") continue;
      for (const [duration, watts] of Object.entries(
        intervals as Record<string, unknown>,
      )) {
        const valueWatts = positiveNumber(watts, 0);
        if (valueWatts != null) rows.push([duration, valueWatts]);
      }
    }
  }
  return rows;
}

function compactZones(value: unknown): Array<[number, number, number]> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((zone, index) => {
    if (!zone || typeof zone !== "object") return [];
    const item = zone as Record<string, unknown>;
    const seconds = finiteNumber(item.seconds, 0) ?? 0;
    const percent = finiteNumber(item.percent, 1) ?? 0;
    return seconds > 0 ? [[index + 1, seconds, percent]] : [];
  });
}

function compactLaps(value: unknown): number[][] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((lap, index) => {
    if (!lap || typeof lap !== "object") return [];
    const item = lap as Record<string, unknown>;
    return [
      [
        finiteNumber(item.lapNumber, 0) ?? index + 1,
        finiteNumber(item.durationSeconds, 0) ?? 0,
        finiteNumber(item.distanceKm, 2) ?? 0,
        finiteNumber(item.avgSpeedKmh, 1) ?? 0,
        finiteNumber(item.avgPowerWatts, 0) ?? 0,
        finiteNumber(item.avgCadence, 0) ?? 0,
        finiteNumber(item.avgHeartRate, 0) ?? 0,
      ],
    ];
  });
}

function compactRecords(
  value: unknown,
): Array<Array<string | number | boolean | null>> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((record) => {
    if (!record || typeof record !== "object") return [];
    const item = record as Record<string, unknown>;
    const rawRank = finiteNumber(item.wouldEnterAt, 0);
    const rank = rawRank != null && rawRank >= 1 ? Math.round(rawRank) : null;
    const newValue = positiveNumber(item.newValue, 2);
    if (newValue == null) return [];
    return [
      [
        String(item.metricKey ?? "unknown"),
        rank,
        rank != null,
        newValue,
        typeof item.unit === "string" ? item.unit : "",
        finiteNumber(item.currentBest, 2) ?? null,
      ],
    ];
  });
}

function blockDays(
  startedAt: unknown,
  lastActivityAt: unknown,
): number | undefined {
  if (!startedAt || !lastActivityAt) {
    return undefined;
  }
  const start = new Date(startedAt as string | number | Date);
  const end = new Date(lastActivityAt as string | number | Date);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return undefined;
  }

  const startDay = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate(),
  );
  const endDay = Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate(),
  );
  return Math.round(Math.abs(endDay - startDay) / 86_400_000) + 1;
}

export function buildTrainingAnalysisInput(
  user: TrainingAnalysisUser,
  rawActivityData: unknown,
) {
  const data =
    rawActivityData && typeof rawActivityData === "object"
      ? (rawActivityData as Record<string, unknown>)
      : {};
  const activity =
    data.activity && typeof data.activity === "object"
      ? (data.activity as Record<string, unknown>)
      : {};
  const trainingLoad =
    data.training_load && typeof data.training_load === "object"
      ? (data.training_load as Record<string, unknown>)
      : {};

  const analysisProfile =
    data.analysis_profile &&
    typeof data.analysis_profile === "object" &&
    !Array.isArray(data.analysis_profile)
      ? (data.analysis_profile as Record<string, unknown>)
      : null;
  const calculationSnapshot =
    data.calculation_context &&
    typeof data.calculation_context === "object" &&
    !Array.isArray(data.calculation_context)
      ? (data.calculation_context as Record<string, unknown>)
      : null;
  const blockSnapshot =
    data.training_stress_block &&
    typeof data.training_stress_block === "object" &&
    !Array.isArray(data.training_stress_block)
      ? (data.training_stress_block as Record<string, unknown>)
      : null;

  const profileSex = analysisProfile ? analysisProfile.sex : user.sex;

  const profile = compactObject({
    age_y: analysisProfile
      ? positiveNumber(analysisProfile.ageYears, 0)
      : ageInYears(user.dateOfBirth),
    sex: profileSex === "M" || profileSex === "F" ? profileSex : undefined,
    weight_kg: analysisProfile
      ? positiveNumber(analysisProfile.weightKg, 1)
      : positiveNumber(user.weightKg, 1),
  });

  const calculationContext = compactObject({
    ftp_w: calculationSnapshot
      ? positiveNumber(calculationSnapshot.ftpUsed, 0)
      : positiveNumber(user.ftp, 0),
    hr_threshold_bpm: calculationSnapshot
      ? positiveNumber(calculationSnapshot.anaerobicThresholdUsed, 0)
      : positiveNumber(user.anaerobicThreshold, 0),
    ftp_is_fallback:
      calculationSnapshot &&
      typeof calculationSnapshot.ftpFallback === "boolean"
        ? calculationSnapshot.ftpFallback
        : undefined,
    hr_threshold_is_fallback:
      calculationSnapshot &&
      typeof calculationSnapshot.anaerobicThresholdFallback === "boolean"
        ? calculationSnapshot.anaerobicThresholdFallback
        : undefined,
  });

  const blockStartedAt = blockSnapshot
    ? blockSnapshot.startedAt
    : user.trainingStressStartedAt;
  const blockLastActivityAt = blockSnapshot
    ? blockSnapshot.lastActivityAt
    : user.trainingStressLastActivityAt;

  const block = compactObject({
    training_stress: blockSnapshot
      ? (finiteNumber(blockSnapshot.stress, 0) ?? 0)
      : (finiteNumber(user.trainingStress, 0) ?? 0),
    activity_count: blockSnapshot
      ? (finiteNumber(blockSnapshot.activityCount, 0) ?? 0)
      : (finiteNumber(user.trainingStressActivityCount, 0) ?? 0),
    days: blockDays(blockStartedAt, blockLastActivityAt),
    started_at: isoDate(blockStartedAt),
    last_activity_at: isoDate(blockLastActivityAt),
  });

  const summary = compactObject({
    date: isoDate(activity.activityDate),
    duration_s: positiveNumber(activity.duration, 0),
    distance_km: positiveNumber(activity.distance, 2),
    elevation_m: positiveNumber(activity.elevation_gain, 0),
    avg_speed_kmh: positiveNumber(activity.average_speed, 1),
    max_speed_kmh: positiveNumber(activity.max_speed, 1),
    avg_power_w: positiveNumber(activity.average_watts, 0),
    max_power_w: positiveNumber(activity.max_watts, 0),
    normalized_power_w: positiveNumber(activity.normalized_power, 0),
    avg_cadence_rpm: positiveNumber(activity.average_cadence, 0),
    max_cadence_rpm: positiveNumber(activity.max_cadence, 0),
    avg_hr_bpm: positiveNumber(activity.average_heartrate, 0),
    max_hr_bpm: positiveNumber(activity.max_heartrate, 0),
    energy_kj: positiveNumber(activity.kilojoules, 0),
    calories_kcal: positiveNumber(activity.kcalories, 0),
    avg_temperature_c: finiteNumber(activity.average_temperature, 1),
    activity_stress: finiteNumber(trainingLoad.tss, 0),
    intensity_factor: finiteNumber(trainingLoad.intensity_factor, 2),
  });

  const powerCurve = flattenPowerCurve(data.power_records);
  const powerZones = compactZones(data.powerZoneTime);
  const heartRateZones = compactZones(data.heartRateZoneTime);
  const laps = compactLaps(data.laps);
  const records = compactRecords(data.recordChecks);
  const sensorAvailability = {
    power:
      positiveNumber(activity.average_watts, 0) != null ||
      positiveNumber(activity.max_watts, 0) != null ||
      positiveNumber(activity.normalized_power, 0) != null ||
      powerCurve.length > 0,
    cadence:
      positiveNumber(activity.average_cadence, 0) != null ||
      positiveNumber(activity.max_cadence, 0) != null ||
      laps.some((lap) => (lap[5] ?? 0) > 0),
    heart_rate:
      positiveNumber(activity.average_heartrate, 0) != null ||
      positiveNumber(activity.max_heartrate, 0) != null ||
      heartRateZones.length > 0 ||
      laps.some((lap) => (lap[6] ?? 0) > 0),
    temperature: finiteNumber(activity.average_temperature, 1) != null,
  };

  return {
    units: {
      training_stress:
        "internal load units; approximately 100 means one hour at FTP",
      power_curve: ["duration_key", "watts"],
      zones: ["zone_number", "seconds", "percent"],
      laps: [
        "lap",
        "seconds",
        "km",
        "avg_kmh",
        "avg_watts",
        "avg_rpm",
        "avg_bpm",
      ],
      records: [
        "metric",
        "rank_or_null",
        "is_record",
        "value",
        "unit",
        "previous_best",
      ],
    },
    profile,
    calculation_context: calculationContext,
    current_training_block: block,
    activity: compactObject({
      summary,
      sensor_availability: sensorAvailability,
      power_curve: powerCurve,
      power_zones: powerZones,
      heart_rate_zones: heartRateZones,
      laps,
      performance_records: records,
    }),
  };
}

export function hashTrainingAnalysisInput(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function extractResponseText(response: GeminiGenerateContentResponse): string {
  const text = response.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("Gemini returned an empty response");
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
}

function replaceProtectedMetricName(text: string, replacement: string): string {
  return text
    .replace(/training stress score/gi, replacement)
    .replace(/\bTSS\b/gi, replacement);
}

function sanitizeReportTerminology(
  report: TrainingAnalysisReport,
): TrainingAnalysisReport {
  const sanitizeLocalized = (
    value: TrainingAnalysisReport["it"],
    replacement: string,
  ) => ({
    title: replaceProtectedMetricName(value.title, replacement),
    summary: replaceProtectedMetricName(value.summary, replacement),
    loadAssessment: replaceProtectedMetricName(
      value.loadAssessment,
      replacement,
    ),
    strengths: value.strengths.map((item) =>
      replaceProtectedMetricName(item, replacement),
    ),
    cautions: value.cautions.map((item) =>
      replaceProtectedMetricName(item, replacement),
    ),
    nextSession: replaceProtectedMetricName(value.nextSession, replacement),
  });

  return {
    ...report,
    it: sanitizeLocalized(report.it, "Stress allenamento"),
    en: sanitizeLocalized(report.en, "Training stress"),
  };
}

export async function generateTrainingAnalysis(
  input: unknown,
): Promise<{ report: TrainingAnalysisReport; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: "AI analysis is not configured",
    });
  }

  const configuredModel =
    process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";
  const model = /^[a-zA-Z0-9._-]+$/.test(configuredModel)
    ? configuredModel
    : "gemini-3.5-flash-lite";

  const systemInstruction = `You are a cautious cycling training analyst. Analyze only the supplied numeric data. The accumulated training stress belongs to the current consecutive training block and already includes this activity. Be specific but concise, identify missing sensor data without guessing, and never diagnose a medical condition. Never use the acronym TSS: call the metric "Stress allenamento" in Italian and "Training stress" in English. Produce equivalent Italian and English reports. Give conservative recovery guidance. Return only JSON matching the schema.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        store: false,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Analyze this cycling activity and current training block:\n${JSON.stringify(input)}`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1800,
          responseMimeType: "application/json",
          responseSchema: reportJsonSchema,
        },
      }),
      signal: AbortSignal.timeout(45_000),
    },
  );

  if (!response.ok) {
    const details = (await response.text()).slice(0, 500);
    console.error(`Gemini API error (${response.status}):`, details);
    throw createError({
      statusCode: response.status === 429 ? 429 : 502,
      statusMessage:
        response.status === 429
          ? "AI analysis quota temporarily unavailable"
          : "AI analysis service unavailable",
    });
  }

  const payload = (await response.json()) as GeminiGenerateContentResponse;
  const parsedJson = JSON.parse(extractResponseText(payload));
  const parsed = trainingAnalysisReportSchema.safeParse(parsedJson);
  if (!parsed.success) {
    console.error("Invalid Gemini training analysis response:", parsed.error);
    throw createError({
      statusCode: 502,
      statusMessage: "AI analysis returned an invalid report",
    });
  }

  const sanitized = sanitizeReportTerminology(parsed.data);
  const validatedSanitized = trainingAnalysisReportSchema.safeParse(sanitized);
  if (!validatedSanitized.success) {
    throw createError({
      statusCode: 502,
      statusMessage: "AI analysis returned an invalid report",
    });
  }

  return { report: validatedSanitized.data, model };
}
