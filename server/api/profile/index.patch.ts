import { z } from "zod";
import { prisma } from "../../utils/db";

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  weightKg: z.coerce.number().min(20).max(300).optional().nullable(),
  ftp: z.coerce.number().int().min(0).max(1000).optional().nullable(),
  anaerobicThreshold: z.coerce
    .number()
    .int()
    .min(0)
    .max(250)
    .optional()
    .nullable(),
  sex: z.enum(["M", "F"]).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  yearlyDistanceKm: z.coerce.number().min(0).optional().nullable(),
  yearlyHours: z.coerce.number().min(0).optional().nullable(),
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
    data: {
      ...parsed.data,
      dateOfBirth: parsed.data.dateOfBirth
        ? new Date(parsed.data.dateOfBirth)
        : null,
    },
    select: {
      firstName: true,
      lastName: true,
      weightKg: true,
      ftp: true,
      anaerobicThreshold: true,
      yearlyDistanceKm: true,
      yearlyHours: true,
      trainingStress: true,
      trainingStressActivityCount: true,
      trainingStressStartedAt: true,
      trainingStressLastActivityAt: true,
      sex: true,
      dateOfBirth: true,
    },
  });

  return updated;
});
