import page from "@/styles/Page.module.css";

export default function Loading() {
  return (
    <section className={page.pageHero}>
      <div className={page.pageHeroNarrow} style={{ textAlign: "center" }}>
        <div
          aria-label="Loading"
          role="status"
          style={{
            width: 40,
            height: 40,
            margin: "0 auto 24px",
            border: "3px solid var(--color-border)",
            borderTop: "3px solid var(--color-navy)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "var(--color-muted)", fontSize: 15 }}>Loading…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </section>
  );
}
