import { CostDots } from "./CostDots";

export function ProductCard({ product, color, isExpanded, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      background: "var(--bg-secondary)", borderRadius: 12, padding: "14px 18px",
      cursor: "pointer", borderLeft: `4px solid ${color}`, transition: "all 0.2s ease", marginBottom: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", fontFamily: "'Space Mono', monospace" }}>{product.name}</span>
          <span style={{ marginLeft: 10, fontSize: 12, opacity: 0.5, fontFamily: "'DM Sans', sans-serif" }}>{product.desc}</span>
        </div>
        <span style={{ fontSize: 18, opacity: 0.4, transition: "transform 0.2s", transform: isExpanded ? "rotate(90deg)" : "rotate(0)" }}>›</span>
      </div>
      <div style={{ fontSize: 12, color: color, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>{product.when}</div>
      {isExpanded && (
        <div style={{ marginTop: 14, animation: "fadeIn 0.2s ease" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${color}33` }}>
                  {["Tier", "Use Case", "vCPU", "Memory", "Cost"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontWeight: 600, color: color, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.tiers.map((t, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--bg-tertiary)" }}>
                    <td style={{ padding: "8px 10px", fontWeight: 600, fontFamily: "'Space Mono', monospace", fontSize: 12 }}>{t.tier}</td>
                    <td style={{ padding: "8px 10px", opacity: 0.75 }}>{t.use}</td>
                    <td style={{ padding: "8px 10px", opacity: 0.6, fontFamily: "'Space Mono', monospace" }}>{t.vcpu}</td>
                    <td style={{ padding: "8px 10px", opacity: 0.6, fontFamily: "'Space Mono', monospace" }}>{t.mem}</td>
                    <td style={{ padding: "8px 10px" }}><CostDots cost={t.cost} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {product.tradeoffs && (
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {product.tradeoffs.map((t, i) => (
                <span key={i} style={{
                  background: `${color}15`, color: color, padding: "4px 10px", borderRadius: 20,
                  fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, whiteSpace: "nowrap",
                }}>{t}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

