export function CostDots({ cost }) {
  const count = cost ? cost.replace(/[^$]/g, "").length : 0;
  if (cost && !cost.startsWith("$")) return <span style={{ fontSize: 11, opacity: 0.6 }}>{cost}</span>;
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: i <= count ? "var(--text-secondary)" : "var(--bg-tertiary)",
          display: "inline-block",
          opacity: i <= count ? 0.85 : 0.3,
        }} />
      ))}
    </span>
  );
}

