import Link from "next/link";
import { ArrowLeft, Building2, CreditCard, Mail, Phone, Save, Truck } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import styles from "@/components/admin/views/CorePagesView.module.css";

export const metadata = {
  title: "New Supplier | Admin | Pexpacks",
};

export default async function NewSupplierPage() {
  await requireAdmin({ permission: "suppliers.manage" });

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div>
        <Link
          href="/admin/suppliers"
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
          <ArrowLeft size={14} /> Back to Suppliers
        </Link>
      </div>

      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Onboard New Supplier</h1>
          <p className={styles.headerSubtitle}>
            Add a stationery manufacturer or distributor to the Pexpacks procurement network.
          </p>
        </div>
      </div>

      <form action="/admin/suppliers" method="GET" className={styles.detailLayout}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Supplier Identity */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Building2 size={16} style={{ color: "#2dd4bf" }} />
                <span>Supplier Identity & Information</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Supplier Name *
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Waltons Stationery Supplies"
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
                  Supplier Code / Ref
                </label>
                <input
                  name="code"
                  placeholder="e.g. SUP-WALTONS-01"
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
                  Primary Contact Person
                </label>
                <input
                  name="contact_person"
                  placeholder="e.g. Sarah Jenkins"
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
                  Status
                </label>
                <select
                  name="status"
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
                  <option value="Preferred">Preferred Partner</option>
                  <option value="Approved">Approved Supplier</option>
                  <option value="Prospect">Prospect</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Mail size={16} style={{ color: "#60a5fa" }} />
                <span>Contact Details & Orders</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Procurement Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="orders@supplier.co.za"
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
                  Telephone
                </label>
                <input
                  name="phone"
                  placeholder="+27 11 000 0000"
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

        {/* Commercial Terms Sidebar */}
        <div className={styles.sidebarColumn}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <CreditCard size={16} style={{ color: "#fbbf24" }} />
                <span>Commercial Terms</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                  Payment Terms
                </label>
                <input
                  name="payment_terms"
                  defaultValue="30 Days Net"
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
                  Standard Lead Time (Days)
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
                  <Save size={14} /> Onboard Supplier
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
