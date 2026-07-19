export function hmsToSeconds(h: number, m: number, s: number): number {
  return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
}

export function secondsToHMS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  return { h, m, s };
}

export function formatHMS(totalSeconds: number): string {
  const { h, m, s } = secondsToHMS(totalSeconds);
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}
