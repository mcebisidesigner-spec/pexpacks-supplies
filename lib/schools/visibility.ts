export function isSchoolPublic(
  status: string | null | undefined,
  published: boolean | null | undefined,
) {
  return status === "active" && published !== false;
}
