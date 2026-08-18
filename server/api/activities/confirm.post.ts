import { z } from "zod";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../utils/db";

const MAX_POSTGRES_INTEGER = 2_147_483_647;
const MAX_TRANSACTION_ATTEMPTS = 3;
const PENDING_ACTIVITY_TTL_MS = 24 * 60 * 60 * 1000;

const confirmationSchema = z
  .object({
    analysisId: z
      .string()
      .regex(/^[0-9a-f]{64}$/i)
      .transform((value) => value.toLowerCase()),
  })
  .passthrough();

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
  if (Number.isNaN(date.getTime())) invalidPendingData("activity date");
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
      message: "Invalid or missing analysisId",
      data: parsedBody.error.flatten(),
    });
  }

  // Nessun altro dato inviato dal browser viene letto o considerato affidabile.
  const analysisId = parsedBody.data.analysisId;

  for (let attempt = 1; attempt <= MAX_TRANSACTION_ATTEMPTS; attempt++) {
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          const user = await tx.user.findUnique({ where: { id: userId } });
          if (!user) {
            throw createError({ statusCode: 404, message: "User not found" });
          }

          const previousActivity = await tx.lastActivity.findUnique({
            where: { userId },
            select: { sourceId: true },
          });

          // Il retry immediato resta valido anche se il pending è già stato
          // consumato dalla prima conferma completata.
          if (previousActivity?.sourceId === analysisId) {
            await tx.pendingActivity.deleteMany({
              where: { userId, sourceId: analysisId },
            });
            return {
              kind: "duplicate-latest" as const,
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
          if (alreadyProcessed) {
            // Il 409 viene emesso solo dopo il commit, altrimenti questa
            // cancellazione verrebbe annullata insieme alla transazione.
            await tx.pendingActivity.delete({ where: { userId } });
            return { kind: "duplicate-older" as const };
          }

          const pendingPayload = parsePendingPayload(pending.data);
          const activity = pendingPayload.lastActivityData.activity;
          const trainingLoad = pendingPayload.lastActivityData.training_load;
          const activityDate = parseActivityDate(activity.activityDate);
          const activityDistance = requireNonNegativeNumber(
            activity.distance,
            "activity distance",
          );
          const activityDuration = requireNonNegativeNumber(
            activity.duration,
            "activity duration",
          );
          const activityHours = Number((activityDuration / 3600).toFixed(2));
          const activityTrainingStress = sanitizeActivityTrainingStress(
            trainingLoad.tss,
          );

          if (
            user.trainingStress >
              MAX_POSTGRES_INTEGER - activityTrainingStress ||
            user.trainingStressActivityCount >= MAX_POSTGRES_INTEGER
          ) {
            invalidPendingData("training block exceeds supported range");
          }

          const isFirstActivity = user.trainingStressActivityCount === 0;
          const trainingStressStartedAt = isFirstActivity
            ? activityDate
            : minimumDate(user.trainingStressStartedAt, activityDate);
          const trainingStressLastActivityAt = isFirstActivity
            ? activityDate
            : maximumDate(user.trainingStressLastActivityAt, activityDate);

          await tx.processedActivity.create({
            data: { userId, sourceId: analysisId },
          });

          const updatedUser = await tx.user.update({
            where: { id: userId },
            data: {
              yearlyDistanceKm:
                user.yearlyDistanceKm == null
                  ? activityDistance
                  : { increment: activityDistance },
              yearlyHours:
                user.yearlyHours == null
                  ? activityHours
                  : { increment: activityHours },
              trainingStress: user.trainingStress + activityTrainingStress,
              trainingStressActivityCount:
                user.trainingStressActivityCount + 1,
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

          const storedData = {
            ...pendingPayload.lastActivityData,
            recordChecks: confirmedRecordChecks,
            training_stress_block: {
              stress: updatedUser.trainingStress,
              activityCount: updatedUser.trainingStressActivityCount,
              startedAt:
                updatedUser.trainingStressStartedAt?.toISOString() ?? null,
              lastActivityAt:
                updatedUser.trainingStressLastActivityAt?.toISOString() ??
                null,
            },
          };
          const now = new Date();

          await tx.lastActivity.upsert({
            where: { userId },
            update: {
              sourceId: analysisId,
              filename: pending.filename,
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
              sourceId: analysisId,
              filename: pending.filename,
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

          await tx.pendingActivity.delete({ where: { userId } });

          return { kind: "saved" as const, ...updatedUser };
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
      if (result.kind === "duplicate-older") {
        throw createError({
          statusCode: 409,
          statusMessage: "This activity has already been saved",
        });
      }

      return {
        success: true,
        analysisId,
        duplicate: result.kind === "duplicate-latest",
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
