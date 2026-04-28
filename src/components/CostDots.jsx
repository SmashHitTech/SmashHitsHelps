export function CostDots({ cost }) {
  const count = cost ? cost.replace(/[^$]/g, "").length : 0;
  if (cost && !cost.startsWith("$")) {
    return <span style={{ fontSize: 11, color: "var(--text-3)" }}>{cost}</span>;
  }
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }} aria-label={`Cost tier ${count} of 5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: i <= count ? "var(--cost-fill, #22c55e)" : "var(--bg-3)",
            display: "inline-block",
          }}
        />
      ))}
    </span>
  );
}
