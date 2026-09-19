import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { getOrder } from "@/lib/admin/orders";
import { listOrderItems } from "@/lib/admin/operations";
import {
  normalisePexcoverPaperStyle,
  pexcoverPaperStyleLabel,
} from "@/lib/pricing/pexcover-paper-style";
import {
  orderStatusLabel,
  PAYMENT_GATEWAY_LABELS,
} from "@/lib/admin/order-constants";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import { OrderStatusForm } from "@/components/admin/orders/OrderStatusForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { refundOrderAction, deleteOrderAction } from "../actions";

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
  pexcover_paper_style?: string | null;
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
    <ul className="flex flex-col gap-1.5 list-none m-0 p-0">
      {items.map((it: ItemShape, idx: number) => {
        const title = it.name ?? "Item";
        const qty = it.quantity ?? 1;
        const price = it.unit_price ?? it.unitPrice ?? null;
        return (
          <li key={idx} className="flex items-baseline justify-between gap-2 text-xs text-slate-300">
            <span>
              {qty}× {title}
            </span>
            {price != null ? (
              <span className="font-mono text-slate-200 font-medium">
                {money(price * qty)}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function PackContentsCard({
  order,
}: {
  order: NonNullable<Awaited<ReturnType<typeof getOrder>>>;
}) {
  const items = Array.isArray(order.items) ? (order.items as PackEntry[]) : [];
  if (items.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm shadow-black/20 mt-6">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        Pack contents ({items.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {items.map((entry, idx) => (
          <div
            key={idx}
            className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5"
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <strong className="text-sm font-bold text-slate-100">
                  {entry.pack_name ?? `Pack ${idx + 1}`}
                </strong>
                {entry.grade ? (
                  <span className="block text-xs text-slate-400 font-normal mt-0.5">
                    {entry.grade}
                  </span>
                ) : null}
              </div>
              {entry.total_price != null ? (
                <span className="text-sm font-extrabold text-emerald-400">
                  {money(entry.total_price)}
                </span>
              ) : null}
            </div>
            {entry.learner_name ? (
              <div className="text-xs text-slate-400">
                Learner: <strong className="text-slate-200">{entry.learner_name}</strong>
              </div>
            ) : null}
            {entry.wants_pexcover ? (
              <div className="flex items-center justify-between text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span>Pexcover requested</span>
                <span>
                  {pexcoverPaperStyleLabel(
                    normalisePexcoverPaperStyle(entry.pexcover_paper_style),
                  )}
                  {entry.pexcover_price != null
                    ? ` - ${money(entry.pexcover_price)}`
                    : null}
                </span>
              </div>
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
    <dl className="flex flex-col gap-2.5 m-0">
      {rows.map((r, i) => (
        <div key={i} className="flex justify-between gap-4 text-xs sm:text-sm">
          <dt className="text-slate-400 font-medium">{r.label}</dt>
          <dd className="text-right font-semibold break-words text-slate-100 m-0">
            {r.value ?? "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const [session, { id }] = await Promise.all([
    requireAdmin({ permission: "orders.view" }),
    params,
  ]);

  const [fetchedOrder, orderItems] = await Promise.all([
    getOrder(id),
    listOrderItems(id),
  ]);

  if (!fetchedOrder) {
    notFound();
  }

  const order = fetchedOrder as NonNullable<
    Awaited<ReturnType<typeof getOrder>>
  >;

  const metadata = (order.metadata ?? {}) as Record<string, unknown>;
  const refund = (metadata.refund ?? null) as {
    refunded_at?: string | null;
    refunded_by?: string | null;
    reason?: string | null;
  } | null;
  const deliveryAddress = (order.delivery_address ?? null) as Record<
    string,
    string
  > | null;
  const canRefund =
    hasPermission(session, "orders.refund") &&
    !["refunded", "cancelled"].includes(order.status);
  const canEdit = hasPermission(session, "orders.edit") || session.isSuperAdmin;
  const canDelete =
    hasPermission(session, "orders.delete") ||
    hasPermission(session, "orders.edit") ||
    session.isSuperAdmin;

  return (
    <div className="flex flex-col gap-6 w-full text-slate-200">
      <AdminPageHeader
        backHref="/admin/orders"
        backLabel="Back to Orders"
        title={order.order_reference}
        subtitle={`${order.school_name || "General Order"} • Placed ${formatDateTime(order.created_at)}`}
        actions={
          <div className="flex items-center gap-3 flex-wrap">
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
                  className="inline-flex items-center justify-center h-9.5 px-4 border border-rose-500/30 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 text-xs font-semibold cursor-pointer transition-colors"
                />
              </form>
            ) : null}
          </div>
        }
      />

      {canRefund ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm shadow-black/20">
          <form
            action={refundOrderAction.bind(null, order.id)}
            className="flex flex-col gap-3"
          >
            <label className="text-xs font-bold text-slate-300" htmlFor="refund_reason">
              Refund Reason (optional)
            </label>
            <textarea
              id="refund_reason"
              name="reason"
              className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-sm outline-none focus:border-emerald-500 resize-y min-h-[80px]"
              aria-label="Refund reason"
            />
            <ConfirmButton
              label="Refund order"
              confirmText={`Refund ${order.order_reference} for ${money(order.estimated_total)}?`}
              busyLabel="Refunding…"
              className="inline-flex items-center justify-center h-9.5 px-4 border border-rose-500/30 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 text-xs font-semibold cursor-pointer transition-colors self-start"
            />
          </form>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm shadow-black/20">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Buyer
          </h2>
          <KVRows
            rows={[
              { label: "Name", value: order.buyer_name },
              {
                label: "Phone",
                value: order.buyer_phone ? (
                  <a href={`tel:${order.buyer_phone}`} className="text-emerald-400 hover:underline">
                    {order.buyer_phone}
                  </a>
                ) : (
                  "—"
                ),
              },
              {
                label: "Email",
                value: order.buyer_email ? (
                  <a href={`mailto:${order.buyer_email}`} className="text-emerald-400 hover:underline">
                    {order.buyer_email}
                  </a>
                ) : (
                  "—"
                ),
              },
              {
                label: "Contact method",
                value: order.preferred_contact_method ?? "—",
              },
              { label: "Learner", value: order.learner_name ?? "—" },
            ]}
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm shadow-black/20">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Order
          </h2>
          <KVRows
            rows={[
              { label: "School", value: order.school_name },
              {
                label: "School slug",
                value: order.school_slug ? `/${order.school_slug}` : "—",
              },
              { label: "Grade", value: order.grade },
              { label: "Pack type", value: order.pack_type ?? "—" },
              {
                label: "Pexcover",
                value: order.pexcover_requested ? "Requested" : "Not requested",
              },
            ]}
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm shadow-black/20">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Delivery
          </h2>
          <KVRows
            rows={[
              {
                label: "Method",
                value: order.fulfilment_option ?? order.delivery_type ?? "—",
              },
              {
                label: "Address",
                value:
                  deliveryAddress && Object.keys(deliveryAddress).length > 0
                    ? Object.entries(deliveryAddress)
                        .map(([, v]) => v)
                        .filter(Boolean)
                        .join(", ")
                    : [
                        order.street_address,
                        order.suburb,
                        order.city,
                        order.province,
                        order.postal_code,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—",
              },
            ]}
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm shadow-black/20">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Payment
          </h2>
          <KVRows
            rows={[
              { label: "Status", value: orderStatusLabel(order.status) },
              { label: "Gateway", value: gatewayLabel(order.payment_gateway) },
              {
                label: "Gateway reference",
                value: (
                  <span className="font-mono text-xs text-slate-300">
                    {order.gateway_reference ?? order.payment_reference ?? "—"}
                  </span>
                ),
              },
              { label: "Paid at", value: formatDateTime(order.paid_at) },
            ]}
          />
          {refund ? (
            <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              Refunded
              {refund.refunded_at
                ? ` ${formatDateTime(refund.refunded_at)}`
                : ""}
              {refund.refunded_by ? ` by ${refund.refunded_by}` : ""}
              {refund.reason ? ` — ${refund.reason}` : ""}
            </div>
          ) : null}
        </div>
      </div>

      <PackContentsCard order={order} />

      {orderItems.length > 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm shadow-black/20 mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Order line items ({orderItems.length})
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold">
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Unit price</th>
                  <th className="px-4 py-3">Line total</th>
                  <th className="px-4 py-3">Est. cost</th>
                  <th className="px-4 py-3">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orderItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-300">{item.sku_snapshot}</td>
                    <td className="px-4 py-3 text-slate-200">
                      {item.product_name_snapshot}
                      {item.description_snapshot ? (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.description_snapshot}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-semibold">{item.quantity}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{money(item.unit_selling_price)}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-emerald-400">{money(item.line_total)}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {item.estimated_unit_cost != null
                        ? money(item.estimated_unit_cost)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-300">
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm shadow-black/20 mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Full metadata
          </h2>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-96">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
