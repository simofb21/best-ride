interface FitDurationFields {
  total_moving_time?: unknown;
  total_timer_time?: unknown;
  total_elapsed_time?: unknown;
}

const DURATION_TOLERANCE_SECONDS = 5;

function positiveSeconds(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function isPlausible(candidate: number, upperBound: number | null): boolean {
  return (
    upperBound == null ||
    candidate <= upperBound + DURATION_TOLERANCE_SECONDS
  );
}

function roundedSeconds(value: number): number {
  return Math.max(0, Math.round(value));
}

/**
 * Resolves the duration that best represents time spent riding.
 *
 * FIT moving time is preferred because it excludes time spent stationary.
 * Timer time is the next-best source and excludes recorded pause/autopause
 * periods. Elapsed time is used only when the FIT file contains no more
 * precise duration. Per-record timer values are a useful fallback for files
 * whose session summary omits total_timer_time.
 */
export function resolveFitDurationSeconds(
  fields: FitDurationFields | null | undefined,
  recordTimerValues: readonly unknown[] = [],
): number | null {
  const elapsed = positiveSeconds(fields?.total_elapsed_time);
  const timerCandidate = positiveSeconds(fields?.total_timer_time);
  const timer =
    timerCandidate != null && isPlausible(timerCandidate, elapsed)
      ? timerCandidate
      : null;

  const movingCandidate = positiveSeconds(fields?.total_moving_time);
  const movingUpperBound = timer ?? elapsed;
  const moving =
    movingCandidate != null && isPlausible(movingCandidate, movingUpperBound)
      ? movingCandidate
      : null;

  if (moving != null) return roundedSeconds(moving);
  if (timer != null) return roundedSeconds(timer);

  let maxRecordTimer: number | null = null;
  for (const value of recordTimerValues) {
    const recordTimer = positiveSeconds(value);
    if (
      recordTimer != null &&
      isPlausible(recordTimer, elapsed) &&
      (maxRecordTimer == null || recordTimer > maxRecordTimer)
    ) {
      maxRecordTimer = recordTimer;
    }
  }

  if (maxRecordTimer != null) return roundedSeconds(maxRecordTimer);
  if (elapsed != null) return roundedSeconds(elapsed);
  return null;
}

function timestampMilliseconds(value: unknown): number | null {
  if (value == null || value === "") return null;
  const milliseconds = new Date(value as string | number | Date).getTime();
  return Number.isFinite(milliseconds) ? milliseconds : null;
}

export function resolveActivityDurationSeconds(
  records: readonly any[],
  session: FitDurationFields | null | undefined,
): number {
  const fitDuration = resolveFitDurationSeconds(
    session,
    records.map((record) => record?.timer_time),
  );
  if (fitDuration != null) return fitDuration;

  // Smart Recording produces samples at irregular intervals, so the timestamp
  // span is a safer last-resort estimate than the number of records.
  let earliestTimestamp: number | null = null;
  let latestTimestamp: number | null = null;
  for (const record of records) {
    const timestamp = timestampMilliseconds(record?.timestamp);
    if (timestamp == null) continue;
    if (earliestTimestamp == null || timestamp < earliestTimestamp) {
      earliestTimestamp = timestamp;
    }
    if (latestTimestamp == null || timestamp > latestTimestamp) {
      latestTimestamp = timestamp;
    }
  }

  if (
    earliestTimestamp != null &&
    latestTimestamp != null &&
    latestTimestamp > earliestTimestamp
  ) {
    return roundedSeconds((latestTimestamp - earliestTimestamp) / 1_000);
  }

  return records.length;
}
