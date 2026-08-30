"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { refundOrder, deleteOrder } from "@/lib/admin/orders";

export async function refundPaymentAction(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin({ permission: "payments.refund" });
  const reason = formData.get("reason");
  await refundOrder(
    id,
    typeof reason === "string" ? reason : undefined,
    "payments.refund",
  );
  revalidatePath("/admin/payments");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
}

export async function deletePaymentAction(id: string): Promise<void> {
  await requireAdmin({ permission: "orders.edit" });
  await deleteOrder(id, "orders.edit");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  redirect("/admin/payments");
}
