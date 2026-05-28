"use client";

export type OrderDraft = {
  id: string;
  createdAt: string;
  type: string;
  schoolSlug?: string;
  gradeSlug?: string;
  phaseSlug?: string;
  packId?: string;
  grade?: string;
  siblingGrades?: string;
  siblingPackCount?: number;
  selectedItems?: string;
  removedItems?: string;
  estimatedTotal?: number;
  subtotal?: number;
  discount?: number;
  pexcoverRequested?: boolean;
  pexcoverName?: string;
};

const DRAFT_PREFIX = "Pexpacks:order-draft:";
const DRAFT_TTL_MS = 1000 * 60 * 60 * 24;

function createDraftId() {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `draft-${random}`;
}

function getDraftKey(id: string) {
  return `${DRAFT_PREFIX}${id}`;
}

export function saveOrderDraft(draft: Omit<OrderDraft, "id" | "createdAt">, customId?: string) {
  const id = customId || createDraftId();
  const orderDraft: OrderDraft = {
    ...draft,
    id,
    createdAt: new Date().toISOString(),
  };

  sessionStorage.setItem(getDraftKey(id), JSON.stringify(orderDraft));

  return orderDraft;
}

export function readOrderDraft(id?: string) {
  if (!id) {
    return null;
  }

  const raw = sessionStorage.getItem(getDraftKey(id));
  if (!raw) {
    return null;
  }

  try {
    const draft = JSON.parse(raw) as OrderDraft;
    const createdAt = new Date(draft.createdAt).getTime();

    if (!Number.isFinite(createdAt) || Date.now() - createdAt > DRAFT_TTL_MS) {
      sessionStorage.removeItem(getDraftKey(id));
      return null;
    }

    return draft;
  } catch {
    sessionStorage.removeItem(getDraftKey(id));
    return null;
  }
}
