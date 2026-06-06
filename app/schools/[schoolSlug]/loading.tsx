export default function SchoolDetailLoading() {
  const shimmer = "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)";

  return (
    <div style={{ padding: 0 }}>
      <div style={{ height: 260, background: shimmer, backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ height: 180, borderRadius: 12, background: shimmer, backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        <div style={{ height: 180, borderRadius: 12, background: shimmer, backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        <div style={{ height: 180, borderRadius: 12, background: shimmer, backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      </div>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}
