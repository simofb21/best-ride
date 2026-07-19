import { prisma } from "../../../utils/db";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const id = Number(getRouterParam(event, "id"));

  const record = await prisma.customRecord.findUnique({ where: { id } });

  if (!record || record.userId !== userId) {
    throw createError({ statusCode: 404, message: "Custom record not found" });
  }

  await prisma.customRecord.delete({ where: { id } });

  return { success: true };
});
