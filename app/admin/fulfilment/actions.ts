"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, writeAuditLog } from "@/lib/admin/rbac";
import {
  getFulfilmentWorkflow,
  updateFulfilmentRecord,
  updatePackingRecord,
} from "@/lib/admin/operations";

const STAGES = new Set([
  "packing",
  "quality_check",
  "packed",
  "dispatched",
  "delivered",
]);

export async function advanceFulfilmentStageAction(
  orderId: string,
  formData: FormData,
): Promise<void> {
  const session = await requireAdmin({ permission: "fulfilment.manage" });
  const stage = formData.get("stage");
  if (typeof stage !== "string" || !STAGES.has(stage)) {
    throw new Error("Invalid fulfilment stage.");
  }

  const workflow = await getFulfilmentWorkflow(orderId);
  if (stage === "packing") {
    if (!workflow.packing || workflow.packing.status !== "ready") {
      throw new Error("This order is not ready to pack.");
    }
    await updatePackingRecord(workflow.packing.id, stage, session.user.id);
  } else if (stage === "quality_check") {
    if (!workflow.packing || workflow.packing.status !== "packing") {
      throw new Error("This order must be in packing before quality check.");
    }
    await updatePackingRecord(workflow.packing.id, stage, session.user.id);
  } else if (stage === "packed") {
    if (!workflow.packing || workflow.packing.status !== "quality_check") {
      throw new Error(
        "This order must pass quality check before packing is complete.",
      );
    }
    await updatePackingRecord(workflow.packing.id, stage, session.user.id);
  } else if (stage === "dispatched") {
    if (
      !workflow.fulfilment ||
      workflow.packing?.status !== "packed" ||
      !["pending", "scheduled", "ready"].includes(workflow.fulfilment.status)
    ) {
      throw new Error("This order must be packed and ready before dispatch.");
    }
    await updateFulfilmentRecord(workflow.fulfilment.id, stage);
  } else {
    if (!workflow.fulfilment || workflow.fulfilment.status !== "dispatched") {
      throw new Error(
        "This order must be dispatched before delivery is confirmed.",
      );
    }
    await updateFulfilmentRecord(workflow.fulfilment.id, stage);
  }

  await writeAuditLog({
    action: "fulfilment.stage_advanced",
    entityType: "order",
    entityId: orderId,
    summary: `Fulfilment advanced to ${stage}`,
    details: { stage },
    actorId: session.user.id,
    actorName: session.user.email ?? null,
  });

  revalidatePath("/admin/fulfilment");
  revalidatePath("/admin/fulfilment/[orderNumber]", "page");
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
