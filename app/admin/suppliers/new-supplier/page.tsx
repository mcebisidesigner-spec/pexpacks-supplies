import Link from "next/link";
import { ArrowLeft, Building2, CreditCard, Mail, Phone, Save, Truck } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

export const metadata = {
  title: "New Supplier | Admin | Pexpacks",
};

export default async function NewSupplierPage() {
  await requireAdmin({ permission: "suppliers.manage" });

  return (
    <div className={styles.container}>
      <div>
        <Link href="/admin/suppliers" className={`${styles.secondaryBtn} ${styles.backLinkOverride}`}>
          <ArrowLeft size={14} /> Back to Suppliers
        </Link>
      </div>

      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Onboard New Supplier</h1>
          <p className={styles.headerSubtitle}>
            Add a stationery manufacturer or distributor to the Pexpacks procurement network.
          </p>
        </div>
      </div>

      <form action="/admin/suppliers" method="GET" className={styles.detailLayout}>
        <div className={`${styles.flex} ${styles["flex-col"]} ${styles.gap18}`}>
          {/* Supplier Identity */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Building2 size={16} className={styles.iconTeal} />
                <span>Supplier Identity &amp; Information</span>
              </div>
            </div>

            <div className={styles.grid2equal}>
              <div>
                <label className={styles.formLabel}>Supplier Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Waltons Stationery Supplies"
                  className={styles.inputField}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Supplier Code / Ref</label>
                <input
                  name="code"
                  placeholder="e.g. SUP-WALTONS-01"
                  className={styles.inputField}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Primary Contact Person</label>
                <input
                  name="contact_person"
                  placeholder="e.g. Sarah Jenkins"
                  className={styles.inputField}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Status</label>
                <select name="status" className={styles.inputField}>
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
                <Mail size={16} className={styles.iconBlue} />
                <span>Contact Details &amp; Orders</span>
              </div>
            </div>

            <div className={styles.grid2equal}>
              <div>
                <label className={styles.formLabel}>Procurement Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="orders@supplier.co.za"
                  className={styles.inputField}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Telephone</label>
                <input
                  name="phone"
                  placeholder="+27 11 000 0000"
                  className={styles.inputField}
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
                <CreditCard size={16} className={styles.iconAmber} />
                <span>Commercial Terms</span>
              </div>
            </div>

            <div className={styles.formField}>
              <div>
                <label className={styles.formLabel}>Payment Terms</label>
                <input
                  name="payment_terms"
                  defaultValue="30 Days Net"
                  className={styles.inputField}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Standard Lead Time (Days)</label>
                <input
                  type="number"
                  name="lead_time"
                  defaultValue="3"
                  className={styles.inputField}
                />
              </div>

              <div className={styles.pt12}>
                <button type="submit" className={`${styles.primaryBtn} ${styles.hFullBtn}`}>
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