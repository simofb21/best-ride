import { prisma } from "../utils/db";
import {
  normalizeToScore,
  getTierLabel,
} from "../../shared/utils/powerProfile";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { weightKg: true, ftp: true, sex: true },
  });

  if (!user?.weightKg) {
    throw createError({
      statusCode: 400,
      message:
        "Weight must be set in your profile to compute the power profile",
    });
  }

  const weightKg = Number(user.weightKg);

  const [best5s, best30s, best1min, best2min, best5min, best12min, best20min] =
    await Promise.all([
      prisma.record5s.findFirst({ where: { userId, rank: 1 } }),
      prisma.record30s.findFirst({ where: { userId, rank: 1 } }),
      prisma.record1min.findFirst({ where: { userId, rank: 1 } }),
      prisma.record2min.findFirst({ where: { userId, rank: 1 } }),
      prisma.record5min.findFirst({ where: { userId, rank: 1 } }),
      prisma.record12min.findFirst({ where: { userId, rank: 1 } }),
      prisma.record20min.findFirst({ where: { userId, rank: 1 } }),
    ]);

  const rawValues: Record<string, number | null> = {
    power_5s: best5s ? Number(best5s.value) : null,
    power_30s: best30s ? Number(best30s.value) : null,
    power_1min: best1min ? Number(best1min.value) : null,
    power_2min: best2min ? Number(best2min.value) : null,
    power_5min: best5min ? Number(best5min.value) : null,
    power_12min: best12min ? Number(best12min.value) : null,
    power_20min: best20min ? Number(best20min.value) : null,
    ftp: user.ftp ?? null,
  };

  const profile = POWER_PROFILE_DURATIONS.map((duration) => {
    const rawWatts = rawValues[duration.key];
    const wkg = rawWatts != null ? rawWatts / weightKg : 0;
    const score =
      rawWatts != null ? normalizeToScore(wkg, duration.thresholds) : 0;
    const tier =
      rawWatts != null ? getTierLabel(wkg, duration.thresholds) : null;

    return {
      key: duration.key,
      label: duration.label,
      shortLabel: duration.shortLabel,
      rawWatts,
      wkg: rawWatts != null ? Number(wkg.toFixed(2)) : null,
      score: Math.round(score),
      tier,
      hasData: rawWatts != null,
    };
  });

  return { weightKg, profile };
});
