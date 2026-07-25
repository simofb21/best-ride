interface ZoneTimeResult {
  name: string;
  color: string;
  seconds: number;
  percent: number;
}

function computeTimeInZones(
  records: any[],
  field: "power" | "heart_rate",
  zones: ComputedZone[],
): ZoneTimeResult[] {
  const values = records
    .map((r) => r[field])
    .filter((v: any) => typeof v === "number");
  const totalPoints = values.length;

  if (totalPoints === 0) {
    return zones.map((z) => ({
      name: z.name,
      color: z.color,
      seconds: 0,
      percent: 0,
    }));
  }

  const counts = zones.map(() => 0);

  for (const value of values) {
    for (let i = 0; i < zones.length; i++) {
      const zone = zones[i]!;
      const withinMin = value >= zone.minValue;
      const withinMax = zone.maxValue == null || value < zone.maxValue;
      if (withinMin && withinMax) {
        counts[i]!++;
        break;
      }
    }
  }

  return zones.map((zone, i) => ({
    name: zone.name,
    color: zone.color,
    seconds: counts[i]!, // assumendo ~1 campione/secondo
    percent: Number(((counts[i]! / totalPoints) * 100).toFixed(1)),
  }));
}

export function computePowerZoneTime(records: any[], ftp: number) {
  const zones = computeZones(ftp, FTP_ZONES);
  return computeTimeInZones(records, "power", zones);
}

export function computeHeartRateZoneTime(
  records: any[],
  anaerobicThreshold: number,
) {
  const zones = computeZones(anaerobicThreshold, HR_ZONES);
  return computeTimeInZones(records, "heart_rate", zones);
}
