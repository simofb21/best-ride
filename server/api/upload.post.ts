import FitParser from "fit-file-parser";

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
    mode: "both", // <-- FIX: prima era 'cascade'
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

  // DEBUG temporaneo - lascia questo finché non confermiamo che funziona
  console.log("Chiavi disponibili in data:", Object.keys(data));
  console.log("Numero records:", data.records?.length);
  console.log("Esempio record:", data.records?.[0]);
  console.log("Sessions:", data.sessions?.length, data.sessions?.[0]);

  const records = data.records || [];

  const powerValues = records
    .map((r: any) => r.power)
    .filter((v: any) => typeof v === "number");
  const cadenceValues = records
    .map((r: any) => r.cadence)
    .filter((v: any) => typeof v === "number");
  const hrValues = records
    .map((r: any) => r.heart_rate)
    .filter((v: any) => typeof v === "number");

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const max = (arr: number[]) => (arr.length ? Math.max(...arr) : 0);

  const session = data.sessions?.[0];

  return {
    filename: fitFile.filename,
    durationMinutes: session?.total_elapsed_time
      ? Math.round(session.total_elapsed_time / 60)
      : Math.round(records.length / 60),
    distanceKm: session?.total_distance
      ? Number(session.total_distance.toFixed(2))
      : null,
    avgPower: Math.round(avg(powerValues)),
    maxPower: Math.round(max(powerValues)),
    avgCadence: Math.round(avg(cadenceValues)),
    avgHeartRate: hrValues.length ? Math.round(avg(hrValues)) : null,
    pointsCount: records.length,
  };
});
