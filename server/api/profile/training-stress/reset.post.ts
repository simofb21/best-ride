import { prisma } from "../../../utils/db";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const trainingBlock = await prisma.user.update({
    where: { id: userId },
    data: {
      trainingStress: 0,
      trainingStressActivityCount: 0,
      trainingStressStartedAt: null,
      trainingStressLastActivityAt: null,
    },
    select: {
      trainingStress: true,
      trainingStressActivityCount: true,
      trainingStressStartedAt: true,
      trainingStressLastActivityAt: true,
    },
  });

  return { success: true, ...trainingBlock };
});
