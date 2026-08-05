export function happyPayInstalment(total: number): number {
  return Math.round((total / 2) * 100) / 100;
}

export function formatInstalment(value: number): string {
  const hasCents = value % 1 !== 0;
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}
