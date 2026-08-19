BEGIN;

-- CreateTable
CREATE TABLE "activities" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "sourceId" VARCHAR(64) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "perceivedExertion" SMALLINT,
    "notes" VARCHAR(800),
    "durationSeconds" INTEGER NOT NULL,
    "distanceMeters" INTEGER NOT NULL,
    "elevationGainMeters" INTEGER NOT NULL,
    "avgSpeedDeciKmh" INTEGER,
    "maxSpeedDeciKmh" INTEGER,
    "avgPowerWatts" INTEGER,
    "maxPowerWatts" INTEGER,
    "normalizedPowerWatts" INTEGER,
    "avgCadenceRpm" INTEGER,
    "maxCadenceRpm" INTEGER,
    "avgHeartRateBpm" INTEGER,
    "maxHeartRateBpm" INTEGER,
    "kilojoules" INTEGER,
    "caloriesKcal" INTEGER,
    "avgTemperatureDeciCelsius" INTEGER,
    "trainingStress" INTEGER,
    "intensityFactorMilli" INTEGER,
    "ftpUsed" INTEGER NOT NULL,
    "anaerobicThresholdUsed" INTEGER NOT NULL,
    "weightDeciKg" SMALLINT,
    "powerCurveWatts" INTEGER[] NOT NULL,
    "powerZoneSeconds" INTEGER[] NOT NULL,
    "heartRateZoneSeconds" INTEGER[] NOT NULL,
    "laps" JSONB,
    "recordAchievements" JSONB,
    "trendFeatures" JSONB,
    "sensorMask" SMALLINT NOT NULL DEFAULT 0,
    "calculationFlags" SMALLINT NOT NULL DEFAULT 0,
    "archiveSchemaVersion" SMALLINT NOT NULL DEFAULT 1,
    "aiAnalysis" JSONB,
    "aiAnalysisHash" TEXT,
    "aiAnalysisStatus" TEXT,
    "aiAnalysisModel" TEXT,
    "aiAnalysisGeneratedAt" TIMESTAMP(3),
    "aiAnalysisStartedAt" TIMESTAMP(3),
    "aiAnalysisAttemptCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "activities_perceivedExertion_check"
        CHECK ("perceivedExertion" IS NULL OR "perceivedExertion" BETWEEN 1 AND 10),
    CONSTRAINT "activities_powerCurveWatts_cardinality_check"
        CHECK (CARDINALITY("powerCurveWatts") = 17),
    CONSTRAINT "activities_powerZoneSeconds_cardinality_check"
        CHECK (CARDINALITY("powerZoneSeconds") = 7),
    CONSTRAINT "activities_heartRateZoneSeconds_cardinality_check"
        CHECK (CARDINALITY("heartRateZoneSeconds") = 5),
    CONSTRAINT "activities_sensorMask_check"
        CHECK ("sensorMask" BETWEEN 0 AND 31),
    CONSTRAINT "activities_calculationFlags_check"
        CHECK ("calculationFlags" BETWEEN 0 AND 3),
    CONSTRAINT "activities_archiveSchemaVersion_check"
        CHECK ("archiveSchemaVersion" >= 1),
    CONSTRAINT "activities_laps_check"
        CHECK (
            "laps" IS NULL OR CASE
                WHEN JSONB_TYPEOF("laps") = 'array'
                    THEN JSONB_ARRAY_LENGTH("laps") <= 64
                ELSE FALSE
            END
        )
);

-- AlterTable
ALTER TABLE "last_activity" ADD COLUMN "activityId" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "trainingStressResetAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "activities_userId_sourceId_key"
ON "activities"("userId", "sourceId");

-- CreateIndex
CREATE INDEX "activities_userId_activityDate_idx"
ON "activities"("userId", "activityDate" DESC);

-- CreateIndex
CREATE INDEX "activities_userId_name_idx"
ON "activities"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "last_activity_activityId_key"
ON "last_activity"("activityId");

-- AddForeignKey
ALTER TABLE "activities"
ADD CONSTRAINT "activities_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "last_activity"
ADD CONSTRAINT "last_activity_activityId_fkey"
FOREIGN KEY ("activityId") REFERENCES "activities"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- archiveSchemaVersion = 1 layouts:
-- powerCurveWatts:
-- [peak, 3s, 5s, 10s, 20s, 30s, 1m, 2m, 3m, 5m, 8m, 10m,
--  12m, 15m, 20m, 30m, 60m]. Zero means that a window was unavailable.
-- powerZoneSeconds is fixed Z1..Z7; heartRateZoneSeconds is fixed Z1..Z5.
-- Zero means that no duration was available for that zone.
-- laps tuples:
-- [lapNumber, durationSeconds, distanceMeters, avgSpeedDeciKmh,
--  avgPowerWatts, avgCadenceRpm, avgHeartRateBpm].
-- At most 64 laps are stored; larger sets are sampled evenly while retaining
-- the first and final valid lap. Missing optional lap metrics are JSON null.
-- recordAchievements tuples:
-- [metricKey, rank, newValue, previousBest]. Only actual top-three entries
-- are archived; metric metadata and units are defined by metricKey.
-- sensorMask: 1=power, 2=heart rate, 4=cadence, 8=temperature, 16=GPS.
-- calculationFlags: 1=FTP fallback, 2=anaerobic-threshold fallback.

-- Backfill the sole retained legacy activity per user. The old JSON remains
-- untouched in last_activity for compatibility. Invalid/missing optional JSON
-- values become NULL (or zero in fixed positional arrays); an invalid activity
-- date safely falls back to uploadedAt.
DO $activity_history_backfill$
DECLARE
    legacy RECORD;
    activity_payload JSONB;
    training_load_payload JSONB;
    analysis_profile_payload JSONB;
    calculation_context_payload JSONB;
    fallback_activity_date TIMESTAMP(3);
    parsed_activity_date TIMESTAMP(3);
    normalized_source_id VARCHAR(64);
    history_id INTEGER;
    power_curve INTEGER[];
    power_zones INTEGER[];
    heart_rate_zones INTEGER[];
    compact_laps JSONB;
    achievements JSONB;
    sensor_mask SMALLINT;
    calculation_flags SMALLINT;
BEGIN
    FOR legacy IN
        SELECT
            la."id" AS last_id,
            la."userId" AS user_id,
            la."filename" AS filename,
            la."uploadedAt" AS uploaded_at,
            la."ftpUsed" AS ftp_used,
            la."anaerobicThresholdUsed" AS anaerobic_threshold_used,
            la."data" AS archive_data,
            la."sourceId" AS source_id,
            la."aiAnalysis" AS ai_analysis,
            la."aiAnalysisHash" AS ai_analysis_hash,
            la."aiAnalysisStatus" AS ai_analysis_status,
            la."aiAnalysisModel" AS ai_analysis_model,
            la."aiAnalysisGeneratedAt" AS ai_analysis_generated_at,
            la."aiAnalysisStartedAt" AS ai_analysis_started_at,
            la."aiAnalysisAttemptCount" AS ai_analysis_attempt_count
        FROM "last_activity" la
        WHERE la."activityId" IS NULL
    LOOP
        activity_payload := CASE
            WHEN jsonb_typeof(legacy.archive_data -> 'activity') = 'object'
                THEN legacy.archive_data -> 'activity'
            ELSE '{}'::JSONB
        END;
        training_load_payload := CASE
            WHEN jsonb_typeof(legacy.archive_data -> 'training_load') = 'object'
                THEN legacy.archive_data -> 'training_load'
            ELSE '{}'::JSONB
        END;
        analysis_profile_payload := CASE
            WHEN jsonb_typeof(legacy.archive_data -> 'analysis_profile') = 'object'
                THEN legacy.archive_data -> 'analysis_profile'
            ELSE '{}'::JSONB
        END;
        calculation_context_payload := CASE
            WHEN jsonb_typeof(legacy.archive_data -> 'calculation_context') = 'object'
                THEN legacy.archive_data -> 'calculation_context'
            ELSE '{}'::JSONB
        END;

        fallback_activity_date := CASE
            WHEN legacy.uploaded_at BETWEEN TIMESTAMP '1989-12-31 00:00:00'
                 AND (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') + INTERVAL '24 hours'
                THEN legacy.uploaded_at
            ELSE CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
        END;
        parsed_activity_date := fallback_activity_date;
        BEGIN
            IF jsonb_typeof(activity_payload -> 'activityDate') = 'string' THEN
                parsed_activity_date :=
                    (activity_payload ->> 'activityDate')::TIMESTAMPTZ
                    AT TIME ZONE 'UTC';
                IF parsed_activity_date < TIMESTAMP '1989-12-31 00:00:00'
                   OR parsed_activity_date >
                      (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') + INTERVAL '24 hours' THEN
                    parsed_activity_date := fallback_activity_date;
                END IF;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            parsed_activity_date := fallback_activity_date;
        END;

        IF legacy.source_id IS NOT NULL
           AND legacy.source_id ~ '^[0-9A-Fa-f]{64}$' THEN
            normalized_source_id := LOWER(legacy.source_id);
        ELSE
            -- Preserve every legacy row even before source hashes existed.
            normalized_source_id :=
                MD5('best-ride-legacy-a:' || legacy.user_id::TEXT || ':' || legacy.last_id::TEXT) ||
                MD5('best-ride-legacy-b:' || legacy.user_id::TEXT || ':' || legacy.last_id::TEXT);
        END IF;

        SELECT COALESCE(
            ARRAY_AGG(
                CASE
                    WHEN jsonb_typeof(legacy.archive_data #> metric.path) = 'number'
                        THEN CASE
                            WHEN (legacy.archive_data #>> metric.path)::NUMERIC > 0
                                 AND (legacy.archive_data #>> metric.path)::NUMERIC <= 32767
                                 AND ROUND((legacy.archive_data #>> metric.path)::NUMERIC) > 0
                                THEN ROUND(
                                    (legacy.archive_data #>> metric.path)::NUMERIC
                                )::INTEGER
                            ELSE 0
                        END
                    ELSE 0
                END
                ORDER BY metric.position
            ),
            ARRAY[]::INTEGER[]
        )
        INTO power_curve
        FROM (VALUES
            (1,  ARRAY['power_records', '0', 'short_intervals', 'peak_power']::TEXT[]),
            (2,  ARRAY['power_records', '0', 'short_intervals', '3s_power']::TEXT[]),
            (3,  ARRAY['power_records', '0', 'short_intervals', '5s_power']::TEXT[]),
            (4,  ARRAY['power_records', '0', 'short_intervals', '10s_power']::TEXT[]),
            (5,  ARRAY['power_records', '0', 'short_intervals', '20s_power']::TEXT[]),
            (6,  ARRAY['power_records', '0', 'short_intervals', '30s_power']::TEXT[]),
            (7,  ARRAY['power_records', '0', 'short_intervals', '1min_power']::TEXT[]),
            (8,  ARRAY['power_records', '0', 'short_intervals', '2min_power']::TEXT[]),
            (9,  ARRAY['power_records', '0', 'short_intervals', '3min_power']::TEXT[]),
            (10, ARRAY['power_records', '1', 'middle_intervals', '5min_power']::TEXT[]),
            (11, ARRAY['power_records', '1', 'middle_intervals', '8min_power']::TEXT[]),
            (12, ARRAY['power_records', '1', 'middle_intervals', '10min_power']::TEXT[]),
            (13, ARRAY['power_records', '1', 'middle_intervals', '12min_power']::TEXT[]),
            (14, ARRAY['power_records', '2', 'long_intervals', '15min_power']::TEXT[]),
            (15, ARRAY['power_records', '2', 'long_intervals', '20min_power']::TEXT[]),
            (16, ARRAY['power_records', '2', 'long_intervals', '30min_power']::TEXT[]),
            (17, ARRAY['power_records', '2', 'long_intervals', '60min_power']::TEXT[])
        ) AS metric(position, path);

        SELECT COALESCE(
            ARRAY_AGG(
                CASE
                    WHEN jsonb_typeof(
                        legacy.archive_data -> 'powerZoneTime' -> zone.position -> 'seconds'
                    ) = 'number'
                        THEN CASE
                            WHEN (
                                legacy.archive_data -> 'powerZoneTime' -> zone.position ->> 'seconds'
                            )::NUMERIC BETWEEN 0 AND 2147483647
                                THEN ROUND((
                                    legacy.archive_data -> 'powerZoneTime' -> zone.position ->> 'seconds'
                                )::NUMERIC)::INTEGER
                            ELSE 0
                        END
                    ELSE 0
                END
                ORDER BY zone.position
            ),
            ARRAY[]::INTEGER[]
        )
        INTO power_zones
        FROM GENERATE_SERIES(0, 6) AS zone(position);

        SELECT COALESCE(
            ARRAY_AGG(
                CASE
                    WHEN jsonb_typeof(
                        legacy.archive_data -> 'heartRateZoneTime' -> zone.position -> 'seconds'
                    ) = 'number'
                        THEN CASE
                            WHEN (
                                legacy.archive_data -> 'heartRateZoneTime' -> zone.position ->> 'seconds'
                            )::NUMERIC BETWEEN 0 AND 2147483647
                                THEN ROUND((
                                    legacy.archive_data -> 'heartRateZoneTime' -> zone.position ->> 'seconds'
                                )::NUMERIC)::INTEGER
                            ELSE 0
                        END
                    ELSE 0
                END
                ORDER BY zone.position
            ),
            ARRAY[]::INTEGER[]
        )
        INTO heart_rate_zones
        FROM GENERATE_SERIES(0, 4) AS zone(position);

        WITH numbered_laps AS (
            SELECT
                lap.position,
                ROW_NUMBER() OVER (ORDER BY lap.position) AS compact_position,
                COUNT(*) OVER () AS compact_count,
                CASE
                    WHEN jsonb_typeof(lap.value -> 'lapNumber') = 'number'
                        THEN (lap.value ->> 'lapNumber')::NUMERIC
                    ELSE NULL
                END AS lap_number_value,
                CASE
                    WHEN jsonb_typeof(lap.value -> 'durationSeconds') = 'number'
                        THEN (lap.value ->> 'durationSeconds')::NUMERIC
                    ELSE NULL
                END AS duration_value,
                CASE
                    WHEN jsonb_typeof(lap.value -> 'distanceKm') = 'number'
                        THEN (lap.value ->> 'distanceKm')::NUMERIC
                    ELSE NULL
                END AS distance_value,
                CASE
                    WHEN jsonb_typeof(lap.value -> 'avgSpeedKmh') = 'number'
                        THEN (lap.value ->> 'avgSpeedKmh')::NUMERIC
                    ELSE NULL
                END AS speed_value,
                CASE
                    WHEN jsonb_typeof(lap.value -> 'avgPowerWatts') = 'number'
                        THEN (lap.value ->> 'avgPowerWatts')::NUMERIC
                    ELSE NULL
                END AS power_value,
                CASE
                    WHEN jsonb_typeof(lap.value -> 'avgCadence') = 'number'
                        THEN (lap.value ->> 'avgCadence')::NUMERIC
                    ELSE NULL
                END AS cadence_value,
                CASE
                    WHEN jsonb_typeof(lap.value -> 'avgHeartRate') = 'number'
                        THEN (lap.value ->> 'avgHeartRate')::NUMERIC
                    ELSE NULL
                END AS heart_rate_value
            FROM JSONB_ARRAY_ELEMENTS(
                CASE
                    WHEN jsonb_typeof(legacy.archive_data -> 'laps') = 'array'
                        THEN legacy.archive_data -> 'laps'
                    ELSE '[]'::JSONB
                END
            ) WITH ORDINALITY AS lap(value, position)
            WHERE jsonb_typeof(lap.value) = 'object'
        ),
        selected_laps AS (
            SELECT lap.*
            FROM numbered_laps lap
            WHERE lap.compact_count <= 64
               OR lap.compact_position IN (
                    SELECT 1 + ROUND(
                        sample.position * (lap.compact_count - 1)::NUMERIC / 63
                    )::BIGINT
                    FROM GENERATE_SERIES(0, 63) AS sample(position)
               )
        )
        SELECT COALESCE(
            JSONB_AGG(
                JSONB_BUILD_ARRAY(
                    CASE
                        WHEN lap.lap_number_value > 0
                             AND lap.lap_number_value <= 2147483647
                             AND ROUND(lap.lap_number_value) > 0
                            THEN ROUND(lap.lap_number_value)::INTEGER
                        ELSE LEAST(lap.position, 2147483647)::INTEGER
                    END,
                    CASE
                        WHEN lap.duration_value > 0
                             AND lap.duration_value <= 2147483647
                             AND ROUND(lap.duration_value) > 0
                            THEN ROUND(lap.duration_value)::INTEGER
                        ELSE NULL
                    END,
                    CASE
                        WHEN lap.distance_value > 0
                             AND ROUND(lap.distance_value * 1000)
                                 BETWEEN 1 AND 2147483647
                            THEN ROUND(lap.distance_value * 1000)::INTEGER
                        ELSE NULL
                    END,
                    CASE
                        WHEN lap.speed_value > 0
                             AND ROUND(lap.speed_value * 10) BETWEEN 1 AND 32767
                            THEN ROUND(lap.speed_value * 10)::INTEGER
                        ELSE NULL
                    END,
                    CASE
                        WHEN lap.power_value > 0
                             AND lap.power_value <= 32767
                             AND ROUND(lap.power_value) > 0
                            THEN ROUND(lap.power_value)::INTEGER
                        ELSE NULL
                    END,
                    CASE
                        WHEN lap.cadence_value > 0
                             AND lap.cadence_value <= 1000
                             AND ROUND(lap.cadence_value) > 0
                            THEN ROUND(lap.cadence_value)::INTEGER
                        ELSE NULL
                    END,
                    CASE
                        WHEN lap.heart_rate_value > 0
                             AND lap.heart_rate_value <= 300
                             AND ROUND(lap.heart_rate_value) > 0
                            THEN ROUND(lap.heart_rate_value)::INTEGER
                        ELSE NULL
                    END
                )
                ORDER BY lap.position
            ),
            '[]'::JSONB
        )
        INTO compact_laps
        FROM selected_laps lap;

        WITH achievement_values AS (
            SELECT
                achievement.position,
                CASE
                    WHEN jsonb_typeof(achievement.value -> 'metricKey') = 'string'
                        THEN LOWER(BTRIM(achievement.value ->> 'metricKey'))
                    ELSE NULL
                END AS metric_key,
                CASE
                    WHEN jsonb_typeof(achievement.value -> 'wouldEnterAt') = 'number'
                        THEN (achievement.value ->> 'wouldEnterAt')::NUMERIC
                    ELSE NULL
                END AS rank_value,
                CASE
                    WHEN jsonb_typeof(achievement.value -> 'newValue') = 'number'
                        THEN (achievement.value ->> 'newValue')::NUMERIC
                    ELSE NULL
                END AS new_value,
                CASE
                    WHEN jsonb_typeof(achievement.value -> 'currentBest') = 'number'
                        THEN (achievement.value ->> 'currentBest')::NUMERIC
                    ELSE NULL
                END AS previous_best
            FROM JSONB_ARRAY_ELEMENTS(
                CASE
                    WHEN jsonb_typeof(legacy.archive_data -> 'recordChecks') = 'array'
                        THEN legacy.archive_data -> 'recordChecks'
                    ELSE '[]'::JSONB
                END
            ) WITH ORDINALITY AS achievement(value, position)
            WHERE jsonb_typeof(achievement.value) = 'object'
        ),
        valid_achievements AS (
            SELECT DISTINCT ON (achievement.metric_key)
                achievement.*
            FROM achievement_values achievement
            WHERE achievement.metric_key ~ '^[a-z0-9_]{1,50}$'
              AND achievement.rank_value BETWEEN 1 AND 3
              AND achievement.new_value > 0
              AND achievement.new_value <= 100000
            ORDER BY achievement.metric_key, achievement.position
        )
        SELECT COALESCE(
            JSONB_AGG(
                JSONB_BUILD_ARRAY(
                    achievement.metric_key,
                    ROUND(achievement.rank_value)::INTEGER,
                    ROUND(achievement.new_value, 2),
                    CASE
                        WHEN achievement.previous_best > 0
                             AND achievement.previous_best <= 100000
                            THEN ROUND(achievement.previous_best, 2)
                        ELSE NULL
                    END
                )
                ORDER BY achievement.position
            ),
            '[]'::JSONB
        )
        INTO achievements
        FROM valid_achievements achievement;

        sensor_mask := 0;
        IF EXISTS (SELECT 1 FROM UNNEST(power_curve) AS watts WHERE watts > 0)
           OR EXISTS (SELECT 1 FROM UNNEST(power_zones) AS seconds WHERE seconds > 0)
           OR EXISTS (
                SELECT 1
                FROM JSONB_ARRAY_ELEMENTS(compact_laps) AS lap(value)
                WHERE jsonb_typeof(lap.value -> 4) = 'number'
           )
           OR (CASE
                WHEN jsonb_typeof(activity_payload -> 'average_watts') = 'number'
                    THEN (activity_payload ->> 'average_watts')::NUMERIC > 0
                         AND (activity_payload ->> 'average_watts')::NUMERIC <= 32767
                         AND ROUND((activity_payload ->> 'average_watts')::NUMERIC) > 0
                ELSE FALSE
              END)
           OR (CASE
                WHEN jsonb_typeof(activity_payload -> 'max_watts') = 'number'
                    THEN (activity_payload ->> 'max_watts')::NUMERIC > 0
                         AND (activity_payload ->> 'max_watts')::NUMERIC <= 32767
                         AND ROUND((activity_payload ->> 'max_watts')::NUMERIC) > 0
                ELSE FALSE
              END)
           OR (CASE
                WHEN jsonb_typeof(activity_payload -> 'normalized_power') = 'number'
                    THEN (activity_payload ->> 'normalized_power')::NUMERIC > 0
                         AND (activity_payload ->> 'normalized_power')::NUMERIC <= 32767
                         AND ROUND((activity_payload ->> 'normalized_power')::NUMERIC) > 0
                ELSE FALSE
              END) THEN
            sensor_mask := sensor_mask | 1;
        END IF;
        IF EXISTS (SELECT 1 FROM UNNEST(heart_rate_zones) AS seconds WHERE seconds > 0)
           OR EXISTS (
                SELECT 1
                FROM JSONB_ARRAY_ELEMENTS(compact_laps) AS lap(value)
                WHERE jsonb_typeof(lap.value -> 6) = 'number'
           )
           OR (CASE
                WHEN jsonb_typeof(activity_payload -> 'average_heartrate') = 'number'
                    THEN (activity_payload ->> 'average_heartrate')::NUMERIC > 0
                         AND (activity_payload ->> 'average_heartrate')::NUMERIC <= 300
                         AND ROUND((activity_payload ->> 'average_heartrate')::NUMERIC) > 0
                ELSE FALSE
              END)
           OR (CASE
                WHEN jsonb_typeof(activity_payload -> 'max_heartrate') = 'number'
                    THEN (activity_payload ->> 'max_heartrate')::NUMERIC > 0
                         AND (activity_payload ->> 'max_heartrate')::NUMERIC <= 300
                         AND ROUND((activity_payload ->> 'max_heartrate')::NUMERIC) > 0
                ELSE FALSE
              END) THEN
            sensor_mask := sensor_mask | 2;
        END IF;
        IF EXISTS (
                SELECT 1
                FROM JSONB_ARRAY_ELEMENTS(compact_laps) AS lap(value)
                WHERE jsonb_typeof(lap.value -> 5) = 'number'
           )
           OR (CASE
                WHEN jsonb_typeof(activity_payload -> 'average_cadence') = 'number'
                    THEN (activity_payload ->> 'average_cadence')::NUMERIC > 0
                         AND (activity_payload ->> 'average_cadence')::NUMERIC <= 1000
                         AND ROUND((activity_payload ->> 'average_cadence')::NUMERIC) > 0
                ELSE FALSE
              END)
           OR (CASE
                WHEN jsonb_typeof(activity_payload -> 'max_cadence') = 'number'
                    THEN (activity_payload ->> 'max_cadence')::NUMERIC > 0
                         AND (activity_payload ->> 'max_cadence')::NUMERIC <= 1000
                         AND ROUND((activity_payload ->> 'max_cadence')::NUMERIC) > 0
                ELSE FALSE
              END) THEN
            sensor_mask := sensor_mask | 4;
        END IF;
        IF jsonb_typeof(activity_payload -> 'average_temperature') = 'number' THEN
            sensor_mask := sensor_mask | 8;
        END IF;
        IF (CASE
                WHEN jsonb_typeof(legacy.archive_data -> 'gpsTrackPolyline') = 'string'
                    THEN LENGTH(legacy.archive_data ->> 'gpsTrackPolyline') > 0
                ELSE FALSE
           END)
           OR (CASE
                WHEN jsonb_typeof(legacy.archive_data -> 'gpsTrack') = 'array'
                    THEN JSONB_ARRAY_LENGTH(legacy.archive_data -> 'gpsTrack') > 0
                ELSE FALSE
              END) THEN
            sensor_mask := sensor_mask | 16;
        END IF;

        calculation_flags := 0;
        IF jsonb_typeof(calculation_context_payload -> 'ftpFallback') = 'boolean'
           AND calculation_context_payload ->> 'ftpFallback' = 'true' THEN
            calculation_flags := calculation_flags | 1;
        END IF;
        IF jsonb_typeof(
            calculation_context_payload -> 'anaerobicThresholdFallback'
        ) = 'boolean'
           AND calculation_context_payload ->> 'anaerobicThresholdFallback' = 'true' THEN
            calculation_flags := calculation_flags | 2;
        END IF;

        history_id := NULL;
        INSERT INTO "activities" (
            "userId",
            "sourceId",
            "name",
            "filename",
            "activityDate",
            "uploadedAt",
            "perceivedExertion",
            "notes",
            "durationSeconds",
            "distanceMeters",
            "elevationGainMeters",
            "avgSpeedDeciKmh",
            "maxSpeedDeciKmh",
            "avgPowerWatts",
            "maxPowerWatts",
            "normalizedPowerWatts",
            "avgCadenceRpm",
            "maxCadenceRpm",
            "avgHeartRateBpm",
            "maxHeartRateBpm",
            "kilojoules",
            "caloriesKcal",
            "avgTemperatureDeciCelsius",
            "trainingStress",
            "intensityFactorMilli",
            "ftpUsed",
            "anaerobicThresholdUsed",
            "weightDeciKg",
            "powerCurveWatts",
            "powerZoneSeconds",
            "heartRateZoneSeconds",
            "laps",
            "recordAchievements",
            "trendFeatures",
            "sensorMask",
            "calculationFlags",
            "archiveSchemaVersion",
            "aiAnalysis",
            "aiAnalysisHash",
            "aiAnalysisStatus",
            "aiAnalysisModel",
            "aiAnalysisGeneratedAt",
            "aiAnalysisStartedAt",
            "aiAnalysisAttemptCount"
        ) VALUES (
            legacy.user_id,
            normalized_source_id,
            LEFT(
                COALESCE(
                    NULLIF(BTRIM(REGEXP_REPLACE(legacy.filename, '\.(fit|zip)$', '', 'i')), ''),
                    'Activity'
                ),
                120
            ),
            LEFT(COALESCE(NULLIF(legacy.filename, ''), 'activity.fit'), 255),
            parsed_activity_date,
            legacy.uploaded_at,
            NULL,
            NULL,
            CASE
                WHEN jsonb_typeof(activity_payload -> 'duration') = 'number'
                    THEN CASE
                        WHEN (activity_payload ->> 'duration')::NUMERIC
                             BETWEEN 0 AND 2147483647
                            THEN ROUND(
                                (activity_payload ->> 'duration')::NUMERIC
                            )::INTEGER
                        ELSE 0
                    END
                ELSE 0
            END,
            CASE
                WHEN jsonb_typeof(activity_payload -> 'distance') = 'number'
                    THEN CASE
                        WHEN (activity_payload ->> 'distance')::NUMERIC * 1000
                             BETWEEN 0 AND 2147483647
                            THEN ROUND(
                                (activity_payload ->> 'distance')::NUMERIC * 1000
                            )::INTEGER
                        ELSE 0
                    END
                ELSE 0
            END,
            CASE
                WHEN jsonb_typeof(activity_payload -> 'elevation_gain') = 'number'
                    THEN CASE
                        WHEN (activity_payload ->> 'elevation_gain')::NUMERIC
                             BETWEEN 0 AND 2147483647
                            THEN ROUND(
                                (activity_payload ->> 'elevation_gain')::NUMERIC
                            )::INTEGER
                        ELSE 0
                    END
                ELSE 0
            END,
            CASE
                WHEN jsonb_typeof(activity_payload -> 'average_speed') = 'number'
                    THEN CASE
                        WHEN (activity_payload ->> 'average_speed')::NUMERIC > 0
                             AND ROUND(
                                 (activity_payload ->> 'average_speed')::NUMERIC * 10
                             ) BETWEEN 1 AND 32767
                            THEN ROUND(
                                (activity_payload ->> 'average_speed')::NUMERIC * 10
                            )::INTEGER
                        ELSE NULL
                    END
                ELSE NULL
            END,
            CASE
                WHEN jsonb_typeof(activity_payload -> 'max_speed') = 'number'
                    THEN CASE
                        WHEN (activity_payload ->> 'max_speed')::NUMERIC > 0
                             AND ROUND(
                                 (activity_payload ->> 'max_speed')::NUMERIC * 10
                             ) BETWEEN 1 AND 32767
                            THEN ROUND(
                                (activity_payload ->> 'max_speed')::NUMERIC * 10
                            )::INTEGER
                        ELSE NULL
                    END
                ELSE NULL
            END,
            CASE
                WHEN (sensor_mask & 1) = 1
                     AND jsonb_typeof(activity_payload -> 'average_watts') = 'number'
                    THEN CASE
                        WHEN (activity_payload ->> 'average_watts')::NUMERIC > 0
                             AND (activity_payload ->> 'average_watts')::NUMERIC <= 32767
                             AND ROUND((activity_payload ->> 'average_watts')::NUMERIC) > 0
                            THEN ROUND(
                                (activity_payload ->> 'average_watts')::NUMERIC
                            )::INTEGER
                        ELSE NULL
                    END
                ELSE NULL
            END,
            CASE
                WHEN (sensor_mask & 1) = 1
                     AND jsonb_typeof(activity_payload -> 'max_watts') = 'number'
                    THEN CASE
                        WHEN (activity_payload ->> 'max_watts')::NUMERIC > 0
                             AND (activity_payload ->> 'max_watts')::NUMERIC <= 32767
                             AND ROUND((activity_payload ->> 'max_watts')::NUMERIC) > 0
                            THEN ROUND(
                                (activity_payload ->> 'max_watts')::NUMERIC
                            )::INTEGER
                        ELSE NULL
                    END
                ELSE NULL
            END,
            CASE
                WHEN (sensor_mask & 1) = 1
                     AND jsonb_typeof(activity_payload -> 'normalized_power') = 'number'
                    THEN CASE
                        WHEN (activity_payload ->> 'normalized_power')::NUMERIC > 0
                             AND (activity_payload ->> 'normalized_power')::NUMERIC <= 32767
                             AND ROUND((activity_payload ->> 'normalized_power')::NUMERIC) > 0
                            THEN ROUND(
                                (activity_payload ->> 'normalized_power')::NUMERIC
                            )::INTEGER
                        ELSE NULL
                    END
                ELSE NULL
            END,
            CASE
                WHEN (sensor_mask & 4) = 4
                     AND jsonb_typeof(activity_payload -> 'average_cadence') = 'number'
                    THEN CASE
                        WHEN (activity_payload ->> 'average_cadence')::NUMERIC > 0
                             AND (activity_payload ->> 'average_cadence')::NUMERIC <= 1000
                             AND ROUND((activity_payload ->> 'average_cadence')::NUMERIC) > 0
                            THEN ROUND(
                                (activity_payload ->> 'average_cadence')::NUMERIC
                            )::INTEGER
                        ELSE NULL
                    END
                ELSE NULL
            END,
            CASE
                WHEN (sensor_mask & 4) = 4
                     AND jsonb_typeof(activity_payload -> 'max_cadence') = 'number'
                    THEN CASE
                        WHEN (activity_payload ->> 'max_cadence')::NUMERIC > 0
                             AND (activity_payload ->> 'max_cadence')::NUMERIC <= 1000
                             AND ROUND((activity_payload ->> 'max_cadence')::NUMERIC) > 0
                            THEN ROUND(
                                (activity_payload ->> 'max_cadence')::NUMERIC
                            )::INTEGER
                        ELSE NULL
                    END
                ELSE NULL
            END,
            CASE
                WHEN (sensor_mask & 2) = 2
                     AND jsonb_typeof(activity_payload -> 'average_heartrate') = 'number'
                    THEN CASE
                        WHEN (activity_payload ->> 'average_heartrate')::NUMERIC > 0
                             AND (activity_payload ->> 'average_heartrate')::NUMERIC <= 300
                             AND ROUND((activity_payload ->> 'average_heartrate')::NUMERIC) > 0
                            THEN ROUND(
                                (activity_payload ->> 'average_heartrate')::NUMERIC
                            )::INTEGER
                        ELSE NULL
                    END
                ELSE NULL
            END,
            CASE
                WHEN (sensor_mask & 2) = 2
                     AND jsonb_typeof(activity_payload -> 'max_heartrate') = 'number'
                    THEN CASE
                        WHEN (activity_payload ->> 'max_heartrate')::NUMERIC > 0
                             AND (activity_payload ->> 'max_heartrate')::NUMERIC <= 300
                             AND ROUND((activity_payload ->> 'max_heartrate')::NUMERIC) > 0
                            THEN ROUND(
                                (activity_payload ->> 'max_heartrate')::NUMERIC
                            )::INTEGER
                        ELSE NULL
                    END
                ELSE NULL
            END,
            CASE
                WHEN (sensor_mask & 1) = 1
                     AND jsonb_typeof(activity_payload -> 'kilojoules') = 'number'
                    THEN CASE
                        WHEN (activity_payload ->> 'kilojoules')::NUMERIC > 0
                             AND (activity_payload ->> 'kilojoules')::NUMERIC <= 2147483647
                             AND ROUND((activity_payload ->> 'kilojoules')::NUMERIC) > 0
                            THEN ROUND(
                                (activity_payload ->> 'kilojoules')::NUMERIC
                            )::INTEGER
                        ELSE NULL
                    END
                ELSE NULL
            END,
            CASE
                WHEN jsonb_typeof(activity_payload -> 'kcalories') = 'number'
                    THEN CASE
                        WHEN (activity_payload ->> 'kcalories')::NUMERIC > 0
                             AND (activity_payload ->> 'kcalories')::NUMERIC <= 2147483647
                             AND ROUND((activity_payload ->> 'kcalories')::NUMERIC) > 0
                            THEN ROUND(
                                (activity_payload ->> 'kcalories')::NUMERIC
                            )::INTEGER
                        ELSE NULL
                    END
                ELSE NULL
            END,
            CASE
                WHEN (sensor_mask & 8) = 8
                     AND jsonb_typeof(activity_payload -> 'average_temperature') = 'number'
                    THEN CASE
                        WHEN ROUND(
                            (activity_payload ->> 'average_temperature')::NUMERIC * 10
                        ) BETWEEN -1000 AND 1000
                            THEN ROUND(
                                (activity_payload ->> 'average_temperature')::NUMERIC * 10
                            )::INTEGER
                        ELSE NULL
                    END
                ELSE NULL
            END,
            CASE
                WHEN (sensor_mask & 1) = 1
                     AND jsonb_typeof(training_load_payload -> 'tss') = 'number'
                    THEN CASE
                        WHEN (training_load_payload ->> 'tss')::NUMERIC
                             BETWEEN 0 AND 2147483647
                            THEN ROUND(
                                (training_load_payload ->> 'tss')::NUMERIC
                            )::INTEGER
                        ELSE NULL
                    END
                ELSE NULL
            END,
            CASE
                WHEN (sensor_mask & 1) = 1
                     AND jsonb_typeof(training_load_payload -> 'intensity_factor') = 'number'
                    THEN CASE
                        WHEN ROUND(
                            (training_load_payload ->> 'intensity_factor')::NUMERIC * 1000
                        ) BETWEEN 0 AND 32767
                            THEN ROUND(
                                (training_load_payload ->> 'intensity_factor')::NUMERIC * 1000
                            )::INTEGER
                        ELSE NULL
                    END
                ELSE NULL
            END,
            CASE
                WHEN legacy.ftp_used BETWEEN 0 AND 2000
                    THEN legacy.ftp_used
                ELSE 0
            END,
            CASE
                WHEN legacy.anaerobic_threshold_used BETWEEN 0 AND 300
                    THEN legacy.anaerobic_threshold_used
                ELSE 0
            END,
            CASE
                WHEN jsonb_typeof(analysis_profile_payload -> 'weightKg') = 'number'
                    THEN CASE
                        WHEN ROUND(
                            (analysis_profile_payload ->> 'weightKg')::NUMERIC * 10
                        ) BETWEEN 200 AND 3000
                            THEN ROUND(
                                (analysis_profile_payload ->> 'weightKg')::NUMERIC * 10
                            )::SMALLINT
                        ELSE NULL
                    END
                ELSE NULL
            END,
            power_curve,
            power_zones,
            heart_rate_zones,
            compact_laps,
            achievements,
            NULL,
            sensor_mask,
            calculation_flags,
            1,
            legacy.ai_analysis,
            legacy.ai_analysis_hash,
            legacy.ai_analysis_status,
            legacy.ai_analysis_model,
            legacy.ai_analysis_generated_at,
            legacy.ai_analysis_started_at,
            legacy.ai_analysis_attempt_count
        )
        ON CONFLICT ("userId", "sourceId") DO NOTHING
        RETURNING "id" INTO history_id;

        IF history_id IS NULL THEN
            SELECT activity."id"
            INTO history_id
            FROM "activities" activity
            WHERE activity."userId" = legacy.user_id
              AND activity."sourceId" = normalized_source_id;
        END IF;

        UPDATE "last_activity"
        SET "activityId" = history_id
        WHERE "id" = legacy.last_id
          AND "activityId" IS NULL;
    END LOOP;
END
$activity_history_backfill$;

-- Once an exact historical row exists, the legacy deduplication marker is
-- redundant. Keep unmatched markers so old uploads that were not retained in
-- last_activity remain protected until they are explicitly re-imported.
DELETE FROM "processed_activities" processed
USING "activities" activity
WHERE processed."userId" = activity."userId"
  AND processed."sourceId" = activity."sourceId";

COMMIT;
