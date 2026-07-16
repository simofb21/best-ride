/*
  Warnings:

  - You are about to drop the `activities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `record_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `record_types` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `activities` DROP FOREIGN KEY `activities_userId_fkey`;

-- DropForeignKey
ALTER TABLE `record_entries` DROP FOREIGN KEY `record_entries_activityId_fkey`;

-- DropForeignKey
ALTER TABLE `record_entries` DROP FOREIGN KEY `record_entries_recordTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `record_types` DROP FOREIGN KEY `record_types_userId_fkey`;

-- DropTable
DROP TABLE `activities`;

-- DropTable
DROP TABLE `record_entries`;

-- DropTable
DROP TABLE `record_types`;

-- CreateTable
CREATE TABLE `last_activity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ftpUsed` INTEGER NOT NULL,
    `anaerobicThresholdUsed` INTEGER NOT NULL,
    `data` JSON NOT NULL,

    UNIQUE INDEX `last_activity_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `peakPower` JSON NULL,
    `power3s` JSON NULL,
    `power5s` JSON NULL,
    `power10s` JSON NULL,
    `power20s` JSON NULL,
    `power30s` JSON NULL,
    `power1min` JSON NULL,
    `power2min` JSON NULL,
    `power3min` JSON NULL,
    `power5min` JSON NULL,
    `power8min` JSON NULL,
    `power10min` JSON NULL,
    `power12min` JSON NULL,
    `power15min` JSON NULL,
    `power20min` JSON NULL,
    `power30min` JSON NULL,
    `power60min` JSON NULL,
    `averageWatts` JSON NULL,
    `normalizedPower` JSON NULL,
    `averageSpeed` JSON NULL,
    `maxSpeed` JSON NULL,
    `distance` JSON NULL,
    `duration` JSON NULL,
    `elevationGain` JSON NULL,
    `tss` JSON NULL,
    `customRecords` JSON NULL,

    UNIQUE INDEX `user_records_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `last_activity` ADD CONSTRAINT `last_activity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_records` ADD CONSTRAINT `user_records_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
