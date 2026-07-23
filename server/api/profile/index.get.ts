import { prisma } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      lastName: true,
      weightKg: true,
      ftp: true,
      anaerobicThreshold: true,
      yearlyDistanceKm: true,
      yearlyHours: true,
      sex: true,
      dateOfBirth: true,
    },
  });

  if (!user) {
    throw createError({ statusCode: 404, message: "User not found" });
  }

  return user;
});
