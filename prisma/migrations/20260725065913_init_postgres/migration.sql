-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "weightKg" DECIMAL(5,2),
    "ftp" INTEGER,
    "anaerobicThreshold" INTEGER,
    "yearlyDistanceKm" DECIMAL(8,2),
    "yearlyHours" DECIMAL(6,1),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sex" VARCHAR(1),
    "dateOfBirth" DATE,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "last_activity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ftpUsed" INTEGER NOT NULL,
    "anaerobicThresholdUsed" INTEGER NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "last_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_records" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "lowerIsBetter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entries" JSONB,

    CONSTRAINT "custom_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_peak_power" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_peak_power_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_3s" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_3s_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_5s" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_5s_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_10s" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_10s_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_20s" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_20s_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_30s" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_30s_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_1min" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_1min_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_2min" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_2min_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_3min" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_3min_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_5min" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_5min_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_8min" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_8min_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_10min" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_10min_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_12min" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_12min_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_15min" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_15min_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_20min" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_20min_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_30min" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_30min_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_60min" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_60min_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_distance" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_distance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_elevation_gain" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_elevation_gain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_duration" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_duration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_kilojoules" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_kilojoules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_max_cadence" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_max_cadence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_max_speed" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_max_speed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_max_heartrate" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_max_heartrate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_hr_5min" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_hr_5min_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_hr_20min" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_hr_20min_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_hr_1h" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "entryDate" DATE NOT NULL,
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_hr_1h_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "last_activity_userId_key" ON "last_activity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_records_userId_slug_key" ON "custom_records"("userId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "record_peak_power_userId_rank_key" ON "record_peak_power"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_3s_userId_rank_key" ON "record_3s"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_5s_userId_rank_key" ON "record_5s"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_10s_userId_rank_key" ON "record_10s"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_20s_userId_rank_key" ON "record_20s"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_30s_userId_rank_key" ON "record_30s"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_1min_userId_rank_key" ON "record_1min"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_2min_userId_rank_key" ON "record_2min"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_3min_userId_rank_key" ON "record_3min"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_5min_userId_rank_key" ON "record_5min"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_8min_userId_rank_key" ON "record_8min"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_10min_userId_rank_key" ON "record_10min"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_12min_userId_rank_key" ON "record_12min"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_15min_userId_rank_key" ON "record_15min"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_20min_userId_rank_key" ON "record_20min"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_30min_userId_rank_key" ON "record_30min"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_60min_userId_rank_key" ON "record_60min"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_distance_userId_rank_key" ON "record_distance"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_elevation_gain_userId_rank_key" ON "record_elevation_gain"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_duration_userId_rank_key" ON "record_duration"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_kilojoules_userId_rank_key" ON "record_kilojoules"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_max_cadence_userId_rank_key" ON "record_max_cadence"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_max_speed_userId_rank_key" ON "record_max_speed"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_max_heartrate_userId_rank_key" ON "record_max_heartrate"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_hr_5min_userId_rank_key" ON "record_hr_5min"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_hr_20min_userId_rank_key" ON "record_hr_20min"("userId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "record_hr_1h_userId_rank_key" ON "record_hr_1h"("userId", "rank");

-- AddForeignKey
ALTER TABLE "last_activity" ADD CONSTRAINT "last_activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_records" ADD CONSTRAINT "custom_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_peak_power" ADD CONSTRAINT "record_peak_power_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_3s" ADD CONSTRAINT "record_3s_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_5s" ADD CONSTRAINT "record_5s_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_10s" ADD CONSTRAINT "record_10s_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_20s" ADD CONSTRAINT "record_20s_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_30s" ADD CONSTRAINT "record_30s_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_1min" ADD CONSTRAINT "record_1min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_2min" ADD CONSTRAINT "record_2min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_3min" ADD CONSTRAINT "record_3min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_5min" ADD CONSTRAINT "record_5min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_8min" ADD CONSTRAINT "record_8min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_10min" ADD CONSTRAINT "record_10min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_12min" ADD CONSTRAINT "record_12min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_15min" ADD CONSTRAINT "record_15min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_20min" ADD CONSTRAINT "record_20min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_30min" ADD CONSTRAINT "record_30min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_60min" ADD CONSTRAINT "record_60min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_distance" ADD CONSTRAINT "record_distance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_elevation_gain" ADD CONSTRAINT "record_elevation_gain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_duration" ADD CONSTRAINT "record_duration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_kilojoules" ADD CONSTRAINT "record_kilojoules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_max_cadence" ADD CONSTRAINT "record_max_cadence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_max_speed" ADD CONSTRAINT "record_max_speed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_max_heartrate" ADD CONSTRAINT "record_max_heartrate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_hr_5min" ADD CONSTRAINT "record_hr_5min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_hr_20min" ADD CONSTRAINT "record_hr_20min_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_hr_1h" ADD CONSTRAINT "record_hr_1h_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
