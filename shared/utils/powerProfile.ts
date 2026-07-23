// Scala di riferimento originale a 7 livelli, valori in W/kg per ciascuna durata.
// Nomenclatura e soglie nostre, non riprese da tabelle pubblicate di terzi.
export const PERFORMANCE_TIERS = [
  "Divano",
  "Novizio",
  "Serio",
  "Amapro",
  "Dilettante",
  "Professionale",
  "World Tour",
] as const;

// shared/utils/powerProfile.ts
export interface DurationProfile {
  key: string;
  label: string;
  shortLabel: string;
  thresholdsMale: number[];
  thresholdsFemale: number[];
}

export const POWER_PROFILE_DURATIONS: DurationProfile[] = [
  {
    key: "power_5s",
    label: "Neuromuscular Power (5s)",
    shortLabel: '5"',
    thresholdsMale: [9, 11, 13, 15, 17, 19, 21],
    thresholdsFemale: [7.5, 9.2, 10.9, 12.6, 14.3, 16, 17.7],
  },
  {
    key: "power_30s",
    label: "30s Power",
    shortLabel: '30"',
    thresholdsMale: [7.5, 9, 10.5, 12, 13.5, 15, 16.5],
    thresholdsFemale: [6.3, 7.6, 8.9, 10.2, 11.5, 12.8, 14.1],
  },
  {
    key: "power_1min",
    label: "Anaerobic Capacity (1min)",
    shortLabel: "1'",
    thresholdsMale: [6, 7.5, 9, 10.5, 12, 13.5, 15],
    thresholdsFemale: [5, 6.3, 7.6, 8.9, 10.2, 11.5, 12.8],
  },
  {
    key: "power_2min",
    label: "2min Power",
    shortLabel: "2'",
    thresholdsMale: [5, 6, 7, 8, 9, 10, 11],
    thresholdsFemale: [4.2, 5.1, 6.0, 6.9, 7.8, 8.7, 9.6],
  },
  {
    key: "power_5min",
    label: "VO2max Power (5min)",
    shortLabel: "5'",
    thresholdsMale: [4, 4.7, 5.4, 6.1, 6.8, 7.5, 8.2],
    thresholdsFemale: [3.4, 4.0, 4.6, 5.2, 5.8, 6.4, 7.0],
  },
  {
    key: "power_12min",
    label: "12min Power",
    shortLabel: "12'",
    thresholdsMale: [3.6, 4.2, 4.8, 5.4, 6.0, 6.6, 7.2],
    thresholdsFemale: [3.1, 3.6, 4.1, 4.6, 5.1, 5.6, 6.1],
  },
  {
    key: "power_20min",
    label: "20min Power",
    shortLabel: "20'",
    thresholdsMale: [3.4, 4.0, 4.5, 5.0, 5.6, 6.2, 6.8],
    thresholdsFemale: [2.9, 3.4, 3.8, 4.3, 4.8, 5.3, 5.8],
  },
  {
    key: "ftp",
    label: "Functional Threshold (FTP)",
    shortLabel: "FTP",
    thresholdsMale: [2.8, 3.3, 3.8, 4.3, 4.8, 5.3, 5.8],
    thresholdsFemale: [2.4, 2.8, 3.2, 3.7, 4.1, 4.5, 5.0],
  },
];

export function getThresholds(
  duration: DurationProfile,
  sex: string | null,
): number[] {
  return sex === "F" ? duration.thresholdsFemale : duration.thresholdsMale;
}
/**
 * Normalizza un valore W/kg in uno score 0-100, interpolando linearmente
 * tra i 7 livelli di riferimento della durata specificata.
 */
export function normalizeToScore(wkg: number, thresholds: number[]): number {
  const stepSize = 100 / (thresholds.length - 1); // 7 livelli -> 6 intervalli -> ~16.67 ognuno

  if (wkg <= thresholds[0]!) {
    // Sotto il primo livello: scala proporzionalmente verso 0
    return Math.max(0, (wkg / thresholds[0]!) * stepSize);
  }

  for (let i = 0; i < thresholds.length - 1; i++) {
    const lower = thresholds[i]!;
    const upper = thresholds[i + 1]!;
    if (wkg >= lower && wkg <= upper) {
      const fraction = (wkg - lower) / (upper - lower);
      return i * stepSize + fraction * stepSize;
    }
  }

  // Sopra l'ultimo livello (World Class+): cap a 100
  return 100;
}

export function getTierLabel(wkg: number, thresholds: number[]): string {
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (wkg >= thresholds[i]!) return PERFORMANCE_TIERS[i]!;
  }
  return PERFORMANCE_TIERS[0]!;
}
