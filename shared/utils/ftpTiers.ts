export interface FtpTier {
  minWkg: number;
  message: (wkg: number) => string;
}

// Ordinate dalla più alta alla più bassa: la prima che soddisfa min viene usata
export const FTP_TIERS: FtpTier[] = [
  { minWkg: 7, message: () => "You're a pro-level engine. Absolutely elite." },
  { minWkg: 6, message: () => "You have a genuinely huge engine." },
  { minWkg: 5, message: () => "Cat 1/2 territory — you're seriously strong." },
  {
    minWkg: 4,
    message: (wkg) =>
      `Solid amateur racer level. ${(5 - wkg).toFixed(1)} w/kg to reach Cat 1/2.`,
  },
  {
    minWkg: 3,
    message: (wkg) =>
      `You're missing ${(4 - wkg).toFixed(1)} w/kg to reach a strong amateur level.`,
  },
  {
    minWkg: 2,
    message: (wkg) =>
      `Solid fitness base. ${(3 - wkg).toFixed(1)} w/kg to the next tier.`,
  },
  {
    minWkg: 0,
    message: (wkg) =>
      `Just getting started — ${(2 - wkg).toFixed(1)} w/kg to a solid fitness base.`,
  },
];

export function getFtpMessage(wkg: number): string {
  const tier = FTP_TIERS.find((t) => wkg >= t.minWkg);
  return tier ? tier.message(wkg) : "";
}
