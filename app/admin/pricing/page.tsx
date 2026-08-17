import { Tags } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listPricingReview, listPricingRules } from "@/lib/admin/operations";
import {
  approveProductPriceAction,
  createPricingRuleAction,
} from "../operations-actions";
import admin from "../admin.module.css";
import styles from "../operations.module.css";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const session = await requireAdmin({ permission: "pricing.view" });
  const [products, rules] = await Promise.all([
    listPricingReview(),
    listPricingRules(),
  ]);
  const exceptions = products.filter(
    (p) => p.pricing_status !== "approved",
  ).length;
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Price Review</h1>
          <p>
            Approve selling prices from verified cost and preserve every
            commercial change.
          </p>
        </div>
      </header>
      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <span>Products reviewed</span>
          <strong>{products.length}</strong>
        </div>
        <div className={styles.kpi}>
          <span>Require attention</span>
          <strong>{exceptions}</strong>
        </div>
        <div className={styles.kpi}>
          <span>Approved</span>
          <strong>{products.length - exceptions}</strong>
        </div>
        <div className={styles.kpi}>
          <span>Active pricing rules</span>
          <strong>{rules.filter((rule) => rule.active).length}</strong>
        </div>
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
                          : `R ${Number(product.latest_verified_cost).toFixed(2)}`}
                      </div>
                      <div className={styles.muted}>
                        {product.pricing_rule || "No matching pricing rule"}
                      </div>
                    </td>
                    <td className={styles.money}>
                      R {Number(product.current_selling_price).toFixed(2)}
                    </td>
                    <td>
                      {product.current_margin == null
                        ? "-"
                        : `${(product.current_margin * 100).toFixed(1)}%`}
                    </td>
                    <td className={styles.money}>
                      R {product.suggested_price.toFixed(2)}
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
          <div className={styles.empty}>
            <Tags aria-hidden="true" />
            <p>No catalogue products are available for pricing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
