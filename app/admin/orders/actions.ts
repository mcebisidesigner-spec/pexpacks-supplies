"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  parseOrderStatus,
  updateOrderStatus,
  refundOrder,
  deleteOrder,
} from "@/lib/admin/orders";

// NOTE: Admin pages are dynamically rendered (behind auth middleware).
// They do NOT use ISR, so revalidatePath("/admin/*") is wasted ISR writes.
// The router.refresh() on the client side is sufficient for admin pages.

export async function updateOrderStatusAction(
  id: string,
  formData: FormData
): Promise<void> {
  await requireAdmin({ permission: "orders.edit" });
  const parsed = parseOrderStatus(formData);
  if (!parsed.ok) return;
  await updateOrderStatus(id, parsed.status);
}

export async function refundOrderAction(
  id: string,
  formData: FormData
): Promise<void> {
  await requireAdmin({ permission: "orders.refund" });
  const reason = formData.get("reason");
  await refundOrder(id, typeof reason === "string" ? reason : undefined);
}

export async function deleteOrderAction(id: string): Promise<void> {
  await requireAdmin({ permission: "orders.edit" });
  await deleteOrder(id, "orders.edit");
  redirect("/admin/orders");
}
