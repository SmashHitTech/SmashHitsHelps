import { ChevronRight } from "lucide-react";
import { CostDots } from "./CostDots";

export function ProductCard({ product, color, isExpanded, onToggle }) {
  return (
    <div
      onClick={onToggle}
      role="button"
      aria-expanded={isExpanded}
      style={{
        background: "var(--bg-1)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${color}`,
        borderRadius: "var(--radius-lg)",
        padding: "14px 18px",
        cursor: "pointer",
        marginBottom: 8,
        transition: "border-color .15s ease, background .15s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.borderLeftColor = color; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.borderLeftColor = color; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text-1)", letterSpacing: "-0.01em" }}>
              {product.name}
            </span>
            <span style={{ fontSize: 13, color: "var(--text-2)" }}>{product.desc}</span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 4 }}>
            <span style={{ color, fontWeight: 500 }}>›</span> {product.when}
          </div>
        </div>
        <ChevronRight
          size={18}
          strokeWidth={2}
          style={{
            color: "var(--text-3)",
            transition: "transform .2s ease",
            transform: isExpanded ? "rotate(90deg)" : "rotate(0)",
            flexShrink: 0,
          }}
          aria-hidden
        />
      </div>

      {isExpanded && (
        <div style={{ marginTop: 16, animation: "fadeIn 0.2s ease" }} onClick={e => e.stopPropagation()}>
          <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: "var(--bg-2)" }}>
                  {["Tier", "Use case", "vCPU", "Memory", "Cost"].map(h => (
                    <th
                      key={h}
                      className="eyebrow"
                      style={{
                        textAlign: "left",
                        padding: "10px 14px",
                        color: "var(--text-3)",
                        borderBottom: "1px solid var(--border)",
                        fontSize: 10.5,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.tiers.map((t, i) => (
                  <tr
                    key={i}
                    style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
                  >
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--text-1)" }}>{t.tier}</td>
                    <td style={{ padding: "10px 14px", color: "var(--text-2)" }}>{t.use}</td>
                    <td className="mono" style={{ padding: "10px 14px", color: "var(--text-3)", fontSize: 12 }}>{t.vcpu}</td>
                    <td className="mono" style={{ padding: "10px 14px", color: "var(--text-3)", fontSize: 12 }}>{t.mem}</td>
                    <td style={{ padding: "10px 14px" }}><CostDots cost={t.cost} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {product.tradeoffs && product.tradeoffs.length > 0 && (
            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {product.tradeoffs.map((t, i) => (
                <span
                  key={i}
                  style={{
                    background: "var(--bg-2)",
                    color: "var(--text-2)",
                    border: "1px solid var(--border)",
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 11.5,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
