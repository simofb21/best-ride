// server/utils/normalizedPower.ts

/**
 * Calcola la Normalized Power (NP) secondo l'algoritmo di Coggan:
 * 1. media mobile a 30s della potenza
 * 2. ogni valore elevato alla 4a potenza
 * 3. media di questi valori
 * 4. radice quarta del risultato
 */
export function computeNormalizedPower(records: any[]): number {
  const powerValues = records
    .map((r) => r.power)
    .filter((v: any) => typeof v === "number");

  if (powerValues.length < 30) return 0; // attività troppo corta per essere significativa

  // Passo 1: media mobile a 30 secondi (assumendo ~1 campione/secondo)
  const rollingAverages: number[] = [];
  const windowSize = 30;

  let windowSum = 0;
  for (let i = 0; i < powerValues.length; i++) {
    windowSum += powerValues[i]!;

    if (i >= windowSize) {
      windowSum -= powerValues[i - windowSize]!;
    }

    if (i >= windowSize - 1) {
      const avg = windowSum / windowSize;
      rollingAverages.push(avg);
    }
  }

  if (rollingAverages.length === 0) return 0;

  // Passo 2 + 3: eleva alla 4a ogni media mobile, poi fai la media di questi valori
  const fourthPowerAvg =
    rollingAverages.reduce((sum, val) => sum + Math.pow(val, 4), 0) /
    rollingAverages.length;

  // Passo 4: radice quarta
  const normalizedPower = Math.pow(fourthPowerAvg, 0.25);

  return Math.round(normalizedPower);
}
