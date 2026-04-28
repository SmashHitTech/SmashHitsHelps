import { useEffect, useRef, useState } from "react";
import { Github, Search, X } from "lucide-react";
import { CATEGORIES, GCP_DATA } from "../content";
import { FlowDiagram } from "../components/FlowDiagram";
import { ProductCard } from "../components/ProductCard";
import { CostDots } from "../components/CostDots";
import { GlobalStyles } from "../styles/GlobalStyles";

export default function GCPNavigator() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [expandedProducts, setExpandedProducts] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [showFlow, setShowFlow] = useState(true);
  const contentRef = useRef(null);

  const toggleProduct = (name) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const activeCat = activeCategory ? GCP_DATA[activeCategory] : null;

  const searchResults = searchTerm.length >= 2
    ? CATEGORIES.flatMap(([catKey, cat]) =>
      cat.products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.when.toLowerCase().includes(searchTerm.toLowerCase())
      ).map(p => ({ ...p, catKey, catColor: cat.color, catLabel: cat.label }))
    )
    : [];

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeCategory]);

  return (
    <div style={{
      height: "100vh",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg-0)",
      color: "var(--text-1)",
      overflow: "hidden",
    }}>
      <GlobalStyles />

      {/* Header */}
      <header style={{
        padding: "20px 32px 0",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
        background: "var(--bg-0)",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 24,
          marginBottom: 16,
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "linear-gradient(135deg, #4285F4, #34A853 50%, #FBBC04 75%, #EA4335)",
                flexShrink: 0,
              }} />
              <h1 style={{
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                margin: 0,
                color: "var(--text-1)",
              }}>
                GCP Navigator
              </h1>
              <span className="eyebrow" style={{ marginLeft: 4 }}>
                Decision guide
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-3)", margin: 0, paddingLeft: 40 }}>
              By Lydia Thomas
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <Search
                size={15}
                strokeWidth={2}
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }}
                aria-hidden
              />
              <input
                type="text"
                placeholder="Search products, descriptions, use cases…"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); if (e.target.value.length >= 2) setActiveCategory(null); }}
                className="surface-input"
              />
              {searchTerm && (
                <button
                  aria-label="Clear search"
                  onClick={() => setSearchTerm("")}
                  style={{
                    position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                    background: "transparent", border: "none", color: "var(--text-3)",
                    cursor: "pointer", padding: 4, display: "inline-flex",
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <a
              href="https://github.com/SmashHitTech/SmashHitsHelps"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Smash Hits Helps on GitHub"
              title="GitHub — SmashHitsHelps"
              className="icon-btn"
            >
              <Github size={16} strokeWidth={2} aria-hidden />
            </a>
          </div>
        </div>

        {/* Category bar */}
        <div style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          paddingBottom: 14,
          marginLeft: -4,
          paddingLeft: 4,
        }}>
          <button
            onClick={() => { setActiveCategory(null); setSearchTerm(""); }}
            className="pill"
            data-active={activeCategory === null && searchTerm.length < 2}
          >
            All categories
          </button>
          {CATEGORIES.map(([key, cat]) => (
            <button
              key={key}
              onClick={() => { setActiveCategory(key === activeCategory ? null : key); setSearchTerm(""); }}
              className="pill"
              data-active={activeCategory === key}
            >
              <span className="dot" style={{ background: cat.color }} />
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div ref={contentRef} style={{ flex: 1, overflow: "auto", padding: "24px 32px 40px" }}>
        {searchTerm.length >= 2 && (
          <div style={{ animation: "fadeIn 0.2s ease", maxWidth: 980, margin: "0 auto" }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{searchTerm}"
            </div>
            {searchResults.map(p => (
              <div key={p.name} style={{ marginBottom: 4 }}>
                <div className="eyebrow" style={{ color: p.catColor, marginBottom: 4 }}>{p.catLabel}</div>
                <ProductCard product={p} color={p.catColor} isExpanded={expandedProducts.has(p.name)} onToggle={() => toggleProduct(p.name)} />
              </div>
            ))}
            {searchResults.length === 0 && (
              <div style={{ textAlign: "center", padding: 64, color: "var(--text-3)" }}>
                <div style={{ fontSize: 14, marginBottom: 4 }}>No matching products</div>
                <div style={{ fontSize: 12.5 }}>Try a broader term or browse by category</div>
              </div>
            )}
          </div>
        )}

        {!activeCategory && searchTerm.length < 2 && (
          <div style={{ animation: "fadeIn 0.2s ease", maxWidth: 1240, margin: "0 auto" }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text-1)", margin: 0, marginBottom: 4 }}>
                Browse categories
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
                Pick a service area to see its decision flow and product details.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
              {CATEGORIES.map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  style={{
                    textAlign: "left",
                    background: "var(--bg-1)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "18px 18px 16px",
                    cursor: "pointer",
                    transition: "border-color .15s ease, background .15s ease",
                    color: "var(--text-1)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "var(--border-strong)";
                    e.currentTarget.style.background = "var(--bg-2)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "var(--bg-1)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, fontSize: 14.5, letterSpacing: "-0.01em" }}>{cat.label}</span>
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
                      {String(cat.products.length).padStart(2, "0")}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {cat.products.slice(0, 4).map(p => (
                      <span
                        key={p.name}
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          background: "var(--bg-2)",
                          color: "var(--text-2)",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                        }}
                      >
                        {p.name}
                      </span>
                    ))}
                    {cat.products.length > 4 && (
                      <span style={{ fontSize: 11, padding: "3px 8px", color: "var(--text-3)" }}>
                        +{cat.products.length - 4}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeCat && searchTerm.length < 2 && (
          <div style={{ animation: "fadeIn 0.2s ease", maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, gap: 16, flexWrap: "wrap" }}>
              <div>
                <div className="eyebrow" style={{ color: activeCat.color, marginBottom: 4 }}>
                  Decision flow
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-1)", margin: 0 }}>
                  {activeCat.label}
                </h2>
              </div>
              <button
                onClick={() => setShowFlow(!showFlow)}
                style={{
                  background: "var(--bg-1)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "6px 12px",
                  color: "var(--text-2)",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {showFlow ? "Hide" : "Show"} flow
              </button>
            </div>

            {showFlow && (
              <div style={{
                background: "var(--bg-1)",
                borderRadius: "var(--radius-lg)",
                padding: 20,
                marginBottom: 28,
                border: "1px solid var(--border)",
                overflowX: "auto",
                boxShadow: "var(--shadow-sm)",
              }}>
                <FlowDiagram flow={activeCat.flow} color={activeCat.color} />
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 2 }}>Products</div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>
                  {activeCat.products.length} in this category
                </span>
              </div>
              <button
                onClick={() => {
                  const allNames = activeCat.products.map(p => p.name);
                  const allExpanded = allNames.every(n => expandedProducts.has(n));
                  setExpandedProducts(prev => {
                    const next = new Set(prev);
                    allNames.forEach(n => allExpanded ? next.delete(n) : next.add(n));
                    return next;
                  });
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: activeCat.color,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {activeCat.products.every(p => expandedProducts.has(p.name)) ? "Collapse all" : "Expand all"}
              </button>
            </div>

            {activeCat.products.map(p => (
              <ProductCard key={p.name} product={p} color={activeCat.color} isExpanded={expandedProducts.has(p.name)} onToggle={() => toggleProduct(p.name)} />
            ))}
          </div>
        )}
      </div>

      {/* Footer / cost legend */}
      <footer style={{
        padding: "10px 32px",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-0)",
        display: "flex",
        gap: 20,
        alignItems: "center",
        flexWrap: "wrap",
        fontSize: 11.5,
        color: "var(--text-3)",
        flexShrink: 0,
      }}>
        <span className="eyebrow">Cost</span>
        {["$", "$$", "$$$", "$$$$", "$$$$$"].map((c, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <CostDots cost={c} />
            <span>{["low", "mid", "high", "premium", "enterprise"][i]}</span>
          </span>
        ))}
      </footer>
    </div>
  );
}
