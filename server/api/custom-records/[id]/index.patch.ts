import { z } from "zod";
import { prisma } from "../../../utils/db";

interface RecordEntry {
  value: number;
  date: string;
  description?: string | null;
}

const patchSchema = z.object({
  rank: z.coerce.number().int().min(1).max(3).optional().nullable(),
  value: z.coerce.number().finite(),
  date: z.string().min(1),
  description: z.string().max(500).optional().nullable(),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message:
        "Invalid input: " + JSON.stringify(parsed.error.flatten().fieldErrors),
    });
  }

  const { rank, value, date, description } = parsed.data;

  const record = await prisma.customRecord.findUnique({ where: { id } });

  if (!record || record.userId !== userId) {
    throw createError({ statusCode: 404, message: "Custom record not found" });
  }

  const existingEntries = (record.entries as unknown as RecordEntry[]) || [];

  // CASO 1: rank specificato → sto MODIFICANDO uno slot già esistente
  if (rank) {
    const updatedEntries = [...existingEntries];
    updatedEntries[rank - 1] = { value, date, description };

    const updated = await prisma.customRecord.update({
      where: { id },
      data: { entries: updatedEntries },
    });
    return updated;
  }

  // CASO 2: nessun rank → è una NUOVA performance, va inserita nel podio giusto
  const combined = [...existingEntries, { value, date, description }];

  combined.sort((a, b) =>
    record.lowerIsBetter ? a.value - b.value : b.value - a.value,
  );
  const newTop3 = combined.slice(0, 3);

  const updated = await prisma.customRecord.update({
    where: { id },
    data: { entries: newTop3 },
  });

  return updated;
});
