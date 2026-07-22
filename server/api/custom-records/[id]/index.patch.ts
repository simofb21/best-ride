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

  // In ENTRAMBI i casi (nuova entry o modifica di una esistente),
  // ricostruiamo la lista SENZA lo slot che stiamo toccando, poi la rimettiamo
  // dentro insieme al nuovo valore e riordiniamo tutto da capo.
  const entriesExcludingEdited = rank
    ? existingEntries.filter((_, index) => index !== rank - 1)
    : existingEntries;

  const combined = [...entriesExcludingEdited, { value, date, description }];

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
