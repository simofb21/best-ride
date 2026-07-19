import { prisma } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const lastActivity = await prisma.lastActivity.findUnique({
    where: { userId },
  });

  if (!lastActivity) {
    throw createError({ statusCode: 404, message: "No activity found yet" });
  }

  return lastActivity.data; // { activity, power_records, training_load }
});
