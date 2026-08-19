import { prisma } from "../../utils/db";
import { trainingAnalysisReportSchema } from "../../utils/trainingAnalysis";
import { AI_ANALYSIS_GENERATION_TIMEOUT_MS } from "../../utils/aiAnalysisPolicy";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;
  setResponseHeader(event, "Cache-Control", "no-store");
  const rawActivityId = getQuery(event).activityId;
  let requestedActivityId: number | null = null;
  if (rawActivityId != null) {
    requestedActivityId =
      typeof rawActivityId === "string" ? Number(rawActivityId) : Number.NaN;
    if (!Number.isInteger(requestedActivityId) || requestedActivityId <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid activity ID",
      });
    }
  }

  const lastActivity = await prisma.lastActivity.findUnique({
    where: { userId },
    select: {
      activityId: true,
      aiAnalysis: true,
      aiAnalysisStatus: true,
      aiAnalysisModel: true,
      aiAnalysisGeneratedAt: true,
      aiAnalysisStartedAt: true,
    },
  });

  if (!lastActivity) {
    throw createError({
      statusCode: 404,
      statusMessage: "No activity found yet",
    });
  }

  if (
    requestedActivityId != null &&
    lastActivity.activityId !== requestedActivityId
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
      analysis: cached.data,
      model: lastActivity.aiAnalysisModel,
      generatedAt: lastActivity.aiAnalysisGeneratedAt,
    };
  }

  const generationIsCurrent =
    lastActivity.aiAnalysisStatus === "generating" &&
    lastActivity.aiAnalysisStartedAt != null &&
    lastActivity.aiAnalysisStartedAt.getTime() >=
      Date.now() - AI_ANALYSIS_GENERATION_TIMEOUT_MS;

  if (generationIsCurrent) {
    return { status: "generating" as const };
  }

  if (
    lastActivity.aiAnalysisStatus === "failed" ||
    lastActivity.aiAnalysisStatus === "ready" ||
    lastActivity.aiAnalysisStatus === "generating"
  ) {
    return { status: "failed" as const };
  }

  return { status: "not_requested" as const };
});
