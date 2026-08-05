"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  parseOrderStatus,
  updateOrderStatus,
  refundOrder,
} from "@/lib/admin/orders";

export async function updateOrderStatusAction(
  id: string,
  formData: FormData
): Promise<void> {
  await requireAdmin({ permission: "orders.edit" });
  const parsed = parseOrderStatus(formData);
  if (!parsed.ok) return;
  await updateOrderStatus(id, parsed.status);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}

export async function refundOrderAction(
  id: string,
  formData: FormData
): Promise<void> {
  await requireAdmin({ permission: "orders.refund" });
  const reason = formData.get("reason");
  await refundOrder(id, typeof reason === "string" ? reason : undefined);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}
