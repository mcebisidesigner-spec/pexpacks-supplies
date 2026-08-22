import Link from "next/link";
import { ArrowLeft, Save, ShoppingCart, Tag, Truck } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import styles from "@/components/admin/views/CorePagesView.module.css";

export const metadata = {
  title: "Add Master Item | Admin | Pexpacks",
};

export default async function AddMasterItemPage() {
  await requireAdmin({ permission: "catalogue.manage" });

  return (
    <div className={styles.container}>
      <div>
        <Link href="/admin/products" className={styles.backLink}>
          <ArrowLeft size={14} /> Back to Master Products
        </Link>
      </div>

      <div className={styles.headerRow}>
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
        className={styles.detailLayout}
      >
        <div className={styles.formStack}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Tag size={16} className={styles.iconTeal} />
                <span>Item Identity & Categorisation</span>
              </div>
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>SKU / Item Code *</label>
                <input
                  name="sku"
                  required
                  placeholder="e.g. PRO-1029"
                  className={styles.fieldControl}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Item Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Staedtler HB Pencils 12 Pack"
                  className={styles.fieldControl}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Category</label>
                <select name="category" className={styles.fieldControl}>
                  <option value="Stationery">Stationery</option>
                  <option value="Paper & Books">Paper & Books</option>
                  <option value="Writing Instruments">
                    Writing Instruments
                  </option>
                  <option value="Art & Craft">Art & Craft</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Brand</label>
                <input
                  name="brand"
                  placeholder="e.g. Pritt / Staedtler / Croxley"
                  className={styles.fieldControl}
                />
              </div>
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <ShoppingCart size={16} className={styles.iconGreen} />
                <span>Pricing & Commercials</span>
              </div>
            </div>

            <div className={styles.formGrid3}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Latest Purchase Cost (R) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="cost_price"
                  required
                  placeholder="0.00"
                  className={styles.fieldControl}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Selling Price (R) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="sell_price"
                  required
                  placeholder="0.00"
                  className={styles.fieldControl}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Unit / Pack Format</label>
                <input
                  name="unit"
                  placeholder="Each / Box / Pack"
                  defaultValue="Each"
                  className={styles.fieldControl}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sidebarColumn}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Truck size={16} className={styles.iconBlue} />
                <span>Supplier & Availability</span>
              </div>
            </div>

            <div className={styles.formStackCompact}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Preferred Supplier</label>
                <select name="supplier" className={styles.fieldControl}>
                  <option value="Waltons">Waltons</option>
                  <option value="Bidvest">Bidvest Paperplus</option>
                  <option value="Croxley">Croxley South Africa</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Lead Time (Days)</label>
                <input
                  type="number"
                  name="lead_time"
                  defaultValue="3"
                  className={styles.fieldControl}
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
