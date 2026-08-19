import { Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../utils/db";

const MAX_TRANSACTION_ATTEMPTS = 3;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTransactionConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;
  const resetAt = new Date();

  for (let attempt = 1; attempt <= MAX_TRANSACTION_ATTEMPTS; attempt++) {
    try {
      const trainingBlock = await prisma.$transaction(
        async (tx) => {
          const lastActivity = await tx.lastActivity.findUnique({
            where: { userId },
            select: { activityId: true, data: true },
          });
          const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
              trainingStress: 0,
              trainingStressActivityCount: 0,
              trainingStressStartedAt: null,
              trainingStressLastActivityAt: null,
              trainingStressResetAt: resetAt,
            },
            select: {
              trainingStress: true,
              trainingStressActivityCount: true,
              trainingStressStartedAt: true,
              trainingStressLastActivityAt: true,
            },
          });

          if (lastActivity) {
            const previousData = isObject(lastActivity.data)
              ? lastActivity.data
              : {};
            await tx.lastActivity.update({
              where: { userId },
              data: {
                data: {
                  ...previousData,
                  training_stress_block: {
                    stress: 0,
                    activityCount: 0,
                    startedAt: null,
                    lastActivityAt: null,
                  },
                },
                aiAnalysis: Prisma.DbNull,
                aiAnalysisHash: null,
                aiAnalysisStatus: null,
                aiAnalysisModel: null,
                aiAnalysisGeneratedAt: null,
                aiAnalysisStartedAt: null,
                aiAnalysisAttemptCount: 0,
              },
            });

            if (lastActivity.activityId) {
              await tx.activity.updateMany({
                where: { id: lastActivity.activityId, userId },
                data: {
                  aiAnalysis: Prisma.DbNull,
                  aiAnalysisHash: null,
                  aiAnalysisStatus: null,
                  aiAnalysisModel: null,
                  aiAnalysisGeneratedAt: null,
                  aiAnalysisStartedAt: null,
                  aiAnalysisAttemptCount: 0,
                },
              });
            }
          }

          return updatedUser;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5_000,
          timeout: 15_000,
        },
      );

      return { success: true, ...trainingBlock };
    } catch (error) {
      if (isTransactionConflict(error)) {
        if (attempt < MAX_TRANSACTION_ATTEMPTS) continue;
        throw createError({
          statusCode: 409,
          message: "Could not reset training stress due to a concurrent update",
        });
      }
      throw error;
    }
  }

  throw createError({
    statusCode: 409,
    message: "Could not reset training stress",
  });
});
