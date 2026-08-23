import { ArrowLeft, Building2, CreditCard, Mail, Save } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
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
      <AdminPageHeader
        title={`Edit Supplier — ${title}`}
        subtitle="Update supplier contact details, lead times, and commercial terms."
        actions={
          <AdminButton
            href={`/admin/suppliers/${id}`}
            variant="secondary"
            icon={<ArrowLeft size={14} />}
          >
            Back to Supplier
          </AdminButton>
        }
      />

      <form action={`/admin/suppliers/${id}`} method="GET" className={adminStyles.detailLayout}>
        <div className={`${adminStyles.flex} ${adminStyles["flex-col"]} ${adminStyles.gap18}`}>
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
                  defaultValue={title}
                  required
                  className={adminStyles.inputField}
                />
              </div>

              <div>
                <label className={adminStyles.formLabel}>Supplier Code / Ref</label>
                <input
                  name="code"
                  defaultValue={`SUP-${id.toUpperCase().slice(0, 8)}`}
                  className={adminStyles.inputField}
                />
              </div>

              <div>
                <label className={adminStyles.formLabel}>Primary Contact Person</label>
                <input
                  name="contact_person"
                  defaultValue="Account Representative"
                  className={adminStyles.inputField}
                />
              </div>

              <div>
                <label className={adminStyles.formLabel}>Status</label>
                <select name="status" className={adminStyles.inputField} defaultValue="Preferred">
                  <option value="Preferred">Preferred Partner</option>
                  <option value="Approved">Approved Supplier</option>
                  <option value="Prospect">Prospect</option>
                </select>
              </div>
            </div>
          </div>

          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Mail size={16} className={adminStyles.iconBlue} />
                <span>Contact Details &amp; Orders</span>
              </div>
            </div>

            <div className={adminStyles.grid2equal}>
              <div>
                <label className={adminStyles.formLabel}>Procurement Email *</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={`orders@${id.toLowerCase()}.co.za`}
                  required
                  className={adminStyles.inputField}
                />
              </div>

              <div>
                <label className={adminStyles.formLabel}>Telephone</label>
                <input
                  name="phone"
                  defaultValue="+27 11 000 0000"
                  className={adminStyles.inputField}
                />
              </div>
            </div>
          </div>
        </div>

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
                <label className={adminStyles.formLabel}>Standard Lead Time (Days)</label>
                <input
                  type="number"
                  name="lead_time"
                  defaultValue="3"
                  className={adminStyles.inputField}
                />
              </div>

              <div className={adminStyles.pt12}>
                <button type="submit" className={`${styles.primaryBtn} ${adminStyles.hFullBtn}`}>
                  <Save size={14} /> Update Supplier
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
