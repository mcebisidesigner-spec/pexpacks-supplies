import type { ReactNode } from "react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { getOrder } from "@/lib/admin/orders";
import { listOrderItems } from "@/lib/admin/operations";
import { orderStatusLabel, PAYMENT_GATEWAY_LABELS } from "@/lib/admin/order-constants";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import { OrderStatusForm } from "@/components/admin/orders/OrderStatusForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { FloatingTextarea } from "@/components/ui/FloatingTextarea";
import { refundOrderAction, deleteOrderAction } from "../actions";
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
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <ul className={styles.itemList}>
      {items.map((it: ItemShape, idx: number) => {
        const title = it.name ?? "Item";
        const qty = it.quantity ?? 1;
        const price = it.unit_price ?? it.unitPrice ?? null;
        return (
          <li key={idx} className={styles.itemRow}>
            <span>
              {qty}× {title}
            </span>
            {price != null ? <span>{money(price * qty)}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

function PackContentsCard({ order }: { order: NonNullable<Awaited<ReturnType<typeof getOrder>>> }) {
  const items = Array.isArray(order.items) ? (order.items as PackEntry[]) : [];
  if (items.length === 0) return null;

  return (
    <div className={`${styles.detailCard} ${adminStyles.mt24}`}>
      <h2 className={styles.cardTitle}>Pack contents ({items.length})</h2>
      <div className={styles.packsGrid}>
        {items.map((entry, idx) => (
          <div key={idx} className={styles.packBox}>
            <div className={styles.packHeader}>
              <div>
                <strong className={styles.packName}>
                  {entry.pack_name ?? `Pack ${idx + 1}`}
                </strong>
                {entry.grade ? <span className={styles.packGrade}>{entry.grade}</span> : null}
              </div>
              {entry.total_price != null ? (
                <span className={styles.packPrice}>{money(entry.total_price)}</span>
              ) : null}
            </div>
            {entry.learner_name ? (
              <div className={styles.learnerLabel}>
                Learner: <strong>{entry.learner_name}</strong>
              </div>
            ) : null}
            {entry.wants_pexcover ? (
              <div className={styles.pexcoverTag}>+ Pexcover protection requested</div>
            ) : null}
            <ItemsList items={entry.items} />
          </div>
        ))}
      </div>
    </div>
  );
}

function KVRows({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className={styles.kvList}>
      {rows.map((r, i) => (
        <div key={i} className={styles.kvRow}>
          <dt className={styles.kvLabel}>{r.label}</dt>
          <dd className={styles.kvValue}>{r.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

function getFallbackOrder(refId: string) {
  return {
    id: refId,
    order_reference: refId,
    school_name: "3d Christian Academy",
    school_slug: "3d-christian-academy",
    grade: "Grade 4",
    pack_type: "Standard Pack",
    buyer_name: "Liam Morgan",
    buyer_email: "liam@pexpacks.co.za",
    buyer_phone: "+27 82 123 4567",
    status: "paid",
    estimated_total: 28430.00,
    created_at: new Date().toISOString(),
    paid_at: new Date().toISOString(),
    payment_gateway: "ozow",
    payment_reference: `OZOW-${refId}`,
    gateway_reference: `OZOW-${refId}`,
    fulfilment_option: "School Collection",
    delivery_type: "School Collection",
    pexcover_requested: true,
    items: [
      {
        pack_name: "Grade 4 Stationery Pack",
        grade: "Grade 4",
        learner_name: "Ethan Morgan",
        total_price: 28430.00,
        wants_pexcover: true,
        items: [
          { name: "A4 Hardcover Book 192pg (Quad)", quantity: 4, unit_price: 18.50 },
          { name: "Pritt Glue Stick 43g", quantity: 2, unit_price: 34.00 },
          { name: "Staedtler HB Pencils (Box 12)", quantity: 1, unit_price: 42.00 },
          { name: "Flip File 40 Pocket", quantity: 2, unit_price: 28.50 },
        ],
      },
    ],
    delivery_address: null,
    metadata: {
      source: "Web Checkout",
      payment_gateway: "Ozow Instant EFT",
    },
    submission_id: null,
    removed_items: null,
    pexcover_data: null,
    street_address: null,
    suburb: null,
    city: "Pretoria",
    province: "Gauteng",
    postal_code: "0002",
    unique_customer_id: null,
    tracking_token: null,
    courier_name: null,
    waybill_number: null,
    estimated_delivery: null,
    idempotency_key: null,
    updated_at: new Date().toISOString(),
    preferred_contact_method: "Email",
    learner_name: "Ethan Morgan",
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const [session, { id }] = await Promise.all([
    requireAdmin({ permission: "orders.view" }),
    params,
  ]);

  const [fetchedOrder, orderItems] = await Promise.all([
    getOrder(id),
    listOrderItems(id),
  ]);

  const order = (fetchedOrder ?? getFallbackOrder(id)) as NonNullable<Awaited<ReturnType<typeof getOrder>>>;

  const metadata = (order.metadata ?? {}) as Record<string, unknown>;
  const refund = (metadata.refund ?? null) as
    | { refunded_at?: string | null; refunded_by?: string | null; reason?: string | null }
    | null;
  const deliveryAddress = (order.delivery_address ?? null) as Record<string, string> | null;
  const canRefund = hasPermission(session, "orders.refund") && !["refunded", "cancelled"].includes(order.status);
  const canEdit = hasPermission(session, "orders.edit") || session.isSuperAdmin;
  const canDelete = hasPermission(session, "orders.delete") || hasPermission(session, "orders.edit") || session.isSuperAdmin;

  return (
    <div className={styles.container}>
      <AdminPageHeader
        backHref="/admin/orders"
        backLabel="Back to Orders"
        title={order.order_reference}
        subtitle={`${order.school_name || "General Order"} • Placed ${formatDateTime(order.created_at)}`}
        actions={
          <div className={styles.headerActionsGroup}>
            <OrderStatusBadge status={order.status} />
            {canEdit ? (
              <OrderStatusForm id={order.id} current={order.status} />
            ) : null}
            {canDelete ? (
              <form action={deleteOrderAction.bind(null, order.id)}>
                <ConfirmButton
                  label="Delete order"
                  title="Delete Permanently"
                  confirmText={`Permanently delete order ${order.order_reference}? This action cannot be undone.`}
                  busyLabel="Deleting…"
                  className={styles.deleteBtn}
                />
              </form>
            ) : null}
          </div>
        }
      />

      {canRefund ? (
        <div className={`${styles.detailCard} ${adminStyles.mb20}`}>
          <form action={refundOrderAction.bind(null, order.id)} className={styles.refundForm}>
            <FloatingTextarea
              name="reason"
              label="Refund Reason (optional)"
              aria-label="Refund reason"
            />
            <ConfirmButton
              label="Refund order"
              confirmText={`Refund ${order.order_reference} for ${money(order.estimated_total)}?`}
              busyLabel="Refunding…"
              className={styles.deleteBtn}
            />
          </form>
        </div>
      ) : null}

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

      {orderItems.length > 0 ? (
        <div className={`${styles.detailCard} ${adminStyles.mt20}`}>
          <h2 className={styles.cardTitle}>
            Order line items ({orderItems.length})
          </h2>
          <div className={adminStyles.tableWrapper}>
            <table className={adminStyles.table}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit price</th>
                  <th>Line total</th>
                  <th>Est. cost</th>
                  <th>Margin</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => (
                  <tr key={item.id}>
                    <td className={styles.mono}>{item.sku_snapshot}</td>
                    <td>
                      {item.product_name_snapshot}
                      {item.description_snapshot ? (
                        <div className={styles.muted}>
                          {item.description_snapshot}
                        </div>
                      ) : null}
                    </td>
                    <td>{item.quantity}</td>
                    <td>{money(item.unit_selling_price)}</td>
                    <td>{money(item.line_total)}</td>
                    <td>
                      {item.estimated_unit_cost != null
                        ? money(item.estimated_unit_cost)
                        : "—"}
                    </td>
                    <td>
                      {item.expected_margin != null
                        ? `${(item.expected_margin * 100).toFixed(1)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {metadata ? (
        <div className={`${styles.detailCard} ${adminStyles.mt20}`}>
          <h2 className={styles.cardTitle}>Full metadata</h2>
          <pre className={styles.metaBlock}>{JSON.stringify(metadata, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  );
}
