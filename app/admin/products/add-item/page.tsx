import Link from "next/link";
import { ArrowLeft, Save, ShoppingCart, Tag, Truck } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

export const metadata = {
  title: "Add Master Item | Admin | Pexpacks",
};

export default async function AddMasterItemPage() {
  await requireAdmin({ permission: "catalogue.manage" });

  return (
    <div className={styles.container}>
      <div>
        <Link href="/admin/products" className={adminStyles.backLink}>
          <ArrowLeft size={14} /> Back to Master Products
        </Link>
      </div>

      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Add New Master Item</h1>
          <p className={styles.headerSubtitle}>
            Create a central stationery master item for school packs and
            supplier purchase orders.
          </p>
        </div>
      </div>

      <form
        action="/admin/products"
        method="GET"
        className={adminStyles.detailLayout}
      >
        <div className={adminStyles.formStack}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Tag size={16} className={adminStyles.iconTeal} />
                <span>Item Identity & Categorisation</span>
              </div>
            </div>

            <div className={adminStyles.formGrid2}>
              <div className={adminStyles.fieldGroup}>
                <label className={adminStyles.fieldLabel}>SKU / Item Code *</label>
                <input
                  name="sku"
                  required
                  placeholder="e.g. PRO-1029"
                  className={adminStyles.fieldControl}
                />
              </div>

              <div className={adminStyles.fieldGroup}>
                <label className={adminStyles.fieldLabel}>Item Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Staedtler HB Pencils 12 Pack"
                  className={adminStyles.fieldControl}
                />
              </div>

              <div className={adminStyles.fieldGroup}>
                <label className={adminStyles.fieldLabel}>Category</label>
                <select name="category" className={adminStyles.fieldControl}>
                  <option value="Stationery">Stationery</option>
                  <option value="Paper & Books">Paper & Books</option>
                  <option value="Writing Instruments">
                    Writing Instruments
                  </option>
                  <option value="Art & Craft">Art & Craft</option>
                </select>
              </div>

              <div className={adminStyles.fieldGroup}>
                <label className={adminStyles.fieldLabel}>Brand</label>
                <input
                  name="brand"
                  placeholder="e.g. Pritt / Staedtler / Croxley"
                  className={adminStyles.fieldControl}
                />
              </div>
            </div>
          </div>

          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <ShoppingCart size={16} className={adminStyles.iconGreen} />
                <span>Pricing & Commercials</span>
              </div>
            </div>

            <div className={adminStyles.formGrid3}>
              <div className={adminStyles.fieldGroup}>
                <label className={adminStyles.fieldLabel}>
                  Latest Purchase Cost (R) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="cost_price"
                  required
                  placeholder="0.00"
                  className={adminStyles.fieldControl}
                />
              </div>

              <div className={adminStyles.fieldGroup}>
                <label className={adminStyles.fieldLabel}>Selling Price (R) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="sell_price"
                  required
                  placeholder="0.00"
                  className={adminStyles.fieldControl}
                />
              </div>

              <div className={adminStyles.fieldGroup}>
                <label className={adminStyles.fieldLabel}>Unit / Pack Format</label>
                <input
                  name="unit"
                  placeholder="Each / Box / Pack"
                  defaultValue="Each"
                  className={adminStyles.fieldControl}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={adminStyles.sidebarColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Truck size={16} className={adminStyles.iconBlue} />
                <span>Supplier & Availability</span>
              </div>
            </div>

            <div className={adminStyles.formStackCompact}>
              <div className={adminStyles.fieldGroup}>
                <label className={adminStyles.fieldLabel}>Preferred Supplier</label>
                <select name="supplier" className={adminStyles.fieldControl}>
                  <option value="Waltons">Waltons</option>
                  <option value="Bidvest">Bidvest Paperplus</option>
                  <option value="Croxley">Croxley South Africa</option>
                </select>
              </div>

              <div className={adminStyles.fieldGroup}>
                <label className={adminStyles.fieldLabel}>Lead Time (Days)</label>
                <input
                  type="number"
                  name="lead_time"
                  defaultValue="3"
                  className={adminStyles.fieldControl}
                />
              </div>

              <div className={styles.actionBlock}>
                <button
                  type="submit"
                  className={`${styles.primaryBtn} ${styles.fullWidthBtn}`}
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
