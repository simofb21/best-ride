import { prisma } from "../../../../utils/db";

interface RecordEntry {
  value: number;
  date: string;
  description?: string | null;
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const id = Number(getRouterParam(event, "id"));
  const rank = Number(getRouterParam(event, "rank"));

  const record = await prisma.customRecord.findUnique({ where: { id } });

  if (!record || record.userId !== userId) {
    throw createError({ statusCode: 404, message: "Custom record not found" });
  }

  const existingEntries = (record.entries as unknown as RecordEntry[]) || [];

  // Rimuove l'entry in quella posizione e "richiude" l'array (niente buchi)
  const updatedEntries = existingEntries.filter(
    (_, index) => index !== rank - 1,
  );

  const updated = await prisma.customRecord.update({
    where: { id },
    data: { entries: updatedEntries },
  });

  return updated;
});
