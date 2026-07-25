/*
  Warnings:

  - You are about to drop the column `activityId` on the `record_10min` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_10s` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_12min` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_15min` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_1min` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_20min` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_20s` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_2min` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_30min` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_30s` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_3min` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_3s` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_5min` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_5s` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_60min` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_8min` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_distance` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_duration` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_elevation_gain` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_hr_1h` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_hr_20min` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_hr_5min` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_kilojoules` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_max_cadence` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_max_heartrate` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_max_speed` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `record_peak_power` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `record_10min` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_10s` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_12min` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_15min` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_1min` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_20min` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_20s` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_2min` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_30min` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_30s` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_3min` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_3s` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_5min` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_5s` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_60min` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_8min` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_distance` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_duration` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_elevation_gain` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_hr_1h` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_hr_20min` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_hr_5min` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_kilojoules` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_max_cadence` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_max_heartrate` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_max_speed` DROP COLUMN `activityId`;

-- AlterTable
ALTER TABLE `record_peak_power` DROP COLUMN `activityId`;
