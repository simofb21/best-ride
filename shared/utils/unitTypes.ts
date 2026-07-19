// Valore speciale salvato in `unit` quando il record è di tipo tempo.
// Usato sia per popolare la select, sia per riconoscere il tipo in lettura.
export const TIME_UNIT_VALUE = "h:m:s";

export interface UnitTypeOption {
  value: string; // usato solo in UI per la select
  label: string;
  fixedUnit: string | null; // stringa da salvare in `unit` — null = l'utente la scrive lui
  lowerIsBetterDefault: boolean;
}

export const UNIT_TYPE_OPTIONS: UnitTypeOption[] = [
  {
    value: "time",
    label: "Time",
    fixedUnit: TIME_UNIT_VALUE,
    lowerIsBetterDefault: true,
  },
  {
    value: "speed",
    label: "Speed",
    fixedUnit: "km/h",
    lowerIsBetterDefault: false,
  },
  {
    value: "power",
    label: "Power",
    fixedUnit: "W",
    lowerIsBetterDefault: false,
  },
  {
    value: "distance",
    label: "Distance",
    fixedUnit: "km",
    lowerIsBetterDefault: false,
  },
  {
    value: "other",
    label: "Other (custom unit)",
    fixedUnit: null,
    lowerIsBetterDefault: false,
  },
];

export function isTimeUnit(unit: string): boolean {
  return unit === TIME_UNIT_VALUE;
}
