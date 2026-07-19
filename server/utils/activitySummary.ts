function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  let somma = 0;
  for (let i = 0; i < values.length; i++) {
    somma = somma + values[i];
  }
  return somma / values.length;
}

function maximum(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  let massimo = values[0];
  for (let i = 1; i < values.length; i++) {
    if (values[i] > massimo) {
      massimo = values[i];
    }
  }
  return massimo;
}

function extractNumericField(records: any[], field: string): number[] {
  // Estrae i valori numerici di un campo specifico da un array di record
  let result: number[] = [];
  for (let i = 0; i < records.length; i++) {
    let valore = records[i][field];
    if (typeof valore === "number") {
      result.push(valore);
    }
  }
  return result;
}

export function buildActivitySummary(records: any[], session: any) {
  // Estrae i valori numerici di potenza, cadenza, frequenza cardiaca e velocità dai record
  let powerValues = extractNumericField(records, "power");
  let cadenceValues = extractNumericField(records, "cadence");
  let hrValues = extractNumericField(records, "heart_rate");
  let speedValues = extractNumericField(records, "speed");
  let distance = 0;
  if (session && session.total_distance)
    distance = Number(session.total_distance.toFixed(2));
  let duration = records.length;
  if (session && session.total_elapsed_time)
    duration = Math.round(session.total_elapsed_time);
  let elevation_gain = 0;
  if (session && session.total_ascent != null)
    elevation_gain = session.total_ascent;

  let average_speed = Number(average(speedValues).toFixed(1)); //calcola la velocità media dai record, arrotondata a 1 decimale
  if (session && session.avg_speed != null) average_speed = session.avg_speed;

  let max_speed = Number(maximum(speedValues).toFixed(1)); //calcola max speed
  if (session && session.max_speed != null) {
    max_speed = session.max_speed;
  }

  let average_cadence = Math.round(average(cadenceValues)); // calcola avg cadenza

  if (session && session.avg_cadence != null) {
    average_cadence = session.avg_cadence;
  }

  let average_heartrate = Math.round(average(hrValues)); //calcola avg heartrate

  if (session && session.avg_heart_rate != null) {
    average_heartrate = session.avg_heart_rate;
  }

  let max_heartrate = Math.round(maximum(hrValues)); //calcola max heartrate

  if (session && session.max_heart_rate != null) {
    //calcola max heartrate
    max_heartrate = session.max_heart_rate;
  }

  let average_watts = Math.round(average(powerValues)); //watt medi

  if (session && session.avg_power != null) {
    average_watts = session.avg_power;
  }

  let max_watts = Math.round(maximum(powerValues)); //calcola max watts

  if (session && session.max_power != null) {
    max_watts = session.max_power;
  }

  let kilojoules = 0;
  if (session && session.total_work) {
    kilojoules = Math.round(session.total_work / 1000);
  }

  let kcalories = 0;

  if (session && session.total_calories != null) {
    kcalories = session.total_calories;
  }

  return {
    distance: distance,
    duration: duration,
    elevation_gain: elevation_gain,
    average_speed: average_speed,
    max_speed: max_speed,
    average_cadence: average_cadence,
    average_heartrate: average_heartrate,
    max_heartrate: max_heartrate,
    average_watts: average_watts,
    max_watts: max_watts,
    kilojoules: kilojoules,
    kcalories: kcalories,
    activityDate: session?.start_time ?? records[0]?.timestamp ?? new Date(),
  };
}
