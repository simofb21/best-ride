import FitParser from "fit-file-parser";

// Finestre di durata per la power curve (in secondi)
const POWER_WINDOWS = {
  short: {
    peak_power: 1,
    "3s_power": 3,
    "5s_power": 5,
    "10s_power": 10,
    "20s_power": 20,
    "30s_power": 30,
    "1min_power": 60,
    "2min_power": 120,
    "3min_power": 180,
  },
  middle: {
    "5min_power": 300,
    "8min_power": 480,
    "10min_power": 600,
    "12min_power": 720,
  },
  long: {
    "15min_power": 900,
    "20min_power": 1200,
    "30min_power": 1800,
    "60min_power": 3600,
  },
};

/**
 * Calcola la miglior media di potenza su una finestra di N secondi,
 * usando i timestamp reali dei record (gestisce eventuali buchi nella registrazione).
 */
function bestAveragePower(records: any[], windowSeconds: number): number {
  type Point = { t: number; p: number };

  const points: Point[] = records
    .map((r) => ({
      t: r.timestamp ? new Date(r.timestamp).getTime() / 1000 : null,
      p: r.power,
    }))
    .filter((r): r is Point => r.t !== null && typeof r.p === "number");
  // ↑ il type predicate "r is Point" dice esplicitamente a TS che dopo
  //   questo filter, t e p sono garantiti numeri, non null/undefined

  if (points.length === 0) return 0;

  let best = 0;
  let start = 0;
  let sum = 0;

  for (let end = 0; end < points.length; end++) {
    const current = points[end]!;
    sum += current.p;

    while (points[end]!.t - points[start]!.t > windowSeconds) {
      sum -= points[start]!.p;
      start++;
    }

    const duration = points[end]!.t - points[start]!.t;
    if (duration >= windowSeconds - 1) {
      const count = end - start + 1;
      const avg = sum / count;
      if (avg > best) best = avg;
    }
  }

  return Math.round(best);
}

function computePowerCurve(records: any[]) {
  const compute = (windows: Record<string, number>) =>
    Object.fromEntries(
      Object.entries(windows).map(([key, seconds]) => [
        key,
        bestAveragePower(records, seconds),
      ]),
    );

  return [
    { short_intervals: compute(POWER_WINDOWS.short) },
    { middle_intervals: compute(POWER_WINDOWS.middle) },
    { long_intervals: compute(POWER_WINDOWS.long) },
  ];
}

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  const fitFile = formData?.find((item) => item.name === "file");

  if (!fitFile) {
    throw createError({ statusCode: 400, message: "Nessun file ricevuto" });
  }

  const fitParser = new FitParser({
    force: true,
    speedUnit: "km/h",
    lengthUnit: "km",
    temperatureUnit: "celsius",
    elapsedRecordField: true,
    mode: "both",
  });

  const data = await new Promise<any>((resolve, reject) => {
    fitParser.parse(fitFile.data, (error: any, result: any) => {
      if (error) reject(error);
      else resolve(result);
    });
  }).catch((err) => {
    console.error("Errore parsing FIT:", err);
    throw createError({
      statusCode: 400,
      message: "File .fit non valido o corrotto",
    });
  });

  const records = data.records || [];
  const session = data.sessions?.[0];

  const powerValues = records
    .map((r: any) => r.power)
    .filter((v: any) => typeof v === "number");
  const cadenceValues = records
    .map((r: any) => r.cadence)
    .filter((v: any) => typeof v === "number");
  const hrValues = records
    .map((r: any) => r.heart_rate)
    .filter((v: any) => typeof v === "number");
  const speedValues = records
    .map((r: any) => r.speed)
    .filter((v: any) => typeof v === "number");

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const max = (arr: number[]) => (arr.length ? Math.max(...arr) : 0);

  const activity = {
    distance: session?.total_distance
      ? Number(session.total_distance.toFixed(2))
      : 0,
    duration: session?.total_elapsed_time
      ? Math.round(session.total_elapsed_time)
      : records.length,
    elevation_gain: session?.total_ascent ?? 0,
    average_speed: session?.avg_speed ?? Number(avg(speedValues).toFixed(1)),
    max_speed: session?.max_speed ?? Number(max(speedValues).toFixed(1)),
    average_cadence: session?.avg_cadence ?? Math.round(avg(cadenceValues)),
    average_heartrate: session?.avg_heart_rate ?? Math.round(avg(hrValues)),
    max_heartrate: session?.max_heart_rate ?? Math.round(max(hrValues)),
    average_watts: session?.avg_power ?? Math.round(avg(powerValues)),
    max_watts: session?.max_power ?? Math.round(max(powerValues)),
    kilojoules: session?.total_work ? Math.round(session.total_work / 1000) : 0,
    kcalories: session?.total_calories ?? 0,
  };

  const power_records = computePowerCurve(records);

  return {
    activity,
    power_records,
  };
});
