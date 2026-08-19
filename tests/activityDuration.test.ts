import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveActivityDurationSeconds,
  resolveFitDurationSeconds,
} from "../server/utils/activityDuration.ts";

test("uses moving time instead of elapsed time for the activity", () => {
  assert.equal(
    resolveActivityDurationSeconds([], {
      total_moving_time: 4_000,
      total_timer_time: 4_200,
      total_elapsed_time: 5_400,
    }),
    4_000,
  );
});

test("falls back to timer time when moving time is unavailable", () => {
  assert.equal(
    resolveFitDurationSeconds({
      total_timer_time: 6_000,
      total_elapsed_time: 7_200,
    }),
    6_000,
  );
});

test("uses record timer time before elapsed time", () => {
  assert.equal(
    resolveActivityDurationSeconds(
      [{ timer_time: 0 }, { timer_time: 3_600 }, { timer_time: 6_000 }],
      { total_elapsed_time: 7_200 },
    ),
    6_000,
  );
});

test("rejects implausible moving and timer values", () => {
  assert.equal(
    resolveFitDurationSeconds(
      {
        total_moving_time: 8_000,
        total_timer_time: 7_000,
        total_elapsed_time: 6_000,
      },
      [5_500],
    ),
    5_500,
  );
});

test("uses timestamp span instead of sample count as final fallback", () => {
  assert.equal(
    resolveActivityDurationSeconds(
      [
        { timestamp: "2026-08-19T08:00:00.000Z" },
        { timestamp: "2026-08-19T08:01:00.000Z" },
        { timestamp: "2026-08-19T08:03:00.000Z" },
      ],
      null,
    ),
    180,
  );
});

test("duration follows moving, timer, elapsed precedence", () => {
  assert.deepEqual(
    [
      resolveFitDurationSeconds({
        total_moving_time: 90,
        total_timer_time: 100,
        total_elapsed_time: 120,
      }),
      resolveFitDurationSeconds({
        total_timer_time: 200,
        total_elapsed_time: 240,
      }),
      resolveFitDurationSeconds({ total_elapsed_time: 300 }),
    ],
    [90, 200, 300],
  );
});
