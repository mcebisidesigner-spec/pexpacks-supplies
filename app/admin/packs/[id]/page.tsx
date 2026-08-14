import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getPack, listPacks } from "@/lib/admin/packs";
import { deletePackAction } from "../actions";
import { getSchool } from "@/lib/admin/schools";
import { PackPriceForm } from "@/components/admin/packs/PackPriceForm";
import { PackItemsSection } from "@/components/admin/packs/PackItemsSection";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { DuplicateButton } from "@/components/admin/packs/DuplicateButton";
import { VisibleToggle } from "@/components/admin/packs/VisibleToggle";
import adminStyles from "../../admin.module.css";
import shared from "../../schools/schools.module.css";
import styles from "../packs.module.css";

interface EditPackPageProps {
  params: Promise<{ id: string }>;
}

function money(v: number): string {
  return `R ${v.toFixed(2)}`;
}

function extractGradeLabel(title: string, slug?: string | null): string {
  const text = `${title} ${slug ?? ""}`;
  const match = text.match(/grade\s*([r\d]+)/i);
  if (match) {
    const val = match[1].toUpperCase();
    return val === "R" ? "Grade R" : `Grade ${val}`;
  }
  return "Grade Pack";
}

export default async function PackOrSchoolPacksPage({ params }: EditPackPageProps) {
  await requireAdmin({ permission: "packs.view" });
  const { id } = await params;

  // 1. Check if slug/ID matches a School (e.g. /admin/packs/actonville-primary-school)
  const school = await getSchool(id);

  if (school) {
    const packResult = await listPacks({ school_id: school.id, pageSize: 100 });

    return (
      <div className={adminStyles.adminContainer}>
        <p style={{ marginBottom: 12 }}>
          <Link href="/admin/packs" className={shared.resetLink}>
            ← Back to grade packs
          </Link>
        </p>

        <div className={shared.toolbar}>
          <div className={shared.headerRow}>
            <h1 className={shared.pageTitle}>
              {school.name}
              <span className={shared.count}>
                {packResult.total} {packResult.total === 1 ? "Grade pack" : "Grade packs"}
              </span>
            </h1>
            <Link
              href={`/admin/packs/new?school_id=${school.id}`}
              className={shared.addButton}
            >
              + Add pack
            </Link>
          </div>
        </div>

        {packResult.packs.length === 0 ? (
          <div className={adminStyles.tableCard}>
            <div className={adminStyles.emptyStateContainer}>
              <div className={adminStyles.emptyStateInner}>
                <div className={adminStyles.emptyIconWrapper}>
                  <svg viewBox="0 0 24 24">
                    <path d="M4 7h16v13H4z" />
                    <path d="M8 3h8l2 4H6l2-4z" />
                  </svg>
                </div>
                <h2 className={adminStyles.emptyStateTitle}>No grade packs for {school.name} yet</h2>
                <p className={adminStyles.emptyStateText}>
                  Add your first grade pack for {school.name} to start building the catalogue.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={adminStyles.tableCard}>
            <div className={adminStyles.tableWrapper}>
              <table className={adminStyles.table}>
                <thead>
                  <tr>
                    <th>SCHOOL NAME</th>
                    <th>PRICE</th>
                    <th>STOCK</th>
                    <th>ITEMS</th>
                    <th>FLAGS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {packResult.packs.map((pack) => {
                    const packHref = `/admin/packs/${school.slug || school.id}/${pack.slug || pack.id}`;

                    return (
                      <tr key={pack.id}>
                        <td>
                          <div className={`${styles.packCell} ${styles.packName}`}>
                            <Link
                              href={packHref}
                              className={styles.schoolNameLink}
                            >
                              {school.name}
                            </Link>
                          </div>
                        </td>
                        <td className={styles.priceCell}>{money(pack.price)}</td>
                        <td className={styles.stockCell}>
                          <span className={pack.stock === 0 ? styles.stockLow : undefined}>
                            {pack.stock}
                          </span>
                        </td>
                        <td className={styles.itemCount}>{pack.item_count}</td>
                        <td>
                          <div className={shared.flags}>
                            <span
                              className={`${shared.flag} ${
                                pack.visible ? styles.badgeVisible : styles.badgeHidden
                              }`}
                            >
                              {pack.visible ? "Visible" : "Hidden"}
                            </span>
                            {pack.featured ? (
                              <span className={`${shared.flag} ${styles.badgeFeatured}`}>
                                Featured
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td>
                          <div className={shared.actions}>
                            <Link
                              href={packHref}
                              className={shared.actionLink}
                            >
                              Edit
                            </Link>
                            <VisibleToggle id={pack.id} visible={pack.visible} />
                            <DuplicateButton id={pack.id} title={pack.title} />
                            <form action={deletePackAction.bind(null, pack.id)}>
                              <ConfirmButton
                                label="Delete"
                                title="Delete Pack Permanently"
                                confirmLabel="Delete Pack"
                                confirmText={`Permanently delete "${pack.title}"`}
                                busyLabel="Deleting…"
                                className={`${shared.rowButton} ${shared.rowButtonDelete}`}
                              />
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Otherwise, check if slug/ID matches a Grade Pack ID
  const { pack, items } = await getPack(id);
  if (!pack) notFound();

  const subtotal = items.reduce(
    (sum, item) => sum + (item.unit_price ?? 0) * item.quantity,
    0
  );

  return (
    <div className={adminStyles.adminContainer}>
      <p style={{ marginBottom: 12 }}>
        <Link href="/admin/packs" className={shared.resetLink}>
          ← Back to school packs
        </Link>
      </p>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Edit pack</h1>
        <p className={adminStyles.subtitle}>{pack.title}</p>
      </div>
      <div className={adminStyles.stack}>
        <PackPriceForm packId={pack.id} price={pack.price} subtotal={subtotal} />
        <PackItemsSection packId={pack.id} items={items} />
      </div>
    </div>
  );
}
