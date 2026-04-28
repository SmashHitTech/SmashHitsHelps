import { useEffect, useRef, useState } from "react";
import { Github, Globe } from "lucide-react";
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
      height: "100vh", width: "100%", display: "flex", flexDirection: "column",
      background: "var(--bg-primary, #0d1117)", color: "var(--text-primary, #c9d1d9)",
      fontFamily: "'DM Sans', sans-serif", overflow: "hidden",
    }}>
      <GlobalStyles />

      <div style={{ padding: "16px 24px 12px", borderBottom: "1px solid var(--bg-tertiary)", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Space Mono', monospace", letterSpacing: "-0.03em", margin: 0 }}>GCP Navigator</h1>
              <span style={{ fontSize: 11, opacity: 0.4, fontFamily: "'DM Mono', monospace" }}>hover nodes for context · click products below</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, opacity: 0.55, fontFamily: "'DM Sans', sans-serif" }}>
                By Lydia Thomas for{" "}
                <a href="https://makeitasmash.com/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }}>
                  Smash Hit Technologies
                </a>
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <a
                  href="https://github.com/SmashHitTech/SmashHitsHelps"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Smash Hits Helps on GitHub"
                  title="GitHub — SmashHitsHelps"
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 36, height: 36, borderRadius: 10,
                    background: "var(--bg-secondary)", border: "1px solid var(--bg-tertiary)",
                    color: "var(--text-secondary)", transition: "color 0.15s ease, border-color 0.15s ease, background 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--text-secondary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--bg-tertiary)"; }}
                >
                  <Github size={18} strokeWidth={2} aria-hidden />
                </a>
                <a
                  href="https://makeitasmash.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Smash Hit Technologies website"
                  title="makeitasmash.com"
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 36, height: 36, borderRadius: 10,
                    background: "var(--bg-secondary)", border: "1px solid var(--bg-tertiary)",
                    color: "var(--text-secondary)", transition: "color 0.15s ease, border-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--text-secondary)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--bg-tertiary)"; }}
                >
                  <Globe size={18} strokeWidth={2} aria-hidden />
                </a>
              </div>
            </div>
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); if (e.target.value.length >= 2) setActiveCategory(null); }}
            style={{
              background: "var(--bg-secondary)", border: "1px solid var(--bg-tertiary)", borderRadius: 8,
              padding: "8px 14px", color: "var(--text-primary)", fontSize: 13, width: 220, outline: "none", fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {CATEGORIES.map(([key, cat]) => (
            <button
              key={key}
              onClick={() => { setActiveCategory(key === activeCategory ? null : key); setSearchTerm(""); }}
              style={{
                padding: "7px 14px", borderRadius: 8, border: "none",
                background: activeCategory === key ? cat.color : "var(--bg-secondary)",
                color: activeCategory === key ? "#fff" : "var(--text-secondary)",
                cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
                transition: "all 0.15s ease", fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <span style={{ fontSize: 14 }}>{cat.icon}</span>{cat.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={contentRef} style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
        {searchTerm.length >= 2 && (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{searchTerm}"
            </div>
            {searchResults.map(p => (
              <div key={p.name} style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 10, color: p.catColor, fontWeight: 600, marginBottom: 2, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.catLabel}</div>
                <ProductCard product={p} color={p.catColor} isExpanded={expandedProducts.has(p.name)} onToggle={() => toggleProduct(p.name)} />
              </div>
            ))}
            {searchResults.length === 0 && <div style={{ textAlign: "center", padding: 40, opacity: 0.4 }}>No matching products</div>}
          </div>
        )}

        {!activeCategory && searchTerm.length < 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, animation: "fadeIn 0.2s ease" }}>
            {CATEGORIES.map(([key, cat]) => (
              <div
                key={key}
                onClick={() => setActiveCategory(key)}
                style={{ background: "var(--bg-secondary)", borderRadius: 12, padding: 20, cursor: "pointer", borderTop: `3px solid ${cat.color}`, transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${cat.color}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{cat.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, fontFamily: "'Space Mono', monospace", marginBottom: 6 }}>{cat.label}</div>
                <div style={{ fontSize: 12, opacity: 0.5 }}>{cat.products.length} products</div>
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {cat.products.slice(0, 4).map(p => (
                    <span key={p.name} style={{ fontSize: 10, padding: "3px 8px", background: `${cat.color}18`, color: cat.color, borderRadius: 12, fontFamily: "'DM Mono', monospace" }}>{p.name}</span>
                  ))}
                  {cat.products.length > 4 && <span style={{ fontSize: 10, padding: "3px 8px", opacity: 0.4 }}>+{cat.products.length - 4}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeCat && searchTerm.length < 2 && (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontFamily: "'Space Mono', monospace", color: activeCat.color }}>
                {activeCat.icon} {activeCat.label} — Decision Flow
              </h2>
              <button onClick={() => setShowFlow(!showFlow)} style={{
                background: "var(--bg-secondary)", border: "1px solid var(--bg-tertiary)", borderRadius: 6,
                padding: "5px 12px", color: "var(--text-secondary)", cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace",
              }}>{showFlow ? "hide" : "show"} flow</button>
            </div>

            {showFlow && (
              <div style={{
                background: "var(--bg-secondary)", borderRadius: 12, padding: 16, marginBottom: 20,
                border: `1px solid ${activeCat.color}22`, overflowX: "auto",
              }}>
                <FlowDiagram flow={activeCat.flow} color={activeCat.color} />
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Space Mono', monospace" }}>Products ({activeCat.products.length})</span>
              <button onClick={() => {
                const allNames = activeCat.products.map(p => p.name);
                const allExpanded = allNames.every(n => expandedProducts.has(n));
                setExpandedProducts(prev => { const next = new Set(prev); allNames.forEach(n => allExpanded ? next.delete(n) : next.add(n)); return next; });
              }} style={{ background: "none", border: "none", color: activeCat.color, cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                {activeCat.products.every(p => expandedProducts.has(p.name)) ? "collapse" : "expand"} all
              </button>
            </div>

            {activeCat.products.map(p => (
              <ProductCard key={p.name} product={p} color={activeCat.color} isExpanded={expandedProducts.has(p.name)} onToggle={() => toggleProduct(p.name)} />
            ))}
          </div>
        )}
      </div>

      <div style={{
        padding: "8px 24px", borderTop: "1px solid var(--bg-tertiary)", display: "flex", gap: 16,
        alignItems: "center", flexWrap: "wrap", fontSize: 11, opacity: 0.5, fontFamily: "'DM Mono', monospace", flexShrink: 0,
      }}>
        <span>Cost: </span>
        {["$", "$$", "$$$", "$$$$", "$$$$$"].map((c, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <CostDots cost={c} /> {["low", "mid", "high", "premium", "enterprise"][i]}
          </span>
        ))}
      </div>
    </div>
  );
}

