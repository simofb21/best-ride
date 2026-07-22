import { prisma } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const body = await readBody(event);
  const { activity, power_records, training_load, recordChecks, filename } =
    body;

  const activityDate = new Date(activity.activityDate);
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // 1. Salva/sovrascrive l'ultima attività
  await prisma.lastActivity.upsert({
    where: { userId },
    update: {
      filename,
      ftpUsed: user?.ftp ?? 0,
      anaerobicThresholdUsed: user?.anaerobicThreshold ?? 0,
      data: { activity, power_records, training_load },
    },
    create: {
      userId,
      filename,
      ftpUsed: 0,
      anaerobicThresholdUsed: 0,
      data: { activity, power_records, training_load },
    },
  });

  // 2. Aggiorna i totali annuali: somma la distanza e le ore di QUESTA attività
  const activityHours = activity.duration / 3600; // duration è in secondi

  await prisma.user.update({
    where: { id: userId },
    data: {
      yearlyDistanceKm: {
        increment: activity.distance,
      },
      yearlyHours: {
        increment: Number(activityHours.toFixed(2)),
      },
    },
  });

  // 3. Aggiorna i record fissi, usando la data reale dell'attività
  for (const check of recordChecks) {
    if (!check.wouldEnterAt) continue;

    const model = getModel(check.metricKey);
    const existing = await model.findMany({
      where: { userId },
      orderBy: { rank: "asc" },
    });

    const combined = [
      ...existing.map((e: any) => ({
        value: Number(e.value),
        entryDate: e.entryDate,
        description: e.description,
      })),
      { value: check.newValue, entryDate: activityDate, description: null },
    ];

    const metricConfig = RECORD_METRICS.find((m) => m.key === check.metricKey)!;
    combined.sort((a, b) => {
      const primaryDiff = metricConfig.lowerIsBetter
        ? a.value - b.value
        : b.value - a.value;
      if (primaryDiff !== 0) return primaryDiff;
      return new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
    });
    const newTop3 = combined.slice(0, 3);

    for (let i = 0; i < newTop3.length; i++) {
      const entry = newTop3[i];
      await model.upsert({
        where: { userId_rank: { userId, rank: i + 1 } },
        update: entry,
        create: { userId, rank: i + 1, ...entry },
      });
    }
  }

  return { success: true };
});
