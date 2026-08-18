import { z } from "zod";
import { prisma } from "../../utils/db";

const discardSchema = z.object({
  analysisId: z.string().regex(/^[0-9a-f]{64}$/i),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const parsed = discardSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid activity analysis ID",
    });
  }

  await prisma.pendingActivity.deleteMany({
    where: {
      userId: session.user.id,
      sourceId: parsed.data.analysisId.toLowerCase(),
    },
  });

  return { success: true };
});
