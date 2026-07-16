-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `weightKg` DECIMAL(5, 2) NULL,
    `ftp` INTEGER NULL,
    `anaerobicThreshold` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activities` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ftpUsed` INTEGER NOT NULL,
    `anaerobicThresholdUsed` INTEGER NOT NULL,
    `distanceKm` DECIMAL(6, 2) NOT NULL,
    `durationSeconds` INTEGER NOT NULL,
    `elevationGainM` INTEGER NOT NULL,
    `averageSpeedKmh` DECIMAL(5, 1) NOT NULL,
    `maxSpeedKmh` DECIMAL(5, 1) NOT NULL,
    `averageCadenceRpm` INTEGER NOT NULL,
    `averageHeartrate` INTEGER NOT NULL,
    `maxHeartrate` INTEGER NOT NULL,
    `averageWatts` INTEGER NOT NULL,
    `maxWatts` INTEGER NOT NULL,
    `normalizedPower` INTEGER NOT NULL,
    `kilojoules` INTEGER NOT NULL,
    `kcalories` INTEGER NOT NULL,
    `intensityFactor` DECIMAL(4, 2) NOT NULL,
    `tss` INTEGER NOT NULL,
    `rawData` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `lowerIsBetter` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `record_types_userId_key_key`(`userId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `record_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recordTypeId` INTEGER NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `entryDate` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `activityId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `activities` ADD CONSTRAINT `activities_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_types` ADD CONSTRAINT `record_types_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_entries` ADD CONSTRAINT `record_entries_recordTypeId_fkey` FOREIGN KEY (`recordTypeId`) REFERENCES `record_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `record_entries` ADD CONSTRAINT `record_entries_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `activities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
