import { prisma } from "../utils/db";
import { computeTrainingLoad } from "../utils/trainingLoad";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const formData = await readMultipartFormData(event);
  const fitFile = formData?.find((item) => item.name === "file");

  if (!fitFile) {
    throw createError({ statusCode: 400, message: "No .fit file received" });
  }

  const data = await parseFitFile(fitFile.data as any).catch((err: any) => {
    console.error("FIT parsing error:", err);
    throw createError({
      statusCode: 400,
      message: "Invalid or corrupted .fit file",
    });
  });

  const records = data.records || [];
  const session_ = data.sessions?.[0];

  const activity = buildActivitySummary(records, session_);
  const normalizedPower = computeNormalizedPower(records);
  const power_records = computePowerCurve(records);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const training_load = computeTrainingLoad({
    normalizedPower,
    ftp: user?.ftp ?? 250,
    durationSeconds: activity.duration,
  });

  const candidateValues: Record<string, number> = {
    peak_power: power_records[0].short_intervals.peak_power,
    "3s_power": power_records[0].short_intervals["3s_power"],
    "5s_power": power_records[0].short_intervals["5s_power"],
    "10s_power": power_records[0].short_intervals["10s_power"],
    "20s_power": power_records[0].short_intervals["20s_power"],
    "30s_power": power_records[0].short_intervals["30s_power"],
    "1min_power": power_records[0].short_intervals["1min_power"],
    "2min_power": power_records[0].short_intervals["2min_power"],
    "3min_power": power_records[0].short_intervals["3min_power"],
    "5min_power": power_records[1].middle_intervals["5min_power"],
    "8min_power": power_records[1].middle_intervals["8min_power"],
    "10min_power": power_records[1].middle_intervals["10min_power"],
    "12min_power": power_records[1].middle_intervals["12min_power"],
    "15min_power": power_records[2].long_intervals["15min_power"],
    "20min_power": power_records[2].long_intervals["20min_power"],
    "30min_power": power_records[2].long_intervals["30min_power"],
    "60min_power": power_records[2].long_intervals["60min_power"],
    distance: Number(activity.distance.toFixed(2)),
    elevation_gain: Math.round(activity.elevation_gain),
    duration: activity.duration,
    kilojoules: activity.kilojoules,
    max_cadence: activity.average_cadence, // TODO: sostituire con vero max_cadence quando disponibile
    max_speed: Number(activity.max_speed.toFixed(1)),
    max_heartrate: activity.max_heartrate,
    hr_5min: 0, // TODO: sliding window su heart_rate, come la power curve
    hr_20min: 0,
    hr_1h: 0,
  };

  const recordChecks: Array<{
    metricKey: string;
    label: string;
    unit: string;
    newValue: number;
    wouldEnterAt: number | null;
    currentBest: number | null;
  }> = [];

  for (const [metricKey, newValue] of Object.entries(candidateValues)) {
    if (!newValue || newValue <= 0) continue;

    const metricConfig = RECORD_METRICS.find((m) => m.key === metricKey);
    if (!metricConfig) continue;

    const model = getModel(metricKey);
    const existing = await model.findMany({
      where: { userId },
      orderBy: { rank: "asc" },
    });

    const lowerIsBetter = metricConfig.lowerIsBetter;
    const currentBest = existing[0] ? Number(existing[0].value) : null;

    // Ordino SEMPRE l'intera lista (esistenti + candidato) secondo lowerIsBetter,
    // indipendentemente da quante entry ci sono già — questo evita il bug
    // per cui un valore veniva piazzato "in fondo" senza un vero confronto.
    const combined = [
      ...existing.map((e: any) => ({ value: Number(e.value), isNew: false })),
      { value: newValue, isNew: true },
    ];

    combined.sort((a, b) =>
      lowerIsBetter ? a.value - b.value : b.value - a.value,
    );

    const top3 = combined.slice(0, 3);
    const positionIndex = top3.findIndex((e) => e.isNew);
    const wouldEnterAt = positionIndex === -1 ? null : positionIndex + 1;

    recordChecks.push({
      metricKey,
      label: metricConfig.label,
      unit: metricConfig.unit,
      newValue,
      wouldEnterAt,
      currentBest,
    });
  }

  return {
    activity: { ...activity, normalized_power: normalizedPower },
    power_records,
    training_load,
    recordChecks,
    filename: fitFile.filename,
  };
});
