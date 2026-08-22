import Link from "next/link";
import { ArrowLeft, Barcode, CheckSquare, Save } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
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
        <Link href="/admin/fulfilment" className={`${styles.secondaryBtn} ${styles.backLinkOverride}`}>
          <ArrowLeft size={14} /> Back to Packing &amp; Fulfilment
        </Link>
      </div>

      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            Fulfilment Workbench: {orderNumber}
            <span className={styles.badgeTeal}>● In Packing</span>
          </h1>
          <p className={styles.headerSubtitle}>
            School: 3d Christian Academy • Grade 4 Pack • Learner: Ethan Morgan • Opening: 15 Jan 2027
          </p>
        </div>
      </div>

      {/* 6-Stage Stepper Bar */}
      <div className={`${styles.tableCard} ${styles.pCard}`}>
        <div className={`${styles.text11} ${styles.fw700} ${styles.uppercase} ${styles.lsWide} ${styles.cSubtle} ${styles.mb12}`}>
          Packing Lifecycle Stepper
        </div>
        <div className={styles.grid6}>
          {steps.map((item, idx) => {
            const btnCls = item.active
              ? `${styles.primaryBtn} ${styles.text11} ${styles.justifyCenter} ${styles.stepBtnActive}`
              : item.done
                ? `${styles.secondaryBtn} ${styles.text11} ${styles.justifyCenter} ${styles.stepBtnDone}`
                : `${styles.secondaryBtn} ${styles.text11} ${styles.justifyCenter} ${styles.stepBtnInactive}`;
            return (
              <button key={idx} type="button" className={btnCls}>
                {item.done ? "\u2713 " : ""}{item.stage}
              </button>
            );
          })}
        </div>
      </div>

      {/* Packing Workbench Layout */}
      <div className={`${styles.detailLayout} ${styles.mt18}`}>
        <div className={`${styles.flex} ${styles["flex-col"]} ${styles.gap18}`}>
          {/* Interactive Packing Checklist */}
          <div className={styles.tableCard}>
            <div className={styles.sectionHeaderBetween}>
              <div className={`${styles.flex} ${styles.itemsCenter} ${styles.gap8}`}>
                <CheckSquare size={16} className={styles.iconTeal} />
                <span>Reusable Bag Items Checklist (4 of 5 Checked)</span>
              </div>
              <span className={styles.badgeGreen}>80% Complete</span>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th className={styles.w40}>CHECK</th>
                    <th>ITEM DESCRIPTION</th>
                    <th>QTY</th>
                    <th>UNIT FORMAT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((itm, idx) => (
                    <tr key={idx} className={`${styles.dataRow} ${itm.substitute ? styles.rowHighlight : ""}`}>
                      <td><input type="checkbox" defaultChecked={itm.checked} className={styles.checkbox} /></td>
                      <td className={itm.substitute ? `${styles.cAmber} ${styles.fw700}` : `${styles.fw700}`}>{itm.name}</td>
                      <td>{itm.qty}</td>
                      <td>{itm.unit}</td>
                      <td>
                        {itm.packed
                          ? <span className={styles.badgeGreen}>Packed</span>
                          : <span className={styles.badgeAmber}>Pending Verification</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Packing Notes & Barcode Panel */}
        <div className={styles.sidebarColumn}>
          <form action="/admin/fulfilment" method="GET" className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Barcode size={16} className={styles.iconTeal} />
                <span>Bag Tracking &amp; Staff Log</span>
              </div>
            </div>

            <div className={styles.formField}>
              <div>
                <label className={styles.formLabel}>Fabric Bag Barcode / Serial</label>
                <input name="bag_serial" defaultValue="BAG-3DCA-8492" className={`${styles.inputField} ${styles.inputFieldMono}`} />
              </div>
              <div>
                <label className={styles.formLabel}>Assigned Packer</label>
                <select name="packer" defaultValue="Kwanele G." className={styles.selectField}>
                  <option value="Kwanele G.">Kwanele G. (Lead Packer)</option>
                  <option value="Mcebisi M.">Mcebisi M.</option>
                  <option value="Liam M.">Liam M.</option>
                </select>
              </div>
              <div>
                <label className={styles.formLabel}>Packing Notes / Substitution Exceptions</label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue="Substituted blue shatterproof ruler with clear 30cm ruler due to supplier stock buffer."
                  className={styles.textareaField}
                />
              </div>
              <div className={styles.pt8}>
                <button type="submit" className={`${styles.primaryBtn} ${styles.hFullBtn}`}>
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