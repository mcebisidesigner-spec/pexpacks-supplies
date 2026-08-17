import { Calendar } from "lucide-react";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import { listSeasons, isOperationsSchemaReady } from "@/lib/admin/operations";
import {
  createSeasonAction,
  updateSeasonAction,
  setDefaultSeasonAction,
} from "../operations-actions";
import admin from "../admin.module.css";
import styles from "../operations.module.css";

export const dynamic = "force-dynamic";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_OPTIONS = ["planning", "active", "closed", "archived"];

export default async function SeasonsPage() {
  const session = await requireAdmin({ permission: "settings.manage" });
  const [schemaReady, seasons] = await Promise.all([
    isOperationsSchemaReady(),
    listSeasons(),
  ]);
  const canManage = hasPermission(session, "settings.manage");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>
            <Calendar size={22} /> Seasons
          </h1>
          <p>
            {seasons.length} seasons. The default season determines the
            operational period for new orders and procurement.
          </p>
        </div>
      </header>

      {!schemaReady ? (
        <section className={styles.notice} role="status">
          <strong>Operations database setup required</strong>
          <p>Apply migration 00030 to activate season management.</p>
        </section>
      ) : null}

      {schemaReady && canManage ? (
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
            <button className={styles.button} type="submit">
              Add season
            </button>
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
                      <span
                        className={`${styles.badge} ${
                          season.status === "active"
                            ? styles.good
                            : season.status === "closed"
                              ? styles.danger
                              : ""
                        }`}
                      >
                        {season.status}
                      </span>
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
                              <button className={styles.button} type="submit">
                                Set default
                              </button>
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
          <p className={styles.empty}>No seasons created yet.</p>
        )}
      </div>
    </div>
  );
}
