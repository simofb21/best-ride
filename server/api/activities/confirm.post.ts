import { z } from "zod";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../utils/db";
import {
  ActivityArchiveValidationError,
  buildArchivedActivityData,
} from "../../utils/activityArchive";

const MAX_POSTGRES_INTEGER = 2_147_483_647;
const MAX_TRANSACTION_ATTEMPTS = 3;
const PENDING_ACTIVITY_TTL_MS = 24 * 60 * 60 * 1000;
const FIT_EPOCH_MS = Date.UTC(1989, 11, 31);
const MAX_FUTURE_CLOCK_SKEW_MS = 24 * 60 * 60 * 1000;

const confirmationSchema = z
  .object({
    analysisId: z
      .string()
      .regex(/^[0-9a-f]{64}$/i)
      .transform((value) => value.toLowerCase()),
    name: z.string().trim().min(1).max(120),
    perceivedExertion: z.number().int().min(1).max(10),
    trainingNotes: z.string().trim().max(800).optional().nullable(),
  })
  .strict();

interface PendingPayload {
  ftpUsed: number;
  anaerobicThresholdUsed: number;
  lastActivityData: Record<string, any>;
}

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalidPendingData(field: string): never {
  throw createError({
    statusCode: 500,
    statusMessage: `Stored activity analysis is invalid (${field})`,
  });
}

function requireNonNegativeNumber(value: unknown, field: string): number {
  if (value == null || value === "" || typeof value === "boolean") {
    invalidPendingData(field);
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) invalidPendingData(field);
  return number;
}

function requireNonNegativeInteger(value: unknown, field: string): number {
  const number = requireNonNegativeNumber(value, field);
  if (!Number.isInteger(number) || number > MAX_POSTGRES_INTEGER) {
    invalidPendingData(field);
  }
  return number;
}

function parseActivityDate(value: unknown): Date {
  if (value == null || value === "") invalidPendingData("activity date");
  const date = new Date(value as string | number | Date);
  const timestamp = date.getTime();
  if (
    Number.isNaN(timestamp) ||
    timestamp < FIT_EPOCH_MS ||
    timestamp > Date.now() + MAX_FUTURE_CLOCK_SKEW_MS
  ) {
    invalidPendingData("activity date");
  }
  return date;
}

function parsePendingPayload(value: unknown): PendingPayload {
  if (!isObject(value) || value.schemaVersion !== 1) {
    invalidPendingData("schema version");
  }

  const ftpUsed = requireNonNegativeInteger(value.ftpUsed, "FTP");
  const anaerobicThresholdUsed = requireNonNegativeInteger(
    value.anaerobicThresholdUsed,
    "anaerobic threshold",
  );
  if (!isObject(value.lastActivityData)) {
    invalidPendingData("activity payload");
  }
  if (
    !isObject(value.lastActivityData.activity) ||
    !isObject(value.lastActivityData.training_load)
  ) {
    invalidPendingData("activity summary");
  }

  return {
    ftpUsed,
    anaerobicThresholdUsed,
    lastActivityData: value.lastActivityData,
  };
}

function sanitizeActivityTrainingStress(value: unknown): number {
  if (value == null || value === "") return 0;
  const trainingStress = Number(value);
  if (!Number.isFinite(trainingStress) || trainingStress <= 0) return 0;

  const rounded = Math.round(trainingStress);
  if (rounded > MAX_POSTGRES_INTEGER) {
    invalidPendingData("training stress");
  }
  return rounded;
}

function minimumDate(current: Date | null, candidate: Date): Date {
  if (!current) return candidate;
  return current.getTime() <= candidate.getTime() ? current : candidate;
}

function maximumDate(current: Date | null, candidate: Date): Date {
  if (!current) return candidate;
  return current.getTime() >= candidate.getTime() ? current : candidate;
}

function isTransactionConflict(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2034" || error.code === "P2002")
  );
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const rawBody = await readBody(event);
  const parsedBody = confirmationSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      message: "Invalid activity confirmation",
      data: parsedBody.error.flatten(),
    });
  }

  const analysisId = parsedBody.data.analysisId;
  const activityName = parsedBody.data.name;
  const perceivedExertion = parsedBody.data.perceivedExertion;
  const trainingNotes = parsedBody.data.trainingNotes || null;

  for (let attempt = 1; attempt <= MAX_TRANSACTION_ATTEMPTS; attempt++) {
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          const user = await tx.user.findUnique({ where: { id: userId } });
          if (!user) {
            throw createError({ statusCode: 404, message: "User not found" });
          }

          const [previousActivity, existingArchivedActivity] =
            await Promise.all([
              tx.lastActivity.findUnique({
                where: { userId },
                select: { sourceId: true, activityId: true, data: true },
              }),
              tx.activity.findUnique({
                where: {
                  userId_sourceId: { userId, sourceId: analysisId },
                },
                select: { id: true },
              }),
            ]);

          if (existingArchivedActivity) {
            await tx.pendingActivity.deleteMany({
              where: { userId, sourceId: analysisId },
            });
            return {
              kind: "duplicate-saved" as const,
              activityId: existingArchivedActivity.id,
              isLatest:
                previousActivity?.activityId === existingArchivedActivity.id,
              legacyReimport: false,
              trainingStress: user.trainingStress,
              trainingStressActivityCount: user.trainingStressActivityCount,
              trainingStressStartedAt: user.trainingStressStartedAt,
              trainingStressLastActivityAt:
                user.trainingStressLastActivityAt,
            };
          }

          const pending = await tx.pendingActivity.findUnique({
            where: { userId },
          });
          if (!pending || pending.sourceId !== analysisId) {
            return { kind: "missing-pending" as const };
          }
          if (
            pending.createdAt.getTime() <
            Date.now() - PENDING_ACTIVITY_TTL_MS
          ) {
            await tx.pendingActivity.delete({ where: { userId } });
            return { kind: "missing-pending" as const };
          }

          const alreadyProcessed = await tx.processedActivity.findUnique({
            where: { userId_sourceId: { userId, sourceId: analysisId } },
            select: { sourceId: true },
          });
          // Prima dello storico conservavamo soltanto l'hash. Ricaricare uno
          // di quei FIT ricostruisce la riga compatta senza contare di nuovo
          // totali, carico o record.
          const isLegacyReimport =
            alreadyProcessed != null ||
            previousActivity?.sourceId === analysisId;

          const pendingPayload = parsePendingPayload(pending.data);
          const activity = pendingPayload.lastActivityData.activity;
          const trainingLoad = pendingPayload.lastActivityData.training_load;
          const activityDate = parseActivityDate(activity.activityDate);
          const latestArchivedActivity = await tx.activity.findFirst({
            where: { userId },
            orderBy: [{ activityDate: "desc" }, { id: "desc" }],
            select: { id: true, activityDate: true },
          });
          const becomesLatest =
            !latestArchivedActivity ||
            activityDate.getTime() >=
              latestArchivedActivity.activityDate.getTime();
          const activityDistance = requireNonNegativeNumber(
            activity.distance,
            "activity distance",
          );
          const activityDuration = requireNonNegativeNumber(
            activity.duration,
            "activity duration",
          );
          const activityHours = Number((activityDuration / 3600).toFixed(2));
          const belongsToCurrentYear =
            activityDate.getUTCFullYear() === new Date().getUTCFullYear();
          const activityTrainingStress = sanitizeActivityTrainingStress(
            trainingLoad.tss,
          );
          const isAfterLastTrainingStressReset =
            !user.trainingStressResetAt ||
            activityDate.getTime() >= user.trainingStressResetAt.getTime();
          const belongsToCurrentTrainingBlock = user.trainingStressResetAt
            ? isAfterLastTrainingStressReset
            : user.trainingStressStartedAt
              ? activityDate.getTime() >=
                user.trainingStressStartedAt.getTime()
              : becomesLatest;
          const shouldCountInTrainingBlock =
            !isLegacyReimport && belongsToCurrentTrainingBlock;
          const trainingStressIncrement = shouldCountInTrainingBlock
            ? activityTrainingStress
            : 0;
          const activityCountIncrement = shouldCountInTrainingBlock ? 1 : 0;

          if (
            user.trainingStress >
              MAX_POSTGRES_INTEGER - trainingStressIncrement ||
            user.trainingStressActivityCount >
              MAX_POSTGRES_INTEGER - activityCountIncrement
          ) {
            invalidPendingData("training block exceeds supported range");
          }

          const isFirstActivityInBlock =
            user.trainingStressActivityCount === 0 ||
            !user.trainingStressStartedAt;
          const trainingStressStartedAt = shouldCountInTrainingBlock
            ? isFirstActivityInBlock
              ? activityDate
              : minimumDate(user.trainingStressStartedAt, activityDate)
            : user.trainingStressStartedAt;
          const trainingStressLastActivityAt = shouldCountInTrainingBlock
            ? isFirstActivityInBlock
              ? activityDate
              : maximumDate(user.trainingStressLastActivityAt, activityDate)
            : user.trainingStressLastActivityAt;

          let updatedUser = {
            trainingStress: user.trainingStress,
            trainingStressActivityCount: user.trainingStressActivityCount,
            trainingStressStartedAt: user.trainingStressStartedAt,
            trainingStressLastActivityAt:
              user.trainingStressLastActivityAt,
          };

          if (!isLegacyReimport) {
            updatedUser = await tx.user.update({
              where: { id: userId },
              data: {
                yearlyDistanceKm: belongsToCurrentYear
                  ? user.yearlyDistanceKm == null
                    ? activityDistance
                    : { increment: activityDistance }
                  : undefined,
                yearlyHours: belongsToCurrentYear
                  ? user.yearlyHours == null
                    ? activityHours
                    : { increment: activityHours }
                  : undefined,
                trainingStress:
                  user.trainingStress + trainingStressIncrement,
                trainingStressActivityCount:
                  user.trainingStressActivityCount + activityCountIncrement,
                trainingStressStartedAt,
                trainingStressLastActivityAt,
              },
              select: {
                trainingStress: true,
                trainingStressActivityCount: true,
                trainingStressStartedAt: true,
                trainingStressLastActivityAt: true,
              },
            });
          }

          const rawRecordChecks = Array.isArray(
            pendingPayload.lastActivityData.recordChecks,
          )
            ? pendingPayload.lastActivityData.recordChecks
            : [];
          const confirmedRecordChecks = rawRecordChecks.map((record) =>
            isObject(record) ? { ...record } : record,
          );

          for (const rawCheck of confirmedRecordChecks) {
            if (!isObject(rawCheck)) continue;
            if (isLegacyReimport) {
              rawCheck.wouldEnterAt = null;
              continue;
            }

            const metricKey =
              typeof rawCheck.metricKey === "string"
                ? rawCheck.metricKey
                : "";
            const newValue = Number(rawCheck.newValue);
            const metricConfig = RECORD_METRICS.find(
              (metric) => metric.key === metricKey,
            );
            if (!metricConfig || !Number.isFinite(newValue) || newValue <= 0) {
              rawCheck.wouldEnterAt = null;
              continue;
            }

            const model = getModel(metricKey, tx);
            const existing = await model.findMany({
              where: { userId },
              orderBy: { rank: "asc" },
            });
            rawCheck.currentBest = existing[0]
              ? Number(existing[0].value)
              : null;

            const combined = [
              ...existing.map((entry: any) => ({
                value: Number(entry.value),
                entryDate: entry.entryDate,
                description: entry.description,
                isNew: false,
              })),
              {
                value: newValue,
                entryDate: activityDate,
                description: null,
                isNew: true,
              },
            ];

            combined.sort((a, b) => {
              const primaryDiff = metricConfig.lowerIsBetter
                ? a.value - b.value
                : b.value - a.value;
              if (primaryDiff !== 0) return primaryDiff;
              return (
                new Date(b.entryDate).getTime() -
                new Date(a.entryDate).getTime()
              );
            });

            const newTop3 = combined.slice(0, 3);
            const newRank = newTop3.findIndex((entry) => entry.isNew);
            rawCheck.wouldEnterAt = newRank === -1 ? null : newRank + 1;
            if (newRank === -1) continue;

            for (let index = 0; index < newTop3.length; index++) {
              const { isNew: _isNew, ...entry } = newTop3[index]!;
              await model.upsert({
                where: { userId_rank: { userId, rank: index + 1 } },
                update: entry,
                create: { userId, rank: index + 1, ...entry },
              });
            }
          }

          const trainingStressBlock = {
            stress: updatedUser.trainingStress,
            activityCount: updatedUser.trainingStressActivityCount,
            startedAt:
              updatedUser.trainingStressStartedAt?.toISOString() ?? null,
            lastActivityAt:
              updatedUser.trainingStressLastActivityAt?.toISOString() ?? null,
          };

          let archivedData: ReturnType<typeof buildArchivedActivityData>;
          try {
            archivedData = buildArchivedActivityData({
              sourceId: analysisId,
              filename: pending.filename,
              name: activityName,
              perceivedExertion,
              notes: trainingNotes,
              ftpUsed: pendingPayload.ftpUsed,
              anaerobicThresholdUsed:
                pendingPayload.anaerobicThresholdUsed,
              activityData: {
                ...pendingPayload.lastActivityData,
                recordChecks: confirmedRecordChecks,
              },
            });
          } catch (error) {
            if (error instanceof ActivityArchiveValidationError) {
              invalidPendingData(error.message);
            }
            throw error;
          }

          const archivedActivity = await tx.activity.create({
            data: { userId, ...archivedData },
          });
          if (isLegacyReimport) {
            await tx.processedActivity.deleteMany({
              where: {
                userId,
                sourceId: analysisId,
              },
            });
          }
          const storedData = {
            ...pendingPayload.lastActivityData,
            recordChecks: confirmedRecordChecks,
            activity_meta: {
              activityId: archivedActivity.id,
              name: archivedData.name,
              perceivedExertion: archivedData.perceivedExertion,
              trainingNotes: archivedData.notes,
            },
            training_stress_block: trainingStressBlock,
          };
          const now = new Date();

          if (becomesLatest) {
            await tx.lastActivity.upsert({
              where: { userId },
              update: {
                activityId: archivedActivity.id,
                sourceId: analysisId,
                filename: archivedData.filename,
                uploadedAt: now,
                ftpUsed: pendingPayload.ftpUsed,
                anaerobicThresholdUsed:
                  pendingPayload.anaerobicThresholdUsed,
                data: storedData,
                aiAnalysis: Prisma.DbNull,
                aiAnalysisHash: null,
                aiAnalysisStatus: null,
                aiAnalysisModel: null,
                aiAnalysisGeneratedAt: null,
                aiAnalysisStartedAt: null,
                aiAnalysisAttemptCount: 0,
              },
              create: {
                userId,
                activityId: archivedActivity.id,
                sourceId: analysisId,
                filename: archivedData.filename,
                uploadedAt: now,
                ftpUsed: pendingPayload.ftpUsed,
                anaerobicThresholdUsed:
                  pendingPayload.anaerobicThresholdUsed,
                data: storedData,
                aiAnalysis: Prisma.DbNull,
                aiAnalysisHash: null,
                aiAnalysisStatus: null,
                aiAnalysisModel: null,
                aiAnalysisGeneratedAt: null,
                aiAnalysisStartedAt: null,
                aiAnalysisAttemptCount: 0,
              },
            });
          } else if (previousActivity) {
            const previousData = isObject(previousActivity.data)
              ? previousActivity.data
              : {};
            await tx.lastActivity.update({
              where: { userId },
              data: {
                data: {
                  ...previousData,
                  training_stress_block: trainingStressBlock,
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

            if (previousActivity.activityId) {
              await tx.activity.update({
                where: { id: previousActivity.activityId },
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

          await tx.pendingActivity.delete({ where: { userId } });

          return {
            kind: "saved" as const,
            activityId: archivedActivity.id,
            isLatest: becomesLatest,
            legacyReimport: isLegacyReimport,
            ...updatedUser,
          };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5_000,
          timeout: 30_000,
        },
      );

      if (result.kind === "missing-pending") {
        throw createError({
          statusCode: 409,
          statusMessage:
            "This activity analysis has expired or was replaced by a newer upload",
        });
      }
      return {
        success: true,
        analysisId,
        activityId: result.activityId,
        isLatest: result.isLatest,
        duplicate: result.kind === "duplicate-saved",
        restoredLegacyActivity: result.legacyReimport,
        trainingStress: result.trainingStress,
        trainingStressActivityCount: result.trainingStressActivityCount,
        trainingStressStartedAt: result.trainingStressStartedAt,
        trainingStressLastActivityAt: result.trainingStressLastActivityAt,
      };
    } catch (error) {
      if (isTransactionConflict(error)) {
        if (attempt < MAX_TRANSACTION_ATTEMPTS) continue;
        throw createError({
          statusCode: 409,
          message: "Could not save the activity due to a concurrent update",
        });
      }
      throw error;
    }
  }

  throw createError({
    statusCode: 409,
    message: "Could not save the activity",
  });
});
