export function formatCurrency(value: number) {
  if (value === 0) {
    return "Quote";
  }

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0
  }).format(value);
}
