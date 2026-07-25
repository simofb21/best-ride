export const MEDAL_COLORS = ["yellow-darken-2", "grey", "orange"] as const;

export function getMedalColor(rank: number | null | undefined): string | null {
  if (!rank || rank < 1 || rank > 3) return null;
  return MEDAL_COLORS[rank - 1] ?? null;
}
