export function formatCurrency(
  value: number,
  options?: { allowQuote?: boolean; maximumFractionDigits?: number },
) {
  if (value === 0 && options?.allowQuote !== false) {
    return "Quote";
  }

  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(rounded);
}
