/*
  Warnings:

  - You are about to drop the column `customRecords` on the `user_records` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user_records` DROP COLUMN `customRecords`;

-- CreateTable
CREATE TABLE `custom_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `lowerIsBetter` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `entries` JSON NULL,

    UNIQUE INDEX `custom_records_userId_slug_key`(`userId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `custom_records` ADD CONSTRAINT `custom_records_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
