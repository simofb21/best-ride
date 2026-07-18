// server/api/records/index.post.ts
import { z } from "zod";
import { prisma } from "../../utils/db";

const createRecordSchema = z.object({
  metricKey: z.string().min(1).max(50),
  rank: z.coerce.number().int().min(1).max(3).optional().nullable(),
  value: z.coerce.number().finite().min(0).max(100000),
  entryDate: z.string().min(1),
  description: z.string().max(500).optional().nullable(),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const body = await readBody(event);

  const parsed = createRecordSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message:
        "Invalid input: " + JSON.stringify(parsed.error.flatten().fieldErrors),
      data: parsed.error.flatten(),
    });
  }

  const { metricKey, rank, value, entryDate, description } = parsed.data;

  const model = getModel(metricKey);
  const metricConfig = RECORD_METRICS.find((m) => m.key === metricKey);
  const lowerIsBetter = metricConfig?.lowerIsBetter ?? false;

  // CASO 1: rank specificato → l'utente sta MODIFICANDO uno slot già esistente
  if (rank) {
    const updated = await model.upsert({
      where: { userId_rank: { userId, rank } },
      update: { value, entryDate: new Date(entryDate), description },
      create: {
        userId,
        rank,
        value,
        entryDate: new Date(entryDate),
        description,
      },
    });
    return { entry: updated, action: "updated" };
  }

  // CASO 2: nessun rank → è una NUOVA performance, va inserita nel podio giusto
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
    { value, entryDate: new Date(entryDate), description },
  ];

  combined.sort((a, b) =>
    lowerIsBetter ? a.value - b.value : b.value - a.value,
  );
  const newTop3 = combined.slice(0, 3);

  for (let i = 0; i < newTop3.length; i++) {
    const entryRank = i + 1;
    const entry = newTop3[i]!;
    await model.upsert({
      where: { userId_rank: { userId, rank: entryRank } },
      update: entry,
      create: { userId, rank: entryRank, ...entry },
    });
  }

  await model.deleteMany({ where: { userId, rank: { gt: newTop3.length } } });

  return { action: "inserted", top3: newTop3 };
});
