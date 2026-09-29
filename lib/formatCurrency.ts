export function formatCurrency(
  value: number,
  options?: { allowQuote?: boolean; maximumFractionDigits?: number },
) {
  if (options?.allowQuote === true && value === 0) {
    return "Quote";
  }
  if (!value || value === 0 || Number.isNaN(value)) {
    return "R00.00";
  }

  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(rounded);
}
