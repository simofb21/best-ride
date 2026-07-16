/*
  Warnings:

  - You are about to drop the `user_records` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `user_records` DROP FOREIGN KEY `user_records_userId_fkey`;

-- DropTable
DROP TABLE `user_records`;

-- CreateTable
CREATE TABLE `record_peak_power` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_peak_power_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_3s` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_3s_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_5s` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_5s_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_10s` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_10s_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_20s` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_20s_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_30s` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_30s_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_1min` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_1min_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_2min` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_2min_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_3min` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_3min_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_5min` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_5min_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_8min` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_8min_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_10min` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_10min_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_12min` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_12min_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_15min` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_15min_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_20min` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_20min_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_30min` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_30min_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_60min` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_60min_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_distance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_distance_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_elevation_gain` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_elevation_gain_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_duration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_duration_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_kilojoules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_kilojoules_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_max_cadence` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_max_cadence_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_max_speed` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_max_speed_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_max_heartrate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_max_heartrate_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_hr_5min` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_hr_5min_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_hr_20min` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_hr_20min_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_hr_1h` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `record_hr_1h_userId_rank_key`(`userId`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `record_peak_power` ADD CONSTRAINT `record_peak_power_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_3s` ADD CONSTRAINT `record_3s_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_5s` ADD CONSTRAINT `record_5s_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_10s` ADD CONSTRAINT `record_10s_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_20s` ADD CONSTRAINT `record_20s_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_30s` ADD CONSTRAINT `record_30s_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_1min` ADD CONSTRAINT `record_1min_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_2min` ADD CONSTRAINT `record_2min_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_3min` ADD CONSTRAINT `record_3min_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_5min` ADD CONSTRAINT `record_5min_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_8min` ADD CONSTRAINT `record_8min_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_10min` ADD CONSTRAINT `record_10min_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_12min` ADD CONSTRAINT `record_12min_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_15min` ADD CONSTRAINT `record_15min_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_20min` ADD CONSTRAINT `record_20min_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_30min` ADD CONSTRAINT `record_30min_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_60min` ADD CONSTRAINT `record_60min_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_distance` ADD CONSTRAINT `record_distance_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_elevation_gain` ADD CONSTRAINT `record_elevation_gain_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_duration` ADD CONSTRAINT `record_duration_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_kilojoules` ADD CONSTRAINT `record_kilojoules_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_max_cadence` ADD CONSTRAINT `record_max_cadence_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_max_speed` ADD CONSTRAINT `record_max_speed_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_max_heartrate` ADD CONSTRAINT `record_max_heartrate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_hr_5min` ADD CONSTRAINT `record_hr_5min_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_hr_20min` ADD CONSTRAINT `record_hr_20min_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_hr_1h` ADD CONSTRAINT `record_hr_1h_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
