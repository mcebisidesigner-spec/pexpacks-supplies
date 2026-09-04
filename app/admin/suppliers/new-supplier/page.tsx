import { Building2, CreditCard, Mail, Save } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

export const metadata = {
  title: "New Supplier | Admin | Pexpacks",
};

export default async function NewSupplierPage() {
  await requireAdmin({ permission: "suppliers.manage" });

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="Onboard New Supplier"
        subtitle="Add a stationery manufacturer or distributor to the Pexpacks procurement network."
        backHref="/admin/suppliers"
        backLabel="Back to Suppliers"
      />

      <form
        action="/admin/suppliers"
        method="GET"
        className={adminStyles.detailLayout}
      >
        <div
          className={`${adminStyles.flex} ${adminStyles["flex-col"]} ${adminStyles.gap18}`}
        >
          {/* Supplier Identity */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Building2 size={16} className={adminStyles.iconTeal} />
                <span>Supplier Identity &amp; Information</span>
              </div>
            </div>

            <div className={adminStyles.grid2equal}>
              <div>
                <label className={adminStyles.formLabel}>Supplier Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Makro Trade Solutions"
                  className={adminStyles.inputField}
                />
              </div>

              <div>
                <label className={adminStyles.formLabel}>
                  Supplier Code / Ref
                </label>
                <input
                  name="code"
                  placeholder="e.g. SUP-MAKRO-01"
                  className={adminStyles.inputField}
                />
              </div>

              <div>
                <label className={adminStyles.formLabel}>
                  Primary Contact Person
                </label>
                <input
                  name="contact_person"
                  placeholder="e.g. Accounts Manager"
                  className={adminStyles.inputField}
                />
              </div>

              <div>
                <label className={adminStyles.formLabel}>Status</label>
                <select name="status" className={adminStyles.inputField}>
                  <option value="Preferred">Preferred Partner</option>
                  <option value="Approved">Approved Supplier</option>
                  <option value="Prospect">Prospect</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Mail size={16} className={adminStyles.iconBlue} />
                <span>Contact Details &amp; Orders</span>
              </div>
            </div>

            <div className={adminStyles.grid2equal}>
              <div>
                <label className={adminStyles.formLabel}>
                  Procurement Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="orders@supplier.co.za"
                  className={adminStyles.inputField}
                />
              </div>

              <div>
                <label className={adminStyles.formLabel}>Telephone</label>
                <input
                  name="phone"
                  placeholder="+27 11 000 0000"
                  className={adminStyles.inputField}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Commercial Terms Sidebar */}
        <div className={adminStyles.sidebarColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <CreditCard size={16} className={adminStyles.iconAmber} />
                <span>Commercial Terms</span>
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel}>Payment Terms</label>
                <input
                  name="payment_terms"
                  defaultValue="30 Days Net"
                  className={adminStyles.inputField}
                />
              </div>

              <div>
                <label className={adminStyles.formLabel}>
                  Standard Lead Time (Days)
                </label>
                <input
                  type="number"
                  name="lead_time"
                  defaultValue="3"
                  className={adminStyles.inputField}
                />
              </div>

              <div className={adminStyles.pt12}>
                <button
                  type="submit"
                  className={`${styles.primaryBtn} ${adminStyles.hFullBtn}`}
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
