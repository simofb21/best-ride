import { prisma } from "../../utils/db";
import { z } from "zod";
import {
  buildTrainingAnalysisInput,
  generateTrainingAnalysis,
  hashTrainingAnalysisInput,
  trainingAnalysisReportSchema,
} from "../../utils/trainingAnalysis";
import {
  AI_ANALYSIS_FAILED_RETRY_COOLDOWN_MS,
  AI_ANALYSIS_GENERATION_TIMEOUT_MS,
  AI_ANALYSIS_MAX_GENERATION_ATTEMPTS,
} from "../../utils/aiAnalysisPolicy";

const requestSchema = z
  .object({
    activityId: z.number().int().positive().nullable().optional(),
  })
  .strict();

function throwRetryLimit(
  event: Parameters<typeof setResponseHeader>[0],
  seconds?: number,
): never {
  if (seconds != null) {
    setResponseHeader(event, "Retry-After", Math.max(1, seconds));
  }
  throw createError({
    statusCode: 429,
    statusMessage:
      seconds == null
        ? "AI analysis retry limit reached for this activity"
        : "AI analysis retry cooldown is active",
  });
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;
  setResponseHeader(event, "Cache-Control", "no-store");
  const parsedBody = requestSchema.safeParse((await readBody(event)) ?? {});
  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid AI analysis request",
    });
  }

  const [lastActivity, user] = await Promise.all([
    prisma.lastActivity.findUnique({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        weightKg: true,
        ftp: true,
        anaerobicThreshold: true,
        sex: true,
        dateOfBirth: true,
        trainingStress: true,
        trainingStressActivityCount: true,
        trainingStressStartedAt: true,
        trainingStressLastActivityAt: true,
      },
    }),
  ]);

  if (!lastActivity || !user) {
    throw createError({
      statusCode: 404,
      statusMessage: "No activity found yet",
    });
  }

  if (
    parsedBody.data.activityId != null &&
    lastActivity.activityId !== parsedBody.data.activityId
  ) {
    throw createError({
      statusCode: 409,
      statusMessage: "The displayed activity is no longer the latest activity",
    });
  }

  const cached = trainingAnalysisReportSchema.safeParse(
    lastActivity.aiAnalysis,
  );
  if (cached.success) {
    return {
      status: "ready" as const,
      cached: true,
      analysis: cached.data,
      model: lastActivity.aiAnalysisModel,
      generatedAt: lastActivity.aiAnalysisGeneratedAt,
    };
  }

  const now = Date.now();
  const staleBefore = new Date(now - AI_ANALYSIS_GENERATION_TIMEOUT_MS);
  const retryBefore = new Date(
    now - AI_ANALYSIS_FAILED_RETRY_COOLDOWN_MS,
  );
  const attemptCount = lastActivity.aiAnalysisAttemptCount;
  const lastAttemptAt = lastActivity.aiAnalysisStartedAt;
  const generationIsStale =
    lastActivity.aiAnalysisStatus === "generating" &&
    (!lastAttemptAt || lastAttemptAt < staleBefore);

  if (
    attemptCount >= AI_ANALYSIS_MAX_GENERATION_ATTEMPTS &&
    (lastActivity.aiAnalysisStatus !== "generating" || generationIsStale)
  ) {
    throwRetryLimit(event);
  }

  if (
    lastActivity.aiAnalysisStatus === "failed" &&
    lastAttemptAt &&
    lastAttemptAt >= retryBefore
  ) {
    const retryInSeconds = Math.ceil(
      (lastAttemptAt.getTime() +
        AI_ANALYSIS_FAILED_RETRY_COOLDOWN_MS -
        now) /
        1000,
    );
    throwRetryLimit(event, retryInSeconds);
  }

  const claim = await prisma.lastActivity.updateMany({
    where: {
      id: lastActivity.id,
      sourceId: lastActivity.sourceId,
      uploadedAt: lastActivity.uploadedAt,
      aiAnalysisAttemptCount: {
        lt: AI_ANALYSIS_MAX_GENERATION_ATTEMPTS,
      },
      OR: [
        { aiAnalysisStatus: null },
        { aiAnalysisStatus: "ready" },
        {
          aiAnalysisStatus: "failed",
          OR: [
            { aiAnalysisStartedAt: null },
            { aiAnalysisStartedAt: { lt: retryBefore } },
          ],
        },
        {
          aiAnalysisStatus: "generating",
          OR: [
            { aiAnalysisStartedAt: null },
            { aiAnalysisStartedAt: { lt: staleBefore } },
          ],
        },
      ],
    },
    data: {
      aiAnalysisStatus: "generating",
      aiAnalysisStartedAt: new Date(),
      aiAnalysisAttemptCount: { increment: 1 },
    },
  });

  if (claim.count === 0) {
    setResponseStatus(event, 202);
    return { status: "generating" as const };
  }

  const input = buildTrainingAnalysisInput(user, lastActivity.data);
  const inputHash = hashTrainingAnalysisInput(input);

  try {
    const { report, model } = await generateTrainingAnalysis(input);
    const saved = await prisma.lastActivity.updateMany({
      where: {
        id: lastActivity.id,
        sourceId: lastActivity.sourceId,
        uploadedAt: lastActivity.uploadedAt,
        aiAnalysisStatus: "generating",
      },
      data: {
        aiAnalysis: report,
        aiAnalysisHash: inputHash,
        aiAnalysisStatus: "ready",
        aiAnalysisModel: model,
        aiAnalysisGeneratedAt: new Date(),
        aiAnalysisStartedAt: null,
      },
    });

    if (saved.count === 0) {
      throw createError({
        statusCode: 409,
        statusMessage: "The latest activity changed during AI analysis",
      });
    }

    return {
      status: "ready" as const,
      cached: false,
      analysis: report,
      model,
      generatedAt: new Date(),
    };
  } catch (error) {
    await prisma.lastActivity.updateMany({
      where: {
        id: lastActivity.id,
        sourceId: lastActivity.sourceId,
        uploadedAt: lastActivity.uploadedAt,
        aiAnalysisStatus: "generating",
      },
      data: {
        aiAnalysisStatus: "failed",
      },
    });
    throw error;
  }
});
