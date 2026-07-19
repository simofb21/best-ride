import { prisma } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const body = await readBody(event);
  const { activity, power_records, training_load, recordChecks, filename } =
    body;
  const activityDate = new Date(activity.activityDate); // <-- la vera data dell'uscita

  // 1. Salva/sovrascrive l'ultima attività (upsert: se esiste, sovrascrive)
  await prisma.lastActivity.upsert({
    where: { userId },
    update: {
      filename,
      ftpUsed:
        (await prisma.user.findUnique({ where: { id: userId } }))?.ftp ?? 0,
      anaerobicThresholdUsed:
        (await prisma.user.findUnique({ where: { id: userId } }))
          ?.anaerobicThreshold ?? 0,
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

  // 2. Aggiorna i record personali se necessario
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
    combined.sort((a, b) =>
      metricConfig.lowerIsBetter ? a.value - b.value : b.value - a.value,
    );
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
