export interface ActivitySummary {
  distance: number;
  duration: number;
  elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_cadence: number;
  average_heartrate: number;
  max_heartrate: number;
  average_watts: number;
  max_watts: number;
  kilojoules: number;
  kcalories: number;
  normalized_power: number;
}

export interface ShortIntervals {
  peak_power: number;
  "3s_power": number;
  "5s_power": number;
  "10s_power": number;
  "20s_power": number;
  "30s_power": number;
  "1min_power": number;
  "2min_power": number;
  "3min_power": number;
}

export interface MiddleIntervals {
  "5min_power": number;
  "8min_power": number;
  "10min_power": number;
  "12min_power": number;
}

export interface LongIntervals {
  "15min_power": number;
  "20min_power": number;
  "30min_power": number;
  "60min_power": number;
}

export interface ActivityAnalysis {
  activity: ActivitySummary;
  power_records: [
    { short_intervals: ShortIntervals },
    { middle_intervals: MiddleIntervals },
    { long_intervals: LongIntervals },
  ];
}
