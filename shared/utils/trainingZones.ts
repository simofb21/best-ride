export interface ZoneDefinition {
  name: string;
  minPercent: number; // percentuale minima di FTP/soglia (inclusiva)
  maxPercent: number | null; // null = nessun limite superiore
  color: string;
  description: string;
}

export const FTP_ZONES: ZoneDefinition[] = [
  {
    name: "Zone 1 — Recovery",
    minPercent: 0,
    maxPercent: 55,
    color: "#89968e",
    description: "Active recovery, very easy spinning",
  },
  {
    name: "Zone 2 — Endurance",
    minPercent: 55,
    maxPercent: 75,
    color: "#4cc9f0",
    description: "All-day pace, aerobic base building",
  },
  {
    name: "Zone 3 — Tempo",
    minPercent: 75,
    maxPercent: 90,
    color: "#00ff00",
    description: "Steady, moderately hard effort",
  },
  {
    name: "Zone 4 — Threshold",
    minPercent: 90,
    maxPercent: 105,
    color: "#fffb00",
    description: "Right around your FTP",
  },
  {
    name: "Zone 5 — VO2max",
    minPercent: 105,
    maxPercent: 120,
    color: "#ff6600",
    description: "Hard intervals, 3-8 min efforts",
  },
  {
    name: "Zone 6 — Anaerobic",
    minPercent: 120,
    maxPercent: 150,
    color: "#b30006",
    description: "Short, very hard efforts",
  },
  {
    name: "Zone 7 — Neuromuscular",
    minPercent: 150,
    maxPercent: null,
    color: "#7726d3",
    description: "Sprints, max effort",
  },
];

export const HR_ZONES: ZoneDefinition[] = [
  {
    name: "Zone 1 — Recovery",
    minPercent: 0,
    maxPercent: 68,
    color: "#89968e",
    description: "Very light, active recovery",
  },
  {
    name: "Zone 2 — Endurance",
    minPercent: 68,
    maxPercent: 83,
    color: "#4cc9f0",
    description: "Aerobic base, conversational pace",
  },
  {
    name: "Zone 3 — Tempo",
    minPercent: 83,
    maxPercent: 94,
    color: "#00ff00",
    description: "Moderately hard, sustainable effort",
  },
  {
    name: "Zone 4 — Threshold",
    minPercent: 94,
    maxPercent: 105,
    color: "#fffb00",
    description: "Around your anaerobic threshold",
  },
  {
    name: "Zone 5 — Maximal",
    minPercent: 105,
    maxPercent: null,
    color: "#a25aff",
    description: "Very hard, near-max effort",
  },
];

export interface ComputedZone extends ZoneDefinition {
  minValue: number;
  maxValue: number | null;
}

export function computeZones(
  referenceValue: number,
  zones: ZoneDefinition[],
): ComputedZone[] {
  return zones.map((zone) => ({
    ...zone,
    minValue: Math.round((zone.minPercent / 100) * referenceValue),
    maxValue:
      zone.maxPercent != null
        ? Math.round((zone.maxPercent / 100) * referenceValue)
        : null,
  }));
}
