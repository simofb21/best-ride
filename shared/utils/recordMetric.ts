// shared/utils/recordMetrics.ts
export interface RecordMetricConfig {
  key: string;
  label: string;
  unit: string;
  lowerIsBetter: boolean;
  category: "short_power" | "mid_power" | "long_power" | "other";
}

export const RECORD_METRICS: RecordMetricConfig[] = [
  // Power curve — short
  {
    key: "peak_power",
    label: "Peak Power",
    unit: "W",
    lowerIsBetter: false,
    category: "short_power",
  },
  {
    key: "3s_power",
    label: "3 sec",
    unit: "W",
    lowerIsBetter: false,
    category: "short_power",
  },
  {
    key: "5s_power",
    label: "5 sec",
    unit: "W",
    lowerIsBetter: false,
    category: "short_power",
  },
  {
    key: "10s_power",
    label: "10 sec",
    unit: "W",
    lowerIsBetter: false,
    category: "short_power",
  },
  {
    key: "20s_power",
    label: "20 sec",
    unit: "W",
    lowerIsBetter: false,
    category: "short_power",
  },
  {
    key: "30s_power",
    label: "30 sec",
    unit: "W",
    lowerIsBetter: false,
    category: "short_power",
  },
  {
    key: "1min_power",
    label: "1 min",
    unit: "W",
    lowerIsBetter: false,
    category: "short_power",
  },
  {
    key: "2min_power",
    label: "2 min",
    unit: "W",
    lowerIsBetter: false,
    category: "short_power",
  },
  {
    key: "3min_power",
    label: "3 min",
    unit: "W",
    lowerIsBetter: false,
    category: "short_power",
  },

  // Power curve — mid
  {
    key: "5min_power",
    label: "5 min",
    unit: "W",
    lowerIsBetter: false,
    category: "mid_power",
  },
  {
    key: "8min_power",
    label: "8 min",
    unit: "W",
    lowerIsBetter: false,
    category: "mid_power",
  },
  {
    key: "10min_power",
    label: "10 min",
    unit: "W",
    lowerIsBetter: false,
    category: "mid_power",
  },
  {
    key: "12min_power",
    label: "12 min",
    unit: "W",
    lowerIsBetter: false,
    category: "mid_power",
  },

  // Power curve — long
  {
    key: "15min_power",
    label: "15 min",
    unit: "W",
    lowerIsBetter: false,
    category: "long_power",
  },
  {
    key: "20min_power",
    label: "20 min",
    unit: "W",
    lowerIsBetter: false,
    category: "long_power",
  },
  {
    key: "30min_power",
    label: "30 min",
    unit: "W",
    lowerIsBetter: false,
    category: "long_power",
  },
  {
    key: "60min_power",
    label: "60 min",
    unit: "W",
    lowerIsBetter: false,
    category: "long_power",
  },

  // Altre metriche
  {
    key: "distance",
    label: "Longest Distance",
    unit: "km",
    lowerIsBetter: false,
    category: "other",
  },
  {
    key: "elevation_gain",
    label: "Biggest Elevation Gain",
    unit: "m",
    lowerIsBetter: false,
    category: "other",
  },
  {
    key: "duration",
    label: "Longest Duration",
    unit: "h:m:s",
    lowerIsBetter: false,
    category: "other",
  },
  {
    key: "kilojoules",
    label: "Most Kilojoules",
    unit: "kJ",
    lowerIsBetter: false,
    category: "other",
  },
  {
    key: "max_cadence",
    label: "Max Cadence",
    unit: "rpm",
    lowerIsBetter: false,
    category: "other",
  },
  {
    key: "max_speed",
    label: "Max Speed",
    unit: "km/h",
    lowerIsBetter: false,
    category: "other",
  },
  {
    key: "max_heartrate",
    label: "Max Heart Rate",
    unit: "bpm",
    lowerIsBetter: false,
    category: "other",
  },
  {
    key: "hr_5min",
    label: "Best 5min Heart Rate",
    unit: "bpm",
    lowerIsBetter: false,
    category: "other",
  },
  {
    key: "hr_20min",
    label: "Best 20min Heart Rate",
    unit: "bpm",
    lowerIsBetter: false,
    category: "other",
  },
  {
    key: "hr_1h",
    label: "Best 1h Heart Rate",
    unit: "bpm",
    lowerIsBetter: false,
    category: "other",
  },
];
