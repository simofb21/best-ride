// server/utils/trainingLoad.ts

/**
 * Intensity Factor: quanto è stato intenso lo sforzo rispetto alla soglia (FTP).
 * IF = 1.0 significa "esattamente alla soglia" per l'intera durata.
 */
export function computeTrainingLoad(params: {
  normalizedPower: number;
  ftp: number;
  durationSeconds: number;
}) {
  const { normalizedPower, ftp, durationSeconds } = params;

  if (ftp <= 0) return { intensity_factor: 0, tss: 0 };

  const intensityFactor = normalizedPower / ftp;

  // TSS: carico allenante, 100 = 1 ora esattamente alla soglia FTP
  const tss =
    ((durationSeconds * normalizedPower * intensityFactor) / (ftp * 3600)) *
    100;

  return {
    intensity_factor: Number(intensityFactor.toFixed(2)),
    tss: Math.round(tss),
  };
}
