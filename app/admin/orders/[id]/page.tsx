import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { getOrder } from "@/lib/admin/orders";
import { orderStatusLabel, PAYMENT_GATEWAY_LABELS } from "@/lib/admin/order-constants";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import { OrderStatusForm } from "@/components/admin/orders/OrderStatusForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { refundOrderAction } from "../actions";
import shared from "../../schools/schools.module.css";
import adminStyles from "../../admin.module.css";
import styles from "../orders.module.css";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

function money(v: number | null): string {
  return v == null ? "—" : `R ${v.toFixed(2)}`;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function gatewayLabel(gateway: string | null | undefined): string {
  if (!gateway) return "—";
  return PAYMENT_GATEWAY_LABELS[gateway] ?? gateway;
}

interface PackEntry {
  learner_name?: string | null;
  school_name?: string | null;
  grade?: string | null;
  pack_name?: string | null;
  pack_mode?: string | null;
  items?: unknown;
  total_price?: number | null;
  wants_pexcover?: boolean | null;
  pexcover_price?: number | null;
  base_pack_price?: number | null;
}

interface ItemShape {
  name?: string | null;
  quantity?: number | null;
  unit_price?: number | null;
  unitPrice?: number | null;
  lineTotal?: number | null;
}

function ItemsList({ items }: { items: unknown }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className={styles.mutedText}>No items recorded.</p>;
  }
  return (
    <div className={styles.itemList}>
      {items.map((raw, i) => {
        if (typeof raw === "string") {
          return (
            <div key={`${raw}-${i}`} className={styles.itemRow}>
              <span className={styles.itemDot}>•</span>
              <span className={styles.itemName}>{raw}</span>
            </div>
          );
        }
        const item = (raw ?? {}) as ItemShape;
        const name = item.name || "—";
        const qty = item.quantity;
        const unit = item.unit_price ?? item.unitPrice ?? item.lineTotal;
        return (
          <div key={`${name}-${i}`} className={styles.itemRow}>
            <span className={styles.itemDot}>•</span>
            <span className={styles.itemName}>{name}</span>
            <span className={styles.itemQty}>
              {qty ? `× ${qty}` : ""}
              {unit ? ` · ${money(Number(unit))}` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PackContentsCard({ order }: { order: NonNullable<Awaited<ReturnType<typeof getOrder>>> }) {
  const metadata = (order.metadata ?? {}) as Record<string, unknown>;
  const packs = Array.isArray(metadata.packs) ? (metadata.packs as PackEntry[]) : [];
  const notes = typeof metadata.notes === "string" ? metadata.notes : null;
  const multi = order.pack_type === "multi-school" && packs.length > 0;

  return (
    <div className={styles.detailCard}>
      <h2 className={styles.cardTitle}>Pack contents</h2>
      {multi ? (
        packs.map((p, i) => (
          <div key={`${p.pack_name}-${i}`} className={styles.packBlock}>
            <h3 className={styles.packHeading}>
              {[p.learner_name, p.school_name, p.grade ? `Grade ${p.grade}` : null]
                .filter(Boolean)
                .join(" · ")}
            </h3>
            <ItemsList items={p.items} />
            <div className={styles.amountRow}>
              <span className={styles.amountLabel}>
                {p.pack_name ?? "Pack"}
                {p.wants_pexcover ? " (+ Pexcover)" : ""}
              </span>
              <span className={styles.amountValue}>{money(p.total_price ?? null)}</span>
            </div>
          </div>
        ))
      ) : (
        <ItemsList items={order.items} />
      )}
      {notes ? (
        <div className={styles.amountRow}>
          <span className={styles.amountLabel}>Notes</span>
        </div>
      ) : null}
      {notes ? <p className={styles.mutedText}>{notes}</p> : null}
      <div className={styles.amountRow}>
        <span className={styles.amountLabel}>Total</span>
        <span className={styles.amountValue}>{money(order.estimated_total)}</span>
      </div>
    </div>
  );
}

function KVRows({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <div className={styles.kvList}>
      {rows.map((row) => (
        <div key={row.label} className={styles.kvRow}>
          <span className={styles.kvLabel}>{row.label}</span>
          <span className={styles.kvValue}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await requireAdmin({ permission: "orders.view" });
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const metadata = (order.metadata ?? {}) as Record<string, unknown>;
  const refund = (metadata.refund ?? null) as
    | { refunded_at?: string | null; refunded_by?: string | null; reason?: string | null }
    | null;
  const deliveryAddress = (order.delivery_address ?? null) as Record<string, string> | null;
  const canRefund = hasPermission(session, "orders.refund") && !["refunded", "cancelled"].includes(order.status);
  const canEdit = hasPermission(session, "orders.edit");

  return (
    <div className={adminStyles.adminContainer}>
      <div className={styles.detailHeader}>
        <Link href="/admin/orders" className={shared.resetLink}>
          ← Back to orders
        </Link>
        <div className={styles.detailTitleRow}>
          <span className={styles.reference}>{order.order_reference}</span>
          <OrderStatusBadge status={order.status} />
          <span className={styles.created}>{formatDateTime(order.created_at)}</span>
        </div>
        {canEdit ? (
          <OrderStatusForm id={order.id} current={order.status} />
        ) : null}
        {canRefund ? (
          <form action={refundOrderAction.bind(null, order.id)} className={styles.refundForm}>
            <textarea
              name="reason"
              placeholder="Refund reason (optional)"
              className={styles.refundReason}
              aria-label="Refund reason"
            />
            <ConfirmButton
              label="Refund order"
              confirmText={`Refund ${order.order_reference} for ${money(order.estimated_total)}?`}
              busyLabel="Refunding…"
              className={`${shared.rowButton} ${shared.rowButtonDelete}`}
            />
          </form>
        ) : null}
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailCard}>
          <h2 className={styles.cardTitle}>Buyer</h2>
          <KVRows
            rows={[
              { label: "Name", value: order.buyer_name },
              {
                label: "Phone",
                value: order.buyer_phone ? (
                  <a href={`tel:${order.buyer_phone}`}>{order.buyer_phone}</a>
                ) : (
                  "—"
                ),
              },
              {
                label: "Email",
                value: order.buyer_email ? (
                  <a href={`mailto:${order.buyer_email}`}>{order.buyer_email}</a>
                ) : (
                  "—"
                ),
              },
              { label: "Contact method", value: order.preferred_contact_method ?? "—" },
              { label: "Learner", value: order.learner_name ?? "—" },
            ]}
          />
        </div>

        <div className={styles.detailCard}>
          <h2 className={styles.cardTitle}>Order</h2>
          <KVRows
            rows={[
              { label: "School", value: order.school_name },
              { label: "School slug", value: order.school_slug ? `/${order.school_slug}` : "—" },
              { label: "Grade", value: order.grade },
              { label: "Pack type", value: order.pack_type ?? "—" },
              {
                label: "Pexcover",
                value: order.pexcover_requested ? "Requested" : "Not requested",
              },
            ]}
          />
        </div>

        <div className={styles.detailCard}>
          <h2 className={styles.cardTitle}>Delivery</h2>
          <KVRows
            rows={[
              { label: "Method", value: order.fulfilment_option ?? order.delivery_type ?? "—" },
              {
                label: "Address",
                value: deliveryAddress && Object.keys(deliveryAddress).length > 0 ? (
                  Object.entries(deliveryAddress)
                    .map(([, v]) => v)
                    .filter(Boolean)
                    .join(", ")
                ) : (
                  [order.street_address, order.suburb, order.city, order.province, order.postal_code]
                    .filter(Boolean)
                    .join(", ") || "—"
                ),
              },
            ]}
          />
        </div>

        <div className={styles.detailCard}>
          <h2 className={styles.cardTitle}>Payment</h2>
          <KVRows
            rows={[
              { label: "Status", value: orderStatusLabel(order.status) },
              { label: "Gateway", value: gatewayLabel(order.payment_gateway) },
              {
                label: "Gateway reference",
                value: (
                  <span className={styles.mono}>
                    {order.gateway_reference ?? order.payment_reference ?? "—"}
                  </span>
                ),
              },
              { label: "Paid at", value: formatDateTime(order.paid_at) },
            ]}
          />
          {refund ? (
            <div className={styles.refundInfo}>
              Refunded{refund.refunded_at ? ` ${formatDateTime(refund.refunded_at)}` : ""}
              {refund.refunded_by ? ` by ${refund.refunded_by}` : ""}
              {refund.reason ? ` — ${refund.reason}` : ""}
            </div>
          ) : null}
        </div>
      </div>

      <PackContentsCard order={order} />

      {metadata ? (
        <div className={styles.detailCard} style={{ marginTop: 20 }}>
          <h2 className={styles.cardTitle}>Full metadata</h2>
          <pre className={styles.metaBlock}>{JSON.stringify(metadata, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  );
}
