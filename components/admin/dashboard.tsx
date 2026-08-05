import { AdminIcon } from "@/components/admin/icons";
import styles from "./dashboard.module.css";

type Tone = "keppel" | "coral" | "navy";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "keppel",
  badge,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: string;
  tone?: Tone;
  badge?: string;
}) {
  const toneClass =
    tone === "coral"
      ? styles.statIconCoral
      : tone === "navy"
        ? styles.statIconNavy
        : styles.statIconKeppel;

  return (
    <div className={styles.statCard}>
      <div className={styles.statCardTop}>
        <span className={`${styles.statIcon} ${toneClass}`}>
          <AdminIcon name={icon} size={20} />
        </span>
        {badge ? <span className={styles.statBadge}>{badge}</span> : null}
      </div>
      <div>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
        {hint ? <div className={styles.statHint}>{hint}</div> : null}
      </div>
    </div>
  );
}

export function VerticalBars({
  data,
  formatValue,
  tone = "keppel",
}: {
  data: { label: string; value: number }[];
  formatValue?: (value: number) => string;
  tone?: Tone;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const fmt = formatValue ?? ((v: number) => String(v));

  return (
    <div>
      <div className={styles.verticalBars} aria-hidden="true">
        {data.map((d, i) => (
          <div
            key={`${d.label}-${i}`}
            className={`${styles.bar} ${tone === "coral" ? styles.barCoral : ""}`}
            style={{ height: `${Math.max(1.5, (d.value / max) * 100)}%` }}
            title={`${d.label}: ${fmt(d.value)}`}
          />
        ))}
      </div>
      <div className={styles.barLabels}>
        {data.map((d, i) => (
          <span key={`${d.label}-${i}`} className={i % 5 === 0 ? "" : styles.barLabelHidden}>
            {d.label.slice(5)}
          </span>
        ))}
      </div>
      <div className={styles.chartTotal}>
        <span className={styles.chartTotalValue}>{fmt(total)}</span>
        <span className={styles.chartTotalLabel}>total · hover bars for daily detail</span>
      </div>
    </div>
  );
}

export function HorizontalBars({
  data,
  tone = "keppel",
  emptyText = "No data yet",
}: {
  data: { label: string; count: number }[];
  tone?: Tone;
  emptyText?: string;
}) {
  if (data.length === 0) {
    return <p className={styles.emptyNote}>{emptyText}</p>;
  }
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className={styles.hbar}>
      {data.map((d) => (
        <div key={d.label} className={styles.hbarRow}>
          <span className={styles.hbarLabel} title={d.label}>
            {d.label}
          </span>
          <span className={styles.hbarTrack}>
            <span
              className={`${styles.hbarFill} ${tone === "coral" ? styles.hbarFillCoral : ""}`}
              style={{ width: `${Math.max(4, (d.count / max) * 100)}%` }}
            />
          </span>
          <span className={styles.hbarValue}>{d.count}</span>
        </div>
      ))}
    </div>
  );
}
