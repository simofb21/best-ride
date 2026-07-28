/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "custom_records" DROP CONSTRAINT "custom_records_userId_fkey";

-- DropForeignKey
ALTER TABLE "last_activity" DROP CONSTRAINT "last_activity_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_10min" DROP CONSTRAINT "record_10min_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_10s" DROP CONSTRAINT "record_10s_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_12min" DROP CONSTRAINT "record_12min_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_15min" DROP CONSTRAINT "record_15min_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_1min" DROP CONSTRAINT "record_1min_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_20min" DROP CONSTRAINT "record_20min_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_20s" DROP CONSTRAINT "record_20s_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_2min" DROP CONSTRAINT "record_2min_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_30min" DROP CONSTRAINT "record_30min_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_30s" DROP CONSTRAINT "record_30s_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_3min" DROP CONSTRAINT "record_3min_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_3s" DROP CONSTRAINT "record_3s_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_5min" DROP CONSTRAINT "record_5min_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_5s" DROP CONSTRAINT "record_5s_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_60min" DROP CONSTRAINT "record_60min_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_8min" DROP CONSTRAINT "record_8min_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_distance" DROP CONSTRAINT "record_distance_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_duration" DROP CONSTRAINT "record_duration_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_elevation_gain" DROP CONSTRAINT "record_elevation_gain_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_hr_1h" DROP CONSTRAINT "record_hr_1h_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_hr_20min" DROP CONSTRAINT "record_hr_20min_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_hr_5min" DROP CONSTRAINT "record_hr_5min_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_kilojoules" DROP CONSTRAINT "record_kilojoules_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_max_cadence" DROP CONSTRAINT "record_max_cadence_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_max_heartrate" DROP CONSTRAINT "record_max_heartrate_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_max_speed" DROP CONSTRAINT "record_max_speed_userId_fkey";

-- DropForeignKey
ALTER TABLE "record_peak_power" DROP CONSTRAINT "record_peak_power_userId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "passwordHash",
ADD COLUMN     "privacyAcceptedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerId_key" ON "accounts"("provider", "providerId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "last_activity" ADD CONSTRAINT "last_activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_records" ADD CONSTRAINT "custom_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_peak_power" ADD CONSTRAINT "record_peak_power_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_3s" ADD CONSTRAINT "record_3s_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_5s" ADD CONSTRAINT "record_5s_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_10s" ADD CONSTRAINT "record_10s_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_20s" ADD CONSTRAINT "record_20s_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_30s" ADD CONSTRAINT "record_30s_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_1min" ADD CONSTRAINT "record_1min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_2min" ADD CONSTRAINT "record_2min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_3min" ADD CONSTRAINT "record_3min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_5min" ADD CONSTRAINT "record_5min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_8min" ADD CONSTRAINT "record_8min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_10min" ADD CONSTRAINT "record_10min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_12min" ADD CONSTRAINT "record_12min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_15min" ADD CONSTRAINT "record_15min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_20min" ADD CONSTRAINT "record_20min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_30min" ADD CONSTRAINT "record_30min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_60min" ADD CONSTRAINT "record_60min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_distance" ADD CONSTRAINT "record_distance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_elevation_gain" ADD CONSTRAINT "record_elevation_gain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_duration" ADD CONSTRAINT "record_duration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_kilojoules" ADD CONSTRAINT "record_kilojoules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_max_cadence" ADD CONSTRAINT "record_max_cadence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_max_speed" ADD CONSTRAINT "record_max_speed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_max_heartrate" ADD CONSTRAINT "record_max_heartrate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_hr_5min" ADD CONSTRAINT "record_hr_5min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_hr_20min" ADD CONSTRAINT "record_hr_20min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_hr_1h" ADD CONSTRAINT "record_hr_1h_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
