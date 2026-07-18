// Contiene le durate (in secondi) delle finestre temporali su cui vogliamo calcolare la potenza media massima.
const POWER_WINDOWS = {
  short: {
    peak_power: 1,
    "3s_power": 3,
    "5s_power": 5,
    "10s_power": 10,
    "20s_power": 20,
    "30s_power": 30,
    "1min_power": 60,
    "2min_power": 120,
    "3min_power": 180,
  },
  middle: {
    "5min_power": 300,
    "8min_power": 480,
    "10min_power": 600,
    "12min_power": 720,
  },
  long: {
    "15min_power": 900,
    "20min_power": 1200,
    "30min_power": 1800,
    "60min_power": 3600,
  },
};

// Ogni punto contiene:
// t = tempo in secondi
// p = potenza in watt
type Point = {
  t: number;
  p: number;
};

function extractValidPowerPoints(records: any[]): Point[] {
  // Array che conterrà solo i dati validi
  let points: Point[] = [];

  // Scorro tutti i record
  for (let i = 0; i < records.length; i++) {
    // Salvo il record corrente
    let record = records[i];

    // Controllo che esista un timestamp
    // e che la potenza sia un numero
    if (record.timestamp && typeof record.power === "number") {
      // Aggiungo il punto nell'array
      points.push({
        // Converto il timestamp in secondi
        t: new Date(record.timestamp).getTime() / 1000,
        // Salvo la potenza
        p: record.power,
      });
    }
  }

  // Restituisco l'array dei punti validi
  return points;
}

function bestAveragePower(points: Point[], windowSeconds: number): number {
  // Se non ci sono dati restituisco 0
  if (points.length == 0) {
    return 0;
  }
  // Migliore media trovata
  let best = 0;
  // Indice di inizio della finestra
  let start = 0;
  // Somma delle potenze nella finestra corrente
  let sum = 0;

  // Scorro tutti i punti
  for (let end = 0; end < points.length; end++) {
    // Aggiungo la potenza del punto corrente
    sum = sum + points[end].p;

    // Se la finestra è troppo lunga
    while (points[end].t - points[start].t > windowSeconds) {
      // Tolgo il primo valore dalla somma
      sum = sum - points[start].p;
      // Sposto l'inizio della finestra
      start++;
    }

    // Calcolo la durata della finestra
    let durata = points[end].t - points[start].t;

    // Controllo che la finestra abbia raggiunto
    // la durata richiesta
    if (durata >= windowSeconds - 1) {
      // Numero di punti presenti nella finestra
      let numeroPunti = end - start + 1;

      // Calcolo la potenza media
      let media = sum / numeroPunti;

      // Se è la migliore trovata finora
      if (media > best) {
        // Aggiorno il valore massimo
        best = media;
      }
    }
  }

  // Arrotondo il risultato
  return Math.round(best);
}

export function computePowerCurve(records: any[]) {
  // Estraggo solo timestamp e potenza validi
  let points = extractValidPowerPoints(records);

  // Oggetti che conterranno i risultati
  let shortIntervals: any = {};
  let middleIntervals: any = {};
  let longIntervals: any = {};

  // Calcolo tutte le finestre brevi
  for (let key in POWER_WINDOWS.short) {
    // Durata della finestra
    let secondi = POWER_WINDOWS.short[key];

    // Calcolo la miglior media per quella durata
    shortIntervals[key] = bestAveragePower(points, secondi);
  }

  // Calcolo tutte le finestre medie
  for (let key in POWER_WINDOWS.middle) {
    let secondi = POWER_WINDOWS.middle[key];

    middleIntervals[key] = bestAveragePower(points, secondi);
  }

  // Calcolo tutte le finestre lunghe
  for (let key in POWER_WINDOWS.long) {
    let secondi = POWER_WINDOWS.long[key];

    longIntervals[key] = bestAveragePower(points, secondi);
  }

  // Restituisco tutti i risultati
  return [
    {
      short_intervals: shortIntervals,
    },
    {
      middle_intervals: middleIntervals,
    },
    {
      long_intervals: longIntervals,
    },
  ];
}
