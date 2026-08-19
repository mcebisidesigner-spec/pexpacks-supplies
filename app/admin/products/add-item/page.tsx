import Link from "next/link";
import { ArrowLeft, Box, Save, ShoppingCart, Tag, Truck } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import styles from "@/components/admin/views/CorePagesView.module.css";
import adminStyles from "../../admin.module.css";

export const metadata = {
  title: "Add Master Item | Admin | Pexpacks",
};

export default async function AddMasterItemPage() {
  await requireAdmin({ permission: "catalogue.manage" });

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div>
        <Link
          href="/admin/products"
          className={styles.secondaryBtn}
          style={{
            height: 32,
            fontSize: 11,
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            paddingLeft: 0,
          }}
        >
          <ArrowLeft size={14} /> Back to Master Products
        </Link>
      </div>

      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Add New Master Item</h1>
          <p className={styles.headerSubtitle}>
            Create a central stationery master item for school packs and supplier purchase orders.
          </p>
        </div>
      </div>

      <form action="/admin/products" method="GET" className={styles.detailLayout}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Section 1: Item Identity */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Tag size={16} style={{ color: "#2dd4bf" }} />
                <span>Item Identity & Categorisation</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  SKU / Item Code *
                </label>
                <input
                  name="sku"
                  required
                  placeholder="e.g. PRO-1029"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Item Name *
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Staedtler HB Pencils 12 Pack"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Category
                </label>
                <select
                  name="category"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                >
                  <option value="Stationery">Stationery</option>
                  <option value="Paper & Books">Paper & Books</option>
                  <option value="Writing Instruments">Writing Instruments</option>
                  <option value="Art & Craft">Art & Craft</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Brand
                </label>
                <input
                  name="brand"
                  placeholder="e.g. Pritt / Staedtler / Croxley"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Commercial Terms */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <ShoppingCart size={16} style={{ color: "#34d399" }} />
                <span>Pricing & Commercials</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Latest Purchase Cost (R) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="cost_price"
                  required
                  placeholder="0.00"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Selling Price (R) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="sell_price"
                  required
                  placeholder="0.00"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Unit / Pack Format
                </label>
                <input
                  name="unit"
                  placeholder="Each / Box / Pack"
                  defaultValue="Each"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className={styles.sidebarColumn}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Truck size={16} style={{ color: "#60a5fa" }} />
                <span>Supplier & Availability</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Preferred Supplier
                </label>
                <select
                  name="supplier"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                >
                  <option value="Waltons">Waltons</option>
                  <option value="Bidvest">Bidvest Paperplus</option>
                  <option value="Croxley">Croxley South Africa</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Lead Time (Days)
                </label>
                <input
                  type="number"
                  name="lead_time"
                  defaultValue="3"
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ paddingTop: 12 }}>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <Save size={14} /> Save Master Item
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
