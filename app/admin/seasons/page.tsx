import { Calendar } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listSeasons } from "@/lib/admin/operations";
import { formatDate } from "@/lib/admin/ui-utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  createSeasonAction,
  setDefaultSeasonAction,
} from "../operations-actions";
import admin from "../admin.module.css";
import styles from "../operations.module.css";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = ["planning", "active", "closed", "archived"];

export default async function SeasonsPage() {
  const [session, seasons] = await Promise.all([
    requireAdmin({ permission: "settings.manage" }),
    listSeasons(),
  ]);
  const canManage = hasPermission(session, "settings.manage");

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Seasons"
        count={seasons.length}
        subtitle="The default season determines the operational period for new orders and procurement."
        actions={<Calendar size={22} />}
      />


      {canManage ? (
        <section className={styles.formPanel}>
          <h2>Add season</h2>
          <form action={createSeasonAction} className={styles.formGrid}>
            <input
              className={styles.field}
              name="name"
              placeholder="Season name"
              required
            />
            <input
              className={styles.field}
              name="academicYear"
              type="number"
              min="2024"
              max="2035"
              placeholder="Academic year"
              required
            />
            <select className={styles.field} name="status" defaultValue="planning">
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <input
              className={styles.field}
              name="startsOn"
              type="date"
              aria-label="Starts on"
            />
            <input
              className={styles.field}
              name="orderingClosesOn"
              type="date"
              aria-label="Ordering closes on"
            />
            <input
              className={styles.field}
              name="fulfilmentStartsOn"
              type="date"
              aria-label="Fulfilment starts on"
            />
            <input
              className={styles.field}
              name="fulfilmentEndsOn"
              type="date"
              aria-label="Fulfilment ends on"
            />
            <label className={styles.inlineForm}>
              <input name="isDefault" type="checkbox" /> Default season
            </label>
            <AdminButton type="submit">Add season</AdminButton>
          </form>
        </section>
      ) : null}

      <div className={admin.tableCard}>
        {seasons.length ? (
          <div className={admin.tableWrapper}>
            <table className={admin.table}>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Ordering closes</th>
                  <th>Fulfilment starts</th>
                  <th>Fulfilment ends</th>
                  <th>Default</th>
                  {canManage ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {seasons.map((season) => (
                  <tr key={season.id}>
                    <td className={styles.mono}>{season.academic_year}</td>
                    <td className={styles.name}>{season.name}</td>
                    <td>
                        <StatusBadge
                          status={season.status}
                          tone={season.status === "active" ? "emerald" : season.status === "closed" ? "red" : "slate"}
                        />
                    </td>
                    <td>{formatDate(season.ordering_closes_on)}</td>
                    <td>{formatDate(season.fulfilment_starts_on)}</td>
                    <td>{formatDate(season.fulfilment_ends_on)}</td>
                    <td>{season.is_default ? "★ Default" : "—"}</td>
                    {canManage ? (
                      <td>
                        <div className={styles.actionCell}>
                          {!season.is_default ? (
                            <form action={setDefaultSeasonAction.bind(null, season.id)}>
                              <AdminButton type="submit">Set default</AdminButton>
                            </form>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No seasons" text="No seasons created yet." />
        )}
      </div>
    </div>
  );
}
