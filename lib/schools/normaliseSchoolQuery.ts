export function normaliseSchoolQuery(value: string | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normaliseFilterValue(value: string | undefined) {
  const trimmed = (value ?? "").trim();
  return trimmed && trimmed !== "all" ? trimmed : "";
}
