export function formatCurrency(value: number, options?: { allowQuote?: boolean }) {
  if (value === 0 && options?.allowQuote !== false) {
    return "Quote";
  }

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}
