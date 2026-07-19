import { prisma } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const customRecords = await prisma.customRecord.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return customRecords;
});
