import Link from "next/link";
import { ArrowLeft, Building2, CreditCard, Mail, Save } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface EditSupplierPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Supplier | Admin | Pexpacks",
};

export default async function EditSupplierPage({ params }: EditSupplierPageProps) {
  await requireAdmin({ permission: "suppliers.manage" });
  const { id } = await params;

  const title = id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className={styles.container}>
      <div>
        <Link href={`/admin/suppliers/${id}`} className={`${styles.secondaryBtn} ${styles.backLinkOverride}`}>
          <ArrowLeft size={14} /> Back to {title}
        </Link>
      </div>

      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Edit Supplier — {title}</h1>
          <p className={styles.headerSubtitle}>
            Update supplier contact details, lead times, and commercial terms.
          </p>
        </div>
      </div>

      <form action={`/admin/suppliers/${id}`} method="GET" className={styles.detailLayout}>
        <div className={`${styles.flex} ${styles["flex-col"]} ${styles.gap18}`}>
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
                  defaultValue={title}
                  required
                  className={styles.inputField}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Supplier Code / Ref</label>
                <input
                  name="code"
                  defaultValue={`SUP-${id.toUpperCase().slice(0, 8)}`}
                  className={styles.inputField}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Primary Contact Person</label>
                <input
                  name="contact_person"
                  defaultValue="Account Manager"
                  className={styles.inputField}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Status</label>
                <select name="status" defaultValue="Preferred" className={styles.inputField}>
                  <option value="Preferred">Preferred Partner</option>
                  <option value="Approved">Approved Supplier</option>
                  <option value="Prospect">Prospect</option>
                </select>
              </div>
            </div>
          </div>

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
                  defaultValue={`orders@${id}.co.za`}
                  required
                  className={styles.inputField}
                />
              </div>

              <div>
                <label className={styles.formLabel}>Telephone</label>
                <input
                  name="phone"
                  defaultValue="+27 11 000 0000"
                  className={styles.inputField}
                />
              </div>
            </div>
          </div>
        </div>

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
                  defaultValue="2"
                  className={styles.inputField}
                />
              </div>

              <div className={styles.pt12}>
                <button type="submit" className={`${styles.primaryBtn} ${styles.hFullBtn}`}>
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
