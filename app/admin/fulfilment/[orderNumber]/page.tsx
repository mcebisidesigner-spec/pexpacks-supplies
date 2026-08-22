import Link from "next/link";
import { ArrowLeft, Barcode, CheckSquare, Save } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface FulfilmentDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function FulfilmentDetailPage({ params }: FulfilmentDetailPageProps) {
  await requireAdmin({ permission: "fulfilment.view" });
  const { orderNumber } = await params;

  const steps = [
    { stage: "Queued", active: false, done: true },
    { stage: "Picking", active: false, done: true },
    { stage: "Packed", active: true, done: false },
    { stage: "Quality Check", active: false, done: false },
    { stage: "Ready for Dispatch", active: false, done: false },
    { stage: "Completed", active: false, done: false },
  ];

  const items = [
    { name: "A4 Counter Book (Quad 192p)", qty: "4", unit: "Each", checked: true, packed: true },
    { name: "Staedtler HB Pencils (Box 12)", qty: "1", unit: "Box", checked: true, packed: true },
    { name: "Pritt Glue Stick 43g", qty: "2", unit: "Each", checked: true, packed: true },
    { name: "Flip File 40 Pocket", qty: "2", unit: "Each", checked: true, packed: true },
    { name: "Ruler 30cm Shatterproof (Substituted: Clear)", qty: "1", unit: "Each", checked: false, packed: false, substitute: true },
  ];

  return (
    <div className={styles.container}>
      <div>
        <Link href="/admin/fulfilment" className={`${styles.secondaryBtn} ${adminStyles.backLinkOverride}`}>
          <ArrowLeft size={14} /> Back to Packing &amp; Fulfilment
        </Link>
      </div>

      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            Fulfilment Workbench: {orderNumber}
            <span className={adminStyles.badgeTeal}>● In Packing</span>
          </h1>
          <p className={styles.headerSubtitle}>
            School: 3d Christian Academy • Grade 4 Pack • Learner: Ethan Morgan • Opening: 15 Jan 2027
          </p>
        </div>
      </div>

      {/* 6-Stage Stepper Bar */}
      <div className={`${adminStyles.tableCard} ${adminStyles.pCard}`}>
        <div className={`${styles.text11} ${adminStyles.fw700} ${adminStyles.uppercase} ${adminStyles.lsWide} ${adminStyles.cSubtle} ${adminStyles.mb12}`}>
          Packing Lifecycle Stepper
        </div>
        <div className={adminStyles.grid6}>
          {steps.map((item, idx) => {
            const btnCls = item.active
              ? `${styles.primaryBtn} ${styles.text11} ${adminStyles.justifyCenter} ${adminStyles.stepBtnActive}`
              : item.done
                ? `${styles.secondaryBtn} ${styles.text11} ${adminStyles.justifyCenter} ${adminStyles.stepBtnDone}`
                : `${styles.secondaryBtn} ${styles.text11} ${adminStyles.justifyCenter} ${adminStyles.stepBtnInactive}`;
            return (
              <button key={idx} type="button" className={btnCls}>
                {item.done ? "\u2713 " : ""}{item.stage}
              </button>
            );
          })}
        </div>
      </div>

      {/* Packing Workbench Layout */}
      <div className={`${adminStyles.detailLayout} ${adminStyles.mt18}`}>
        <div className={`${adminStyles.flex} ${styles["flex-col"]} ${adminStyles.gap18}`}>
          {/* Interactive Packing Checklist */}
          <div className={adminStyles.tableCard}>
            <div className={adminStyles.sectionHeaderBetween}>
              <div className={`${adminStyles.flex} ${adminStyles.itemsCenter} ${adminStyles.gap8}`}>
                <CheckSquare size={16} className={adminStyles.iconTeal} />
                <span>Reusable Bag Items Checklist (4 of 5 Checked)</span>
              </div>
              <span className={adminStyles.badgeGreen}>80% Complete</span>
            </div>

            <div className={adminStyles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th className={adminStyles.w40}>CHECK</th>
                    <th>ITEM DESCRIPTION</th>
                    <th>QTY</th>
                    <th>UNIT FORMAT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((itm, idx) => (
                    <tr key={idx} className={`${styles.dataRow} ${itm.substitute ? adminStyles.rowHighlight : ""}`}>
                      <td><input type="checkbox" defaultChecked={itm.checked} className={adminStyles.checkbox} /></td>
                      <td className={itm.substitute ? `${adminStyles.cAmber} ${adminStyles.fw700}` : `${adminStyles.fw700}`}>{itm.name}</td>
                      <td>{itm.qty}</td>
                      <td>{itm.unit}</td>
                      <td>
                        {itm.packed
                          ? <span className={adminStyles.badgeGreen}>Packed</span>
                          : <span className={adminStyles.badgeAmber}>Pending Verification</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Packing Notes & Barcode Panel */}
        <div className={adminStyles.sidebarColumn}>
          <form action="/admin/fulfilment" method="GET" className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Barcode size={16} className={adminStyles.iconTeal} />
                <span>Bag Tracking &amp; Staff Log</span>
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel}>Fabric Bag Barcode / Serial</label>
                <input name="bag_serial" defaultValue="BAG-3DCA-8492" className={`${adminStyles.inputField} ${adminStyles.inputFieldMono}`} />
              </div>
              <div>
                <label className={adminStyles.formLabel}>Assigned Packer</label>
                <select name="packer" defaultValue="Kwanele G." className={adminStyles.selectField}>
                  <option value="Kwanele G.">Kwanele G. (Lead Packer)</option>
                  <option value="Mcebisi M.">Mcebisi M.</option>
                  <option value="Liam M.">Liam M.</option>
                </select>
              </div>
              <div>
                <label className={adminStyles.formLabel}>Packing Notes / Substitution Exceptions</label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue="Substituted blue shatterproof ruler with clear 30cm ruler due to supplier stock buffer."
                  className={adminStyles.textareaField}
                />
              </div>
              <div className={adminStyles.pt8}>
                <button type="submit" className={`${styles.primaryBtn} ${adminStyles.hFullBtn}`}>
                  <Save size={14} /> Save Packing Log
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}