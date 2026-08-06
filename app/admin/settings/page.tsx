import { requireAdmin } from "@/lib/admin/rbac";
import { getSettings, settingSections, type AppSettings } from "@/lib/admin/settings";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";
import adminStyles from "../admin.module.css";
import styles from "./settings.module.css";

export const metadata = {
  title: "Settings | Admin | Pexpacks",
};

export default async function SettingsPage() {
  await requireAdmin({ permission: "settings.manage" });
  const settings = await getSettings();
  const sections = settingSections();

  return (
    <div className={adminStyles.adminContainer}>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Settings</h1>
        <p className={adminStyles.subtitle}>
          Store-wide configuration. Changes apply to the live site immediately.
        </p>
      </div>

      <div className={styles.stack}>
        {sections.map((section) => (
          <section key={section.key} className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{section.label}</h2>
              <p className={styles.cardSubtitle}>{section.description}</p>
            </div>
            <div className={styles.cardBody}>
              <SettingsForm
                section={section}
                values={(settings as AppSettings)[section.key] as Record<string, unknown>}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
