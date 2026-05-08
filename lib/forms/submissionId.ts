import { randomUUID } from "crypto";

export function createSubmissionId() {
  return `pex_${randomUUID()}`;
}
