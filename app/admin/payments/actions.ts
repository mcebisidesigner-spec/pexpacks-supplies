"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/rbac";
import { refundOrder } from "@/lib/admin/orders";

export async function refundPaymentAction(
  id: string,
  formData: FormData
): Promise<void> {
  await requireAdmin({ permission: "payments.refund" });
  const reason = formData.get("reason");
  await refundOrder(id, typeof reason === "string" ? reason : undefined, "payments.refund");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
}
