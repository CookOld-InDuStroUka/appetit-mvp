export const toNumber = (v: any) => (typeof v === "number" ? v : Number(v));
export const money2 = (v: number) => Math.round(v * 100) / 100;
