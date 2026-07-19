import { z } from "zod";
import { prisma } from "../../utils/db";

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  weightKg: z.coerce.number().min(20).max(300),
  ftp: z.coerce.number().int().min(0).max(1000),
  anaerobicThreshold: z.coerce.number().int().min(0).max(250),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const body = await readBody(event);
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message:
        "Invalid input: " + JSON.stringify(parsed.error.flatten().fieldErrors),
    });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
    select: {
      firstName: true,
      lastName: true,
      weightKg: true,
      ftp: true,
      anaerobicThreshold: true,
      yearlyDistanceKm: true,
      yearlyHours: true,
    },
  });

  return updated;
});
