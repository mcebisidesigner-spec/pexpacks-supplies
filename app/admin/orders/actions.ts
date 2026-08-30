"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import {
  parseOrderStatus,
  updateOrderStatus,
  refundOrder,
  deleteOrder,
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

export async function deleteOrderAction(id: string): Promise<void> {
  await requireAdmin({ permission: "orders.edit" });
  await deleteOrder(id, "orders.edit");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  redirect("/admin/orders");
}
