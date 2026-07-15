export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  const fitFile = formData?.find((item) => item.name === "file");

  if (!fitFile) {
    throw createError({ statusCode: 400, message: "Nessun file ricevuto" });
  }

  const data = await parseFitFile(fitFile.data).catch((err: any) => {
    console.error("Errore parsing FIT:", err);
    throw createError({
      statusCode: 400,
      message: "File .fit non valido o corrotto",
    });
  });

  const records = data.records || [];
  const session = data.sessions?.[0];

  const activity = buildActivitySummary(records, session);
  const power_records = computePowerCurve(records);
  const normalizedPower = computeNormalizedPower(records);

  return {
    activity: { ...activity, normalized_power: normalizedPower },
    power_records,
  };
});
