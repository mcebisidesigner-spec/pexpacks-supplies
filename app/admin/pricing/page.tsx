import { CheckCircle2, Settings2, Tags } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listPricingReview, listPricingRules, listPriceHistory } from "@/lib/admin/operations";
import { money, formatDate } from "@/lib/admin/ui-utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MetricCard } from "@/components/admin/ui/AdminCard";
import { ZarIcon } from "@/components/admin/ui/ZarIcon";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  approveProductPriceAction,
  createPricingRuleAction,
} from "../operations-actions";
import admin from "../admin.module.css";
import styles from "../operations.module.css";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const [session, products, rules, priceHistory] = await Promise.all([
    requireAdmin({ permission: "pricing.view" }),
    listPricingReview(),
    listPricingRules(),
    listPriceHistory(50),
  ]);
  const exceptions = products.filter(
    (p) => p.pricing_status !== "approved",
  ).length;
  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Price Review & Rules"
        subtitle="Approve selling prices from verified cost and preserve commercial markup integrity."
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        <MetricCard
          label="Products Reviewed"
          value={products.length}
          icon={<Tags size={16} />}
          iconTone="green"
        />
        <MetricCard
          label="Require Attention"
          value={exceptions}
          subtext="Pending pricing review"
          icon={<ZarIcon size={16} />}
          iconTone={exceptions > 0 ? "amber" : "green"}
        />
        <MetricCard
          label="Approved Prices"
          value={products.length - exceptions}
          icon={<CheckCircle2 size={16} />}
          iconTone="green"
        />
        <MetricCard
          label="Active Rules"
          value={rules.filter((rule) => rule.active).length}
          icon={<Settings2 size={16} />}
          iconTone="blue"
        />
      </div>
      {hasPermission(session, "pricing.manage") ? (
        <section className={styles.formPanel}>
          <h2>Add pricing rule</h2>
          <form action={createPricingRuleAction} className={styles.formGrid}>
            <input
              className={styles.field}
              name="name"
              placeholder="Rule name"
              required
            />
            <select className={styles.field} name="scope" defaultValue="global">
              <option value="global">Global</option>
              <option value="category">Category</option>
              <option value="brand">Brand</option>
              <option value="product">Product ID</option>
            </select>
            <input
              className={styles.field}
              name="scopeValue"
              placeholder="Scope value (blank for global)"
            />
            <select
              className={styles.field}
              name="method"
              defaultValue="markup"
            >
              <option value="markup">Markup</option>
              <option value="margin">Gross margin</option>
            </select>
            <input
              className={styles.field}
              name="ratePercent"
              type="number"
              min="0"
              max="99.99"
              step="0.01"
              placeholder="Rate %"
              required
            />
            <input
              className={styles.field}
              name="roundingIncrement"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue="0.01"
              aria-label="Rounding increment"
            />
            <input
              className={styles.field}
              name="priority"
              type="number"
              defaultValue="100"
              aria-label="Priority"
            />
            <button className={styles.button}>Add rule</button>
          </form>
        </section>
      ) : null}
      <div className={admin.tableCard}>
        {products.length ? (
          <div className={admin.tableWrapper}>
            <table className={admin.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Supplier / Cost</th>
                  <th>Current price</th>
                  <th>Margin</th>
                  <th>Suggested</th>
                  <th>Status</th>
                  <th>Approval</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className={styles.name}>{product.name}</div>
                      <div className={styles.mono}>{product.sku}</div>
                    </td>
                    <td>
                      {product.preferred_supplier || "No preferred supplier"}
                      <div className={styles.money}>
                        {product.latest_verified_cost == null
                          ? "No verified cost"
                          : money(product.latest_verified_cost)}
                      </div>
                      <div className={styles.muted}>
                        {product.pricing_rule || "No matching pricing rule"}
                      </div>
                    </td>
                    <td className={styles.money}>
                      {money(product.current_selling_price)}
                    </td>
                    <td>
                      {product.current_margin == null
                        ? "-"
                        : `${(product.current_margin * 100).toFixed(1)}%`}
                    </td>
                    <td className={styles.money}>
                      {money(product.suggested_price)}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${product.pricing_status === "approved" ? styles.good : styles.warn}`}
                      >
                        {product.pricing_status}
                      </span>
                    </td>
                    <td>
                      {hasPermission(session, "pricing.manage") ? (
                        <form
                          action={approveProductPriceAction.bind(
                            null,
                            product.id,
                          )}
                          className={styles.inlineForm}
                        >
                          <input
                            className={`${styles.field} ${styles.compact}`}
                            name="sellingPrice"
                            type="number"
                            min="0.01"
                            step="0.01"
                            defaultValue={product.suggested_price.toFixed(2)}
                            aria-label={`Selling price for ${product.name}`}
                          />
                          <button className={styles.buttonSecondary}>
                            Approve
                          </button>
                        </form>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<Tags aria-hidden="true" />}
            title="No products"
            text="No catalogue products are available for pricing."
          />
        )}
      </div>

      {priceHistory.length > 0 ? (
        <div className={styles.historyCard}>
          <h2>Recent price changes ({priceHistory.length})</h2>
          <div className={admin.tableWrapper}>
            <table className={admin.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product ID</th>
                  <th>Cost</th>
                  <th>Previous price</th>
                  <th>New price</th>
                  <th>Margin</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {priceHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      {formatDate(entry.created_at)}
                    </td>
                    <td className={styles.mono}>
                      {entry.product_id.slice(0, 8)}…
                    </td>
                    <td>
                      {entry.new_cost != null
                        ? money(entry.new_cost)
                        : "—"}
                    </td>
                    <td>
                      {entry.previous_selling_price != null
                        ? money(entry.previous_selling_price)
                        : "—"}
                    </td>
                    <td className={styles.money}>
                      {entry.new_selling_price != null
                        ? money(entry.new_selling_price)
                        : "—"}
                    </td>
                    <td>
                      {entry.new_margin != null
                        ? `${(entry.new_margin * 100).toFixed(1)}%`
                        : "—"}
                    </td>
                    <td>{entry.source || entry.reason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
