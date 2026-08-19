import { prisma } from "../../utils/db";
import { decodeGpsTrack } from "../../utils/gpsTrack";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;
  setResponseHeader(event, "Cache-Control", "no-store");

  const lastActivity = await prisma.lastActivity.findUnique({
    where: { userId },
  });

  if (!lastActivity) {
    throw createError({ statusCode: 404, message: "No activity found yet" });
  }
  const data = lastActivity.data as Record<string, unknown>;
  const { gpsTrackPolyline, ...activityData } = data;
  const analysisData = {
    activityId: lastActivity.activityId,
    aiAnalysis: lastActivity.aiAnalysis,
    aiAnalysisStatus: lastActivity.aiAnalysisStatus,
    aiAnalysisModel: lastActivity.aiAnalysisModel,
    aiAnalysisGeneratedAt: lastActivity.aiAnalysisGeneratedAt,
  };

  // Le righe precedenti a questa ottimizzazione contengono già gpsTrack come
  // array: in quel caso lo manteniamo per retrocompatibilità.
  if (typeof gpsTrackPolyline !== "string") {
    return { ...activityData, ...analysisData };
  }

  return {
    ...activityData,
    ...analysisData,
    gpsTrack: decodeGpsTrack(gpsTrackPolyline),
  };
});
