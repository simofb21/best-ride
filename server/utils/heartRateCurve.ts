const HR_WINDOWS = {
  "5min": 300,
  "20min": 1200,
  "1h": 3600,
};

type Point = { t: number; hr: number };

function extractValidHrPoints(records: any[]): Point[] {
  return records
    .map((r) => ({
      t: r.timestamp ? new Date(r.timestamp).getTime() / 1000 : null,
      hr: r.heart_rate,
    }))
    .filter((r): r is Point => r.t !== null && typeof r.hr === "number");
}

function bestAverageHr(points: Point[], windowSeconds: number): number {
  if (points.length === 0) return 0;

  let best = 0;
  let start = 0;
  let sum = 0;

  for (let end = 0; end < points.length; end++) {
    sum += points[end]!.hr;

    while (points[end]!.t - points[start]!.t > windowSeconds) {
      sum -= points[start]!.hr;
      start++;
    }

    const duration = points[end]!.t - points[start]!.t;
    if (duration >= windowSeconds - 1) {
      const count = end - start + 1;
      best = Math.max(best, sum / count);
    }
  }

  return Math.round(best);
}

export function computeHeartRateCurve(records: any[]) {
  const points = extractValidHrPoints(records);
  return {
    hr_5min: bestAverageHr(points, HR_WINDOWS["5min"]),
    hr_20min: bestAverageHr(points, HR_WINDOWS["20min"]),
    hr_1h: bestAverageHr(points, HR_WINDOWS["1h"]),
  };
}
