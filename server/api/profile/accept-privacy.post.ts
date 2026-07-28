// server/api/profile/accept-privacy.post.ts

import { prisma } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      privacyAcceptedAt: new Date(),
    },
  });

  return {
    success: true,
  };
});
