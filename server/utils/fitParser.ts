import FitParser from "fit-file-parser";

/**
 * Prende i byte grezzi di un file .fit e restituisce
 * l'oggetto JS con tutti i dati (records, sessions, ecc.)
 */
export function parseFitFile(buffer: Buffer): Promise<any> {
  const fitParser = new FitParser({
    force: true,
    speedUnit: "km/h",
    lengthUnit: "km",
    temperatureUnit: "celsius",
    elapsedRecordField: true,
    mode: "both",
  });

  return new Promise((resolve, reject) => {
    // ritorna una Promise che risolve con i dati del file .fit
    fitParser.parse(buffer, (error: any, result: any) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}
