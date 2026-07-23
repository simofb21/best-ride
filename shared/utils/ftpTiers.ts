export interface FtpTier {
  minWkg: number;
  message: (wkg: number) => string;
}

// Ordinate dalla più alta alla più bassa: la prima che soddisfa min viene usata
export const FTP_TIERS: FtpTier[] = [
  { minWkg: 7, message: () => "Are you Pogi?" },
  { minWkg: 6, message: () => "Are you a Pro or something like that?" },
  { minWkg: 5, message: () => "You are very strong!" },
  {
    minWkg: 4,
    message: (wkg) => `Good level. You can still improve!`,
  },
  {
    minWkg: 3,
    message: (wkg) =>
      `You are a good rider. Still ${(7 - wkg).toFixed(1)} w/kg to reach Pogacar Level. `,
  },
  {
    minWkg: 2,
    message: (wkg) => `Solid fitness base. `,
  },
  {
    minWkg: 0,
    message: (wkg) =>
      `You have just started your cycling journey. Keep training and you will improve!`,
  },
];

export function getFtpMessage(wkg: number): string {
  const tier = FTP_TIERS.find((t) => wkg >= t.minWkg);
  return tier ? tier.message(wkg) : "";
}
