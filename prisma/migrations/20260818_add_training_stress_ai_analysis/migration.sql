-- AlterTable
ALTER TABLE "users"
ADD COLUMN "trainingStress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "trainingStressActivityCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "trainingStressStartedAt" TIMESTAMP(3),
ADD COLUMN "trainingStressLastActivityAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "last_activity"
ADD COLUMN "sourceId" TEXT,
ADD COLUMN "aiAnalysis" JSONB,
ADD COLUMN "aiAnalysisHash" TEXT,
ADD COLUMN "aiAnalysisStatus" TEXT,
ADD COLUMN "aiAnalysisModel" TEXT,
ADD COLUMN "aiAnalysisGeneratedAt" TIMESTAMP(3),
ADD COLUMN "aiAnalysisStartedAt" TIMESTAMP(3),
ADD COLUMN "aiAnalysisAttemptCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "pending_activities" (
    "userId" INTEGER NOT NULL,
    "sourceId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_activities_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "processed_activities" (
    "userId" INTEGER NOT NULL,
    "sourceId" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_activities_pkey" PRIMARY KEY ("userId", "sourceId")
);

-- AddForeignKey
ALTER TABLE "pending_activities" ADD CONSTRAINT "pending_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processed_activities" ADD CONSTRAINT "processed_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
