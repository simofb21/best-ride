import { z } from "zod";
import { prisma } from "../../../utils/db";

const renameSchema = z.object({
  label: z.string().min(1).max(100),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);

  const parsed = renameSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: "Invalid label" });
  }

  const record = await prisma.customRecord.findUnique({ where: { id } });
  if (!record || record.userId !== userId) {
    throw createError({ statusCode: 404, message: "Custom record not found" });
  }

  const updated = await prisma.customRecord.update({
    where: { id },
    data: { label: parsed.data.label.trim() },
  });

  return updated;
});
