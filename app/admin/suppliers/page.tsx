import { Truck } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DateField } from "@/components/admin/DateField";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  isOperationsSchemaReady,
  listMasterProducts,
  listSupplierOffers,
  listSuppliers,
} from "@/lib/admin/operations";
import {
  createSupplierAction,
  createSupplierOfferAction,
  updateSupplierAction,
  updateSupplierOfferAction,
} from "../operations-actions";
import admin from "../admin.module.css";
import styles from "../operations.module.css";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const session = await requireAdmin({ permission: "suppliers.view" });
  const [schemaReady, suppliers, offers, catalogue] = await Promise.all([
    isOperationsSchemaReady(),
    listSuppliers(),
    listSupplierOffers(),
    listMasterProducts("", 500),
  ]);
  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Suppliers"
        count={suppliers.length}
        subtitle="Suppliers and their current commercial terms."
      />
      {!schemaReady ? (
        <section className={styles.notice} role="status">
          <strong>Operations database setup required</strong>
          <p>
            Apply Supabase migrations 00030 and 00031 to activate Makro, BSC
            Supplies, supplier offers and procurement records.
          </p>
        </section>
      ) : null}
      {schemaReady && hasPermission(session, "suppliers.manage") ? (
        <section className={styles.formPanel}>
          <h2>Add supplier</h2>
          <form action={createSupplierAction} className={styles.formGrid}>
            <input
              className={styles.field}
              name="code"
              placeholder="Supplier code"
              required
            />
            <input
              className={`${styles.field} ${styles.wide}`}
              name="name"
              placeholder="Supplier name"
              required
            />
            <input
              className={styles.field}
              name="contactName"
              placeholder="Contact name"
            />
            <input
              className={styles.field}
              name="email"
              type="email"
              placeholder="Email"
            />
            <input
              className={styles.field}
              name="telephone"
              placeholder="Telephone"
            />
            <input
              className={styles.field}
              name="leadTimeDays"
              type="number"
              min="0"
              placeholder="Lead time days"
            />
            <input
              className={styles.field}
              name="paymentTerms"
              placeholder="Payment terms"
            />
            <button className={styles.button} type="submit">
              Add supplier
            </button>
          </form>
        </section>
      ) : null}
      {schemaReady && hasPermission(session, "suppliers.manage") ? (
        <section className={styles.formPanel}>
          <h2>Record supplier offer</h2>
          <form action={createSupplierOfferAction} className={styles.formGrid}>
            <select className={styles.field} name="supplierId" required>
              <option value="">Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.code} · {supplier.name}
                </option>
              ))}
            </select>
            <select
              className={`${styles.field} ${styles.wide}`}
              name="productId"
              required
            >
              <option value="">Catalogue product</option>
              {catalogue.products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.sku} · {product.name}
                </option>
              ))}
            </select>
            <input
              className={styles.field}
              name="unitCost"
              type="number"
              min="0"
              step="0.01"
              placeholder="Unit cost"
              required
            />
            <input
              className={styles.field}
              name="minimumOrderQuantity"
              type="number"
              min="1"
              defaultValue="1"
              aria-label="Minimum order quantity"
            />
            <input
              className={styles.field}
              name="availableQuantity"
              type="number"
              min="0"
              placeholder="Supplier availability"
            />
            <input
              className={styles.field}
              name="offerLeadTimeDays"
              type="number"
              min="0"
              placeholder="Lead time days"
            />
            <DateField
              className={styles.field}
              name="validUntil"
              ariaLabel="Valid until"
              placeholder="Valid until"
            />
            <label className={styles.inlineForm}>
              <input name="isPreferred" type="checkbox" /> Preferred offer
            </label>
            <button className={styles.button}>Record offer</button>
          </form>
        </section>
      ) : null}
      <div className={admin.tableCard}>
        {suppliers.length ? (
          <div className={admin.tableWrapper}>
            <table className={admin.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Supplier</th>
                  <th>Contact</th>
                  <th>Lead time</th>
                  <th>Payment terms</th>
                  <th>Offers</th>
                  <th>Status</th>
                  {hasPermission(session, "suppliers.manage") ? (
                    <th>Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className={styles.mono}>{supplier.code}</td>
                    <td className={styles.name}>{supplier.name}</td>
                    <td>
                      {supplier.contact_name || "-"}
                      <div className={styles.muted}>
                        {supplier.email ||
                          supplier.telephone ||
                          "No contact details"}
                      </div>
                    </td>
                    <td>
                      {supplier.lead_time_days == null
                        ? "-"
                        : `${supplier.lead_time_days} days`}
                    </td>
                    <td>{supplier.payment_terms || "-"}</td>
                    <td>{supplier.offer_count ?? 0}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${supplier.active ? styles.good : styles.danger}`}
                      >
                        {supplier.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {hasPermission(session, "suppliers.manage") ? (
                      <td>
                        <form
                          action={updateSupplierAction.bind(null, supplier.id)}
                          className={styles.inlineForm}
                        >
                          <input
                            className={styles.field}
                            name="name"
                            defaultValue={supplier.name}
                            placeholder="Name"
                          />
                          <input
                            className={styles.field}
                            name="contactName"
                            defaultValue={supplier.contact_name || ""}
                            placeholder="Contact"
                          />
                          <input
                            className={styles.field}
                            name="email"
                            defaultValue={supplier.email || ""}
                            placeholder="Email"
                          />
                          <input
                            className={styles.field}
                            name="telephone"
                            defaultValue={supplier.telephone || ""}
                            placeholder="Phone"
                          />
                          <input
                            className={styles.field}
                            name="leadTimeDays"
                            type="number"
                            min="0"
                            defaultValue={supplier.lead_time_days ?? ""}
                            placeholder="Lead days"
                          />
                          <input
                            className={styles.field}
                            name="paymentTerms"
                            defaultValue={supplier.payment_terms || ""}
                            placeholder="Payment terms"
                          />
                          <button className={styles.buttonSecondary}>
                            Save
                          </button>
                        </form>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<Truck aria-hidden="true" />}
            title="No suppliers"
            text={
              schemaReady
                ? "No suppliers have been added."
                : "Supplier data will appear after database setup."
            }
          />
        )}
      </div>
      <div className={admin.tableCard}>
        {offers.length ? (
          <div className={admin.tableWrapper}>
            <table className={admin.table}>
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Product</th>
                  <th>Unit cost</th>
                  <th>MOQ</th>
                  <th>Supplier availability</th>
                  <th>Lead time</th>
                  <th>Valid until</th>
                  <th>Preference</th>
                  {hasPermission(session, "suppliers.manage") ? (
                    <th>Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.id}>
                    <td className={styles.name}>{offer.suppliers.name}</td>
                    <td>
                      {offer.master_products.name}
                      <div className={styles.mono}>
                        {offer.master_products.sku}
                      </div>
                    </td>
                    <td className={styles.money}>
                      R {Number(offer.unit_cost).toFixed(2)}
                    </td>
                    <td>{offer.minimum_order_quantity}</td>
                    <td>{offer.available_quantity ?? "Not reported"}</td>
                    <td>
                      {offer.lead_time_days == null
                        ? "-"
                        : `${offer.lead_time_days} days`}
                    </td>
                    <td>{offer.valid_until || "Open"}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${offer.is_preferred ? styles.good : ""}`}
                      >
                        {offer.is_preferred ? "Preferred" : "Alternative"}
                      </span>
                    </td>
                    {hasPermission(session, "suppliers.manage") ? (
                      <td>
                        <form
                          action={updateSupplierOfferAction.bind(
                            null,
                            offer.id,
                          )}
                          className={styles.inlineForm}
                        >
                          <input
                            className={styles.field}
                            name="unitCost"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={offer.unit_cost}
                          />
                          <input
                            className={styles.field}
                            name="minimumOrderQuantity"
                            type="number"
                            min="1"
                            defaultValue={offer.minimum_order_quantity}
                          />
                          <input
                            className={styles.field}
                            name="availableQuantity"
                            type="number"
                            min="0"
                            defaultValue={offer.available_quantity ?? ""}
                          />
                          <input
                            className={styles.field}
                            name="leadTimeDays"
                            type="number"
                            min="0"
                            defaultValue={offer.lead_time_days ?? ""}
                          />
                          <DateField
                            className={styles.field}
                            name="validUntil"
                            defaultValue={offer.valid_until || ""}
                            ariaLabel="Valid until"
                          />
                          <label className={styles.inlineForm}>
                            <input
                              name="isPreferred"
                              type="checkbox"
                              defaultChecked={offer.is_preferred}
                            />{" "}
                            Preferred
                          </label>
                          <button className={styles.buttonSecondary}>
                            Save
                          </button>
                        </form>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
