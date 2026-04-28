import { useState } from "react";

export function FlowDiagram({ flow, color }) {
  if (!flow || flow.length === 0) return null;
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodeW = 140, nodeH = 40, gapY = 70;
  const positions = {};
  const edges = [];

  const children = {};
  flow.forEach(n => {
    if (n.parent) {
      if (!children[n.parent]) children[n.parent] = [];
      children[n.parent].push(n);
    }
  });

  function subtreeWidth(id) {
    const kids = children[id] || [];
    if (kids.length === 0) return nodeW + 24;
    const total = kids.reduce((sum, k) => sum + subtreeWidth(k.id), 0);
    return Math.max(total, nodeW + 24);
  }

  const root = flow.find(n => n.id === "start");
  if (!root) return null;

  function layoutNode(id, x, y) {
    positions[id] = { x, y };
    const kids = children[id] || [];
    if (kids.length === 0) return;
    const totalW = kids.reduce((sum, k) => sum + subtreeWidth(k.id), 0);
    let curX = x - totalW / 2;
    kids.forEach(kid => {
      const w = subtreeWidth(kid.id);
      const childX = curX + w / 2;
      layoutNode(kid.id, childX, y + gapY);
      edges.push({ from: id, to: kid.id, label: kid.branch });
      curX += w;
    });
  }

  const rootW = subtreeWidth(root.id);
  layoutNode(root.id, rootW / 2, 30);

  const allPos = Object.values(positions);
  const minX = Math.min(...allPos.map(p => p.x)) - nodeW / 2 - 30;
  const maxX = Math.max(...allPos.map(p => p.x)) + nodeW / 2 + 30;
  const maxY = Math.max(...allPos.map(p => p.y)) + nodeH + 20;
  const svgW = maxX - minX;
  const svgH = maxY + 10;

  const hoveredFlow = hoveredNode ? flow.find(n => n.id === hoveredNode) : null;
  const hoveredPos = hoveredNode ? positions[hoveredNode] : null;

  function getTipPos(pos, tip) {
    const maxW = 260;
    const padding = 10;
    const charsPerLine = 38;
    const lines = Math.ceil((tip || "").length / charsPerLine);
    const h = lines * 16 + padding * 2 + 4;
    let tx = pos.x - maxW / 2;
    let ty = pos.y - h - 12;
    if (tx < minX + 4) tx = minX + 4;
    if (tx + maxW > maxX - 4) tx = maxX - maxW - 4;
    if (ty < 2) ty = pos.y + nodeH + 8;
    return { tx, ty, h, maxW };
  }

  return (
    <svg width="100%" viewBox={`${minX} 0 ${svgW} ${svgH}`} style={{ maxHeight: 520, display: "block", margin: "0 auto" }}>
      <defs>
        <marker id={`arrow-${color.replace('#','')}`} viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 3.5 L 0 7 z" fill={color} opacity="0.5" />
        </marker>
      </defs>
      {edges.map((e, i) => {
        const from = positions[e.from];
        const to = positions[e.to];
        if (!from || !to) return null;
        const x1 = from.x, y1 = from.y + nodeH;
        const x2 = to.x, y2 = to.y;
        const midY = (y1 + y2) / 2;
        return (
          <g key={i}>
            <path
              d={`M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`}
              fill="none" stroke={color} strokeWidth="1.5" opacity="0.35"
              markerEnd={`url(#arrow-${color.replace('#','')})`}
            />
            <text x={(x1 + x2) / 2 + (x2 > x1 ? 8 : -8)} y={midY - 4}
              textAnchor="middle" fontSize="10" fill={color} fontWeight="700" opacity="0.7"
              fontFamily="'DM Mono', monospace"
            >
              {e.label}
            </text>
          </g>
        );
      })}
      {flow.map(n => {
        const pos = positions[n.id];
        if (!pos) return null;
        const isProduct = n.type === "product";
        const isHovered = hoveredNode === n.id;
        return (
          <g key={n.id}
            onMouseEnter={() => setHoveredNode(n.id)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{ cursor: n.tip ? "help" : "default" }}
          >
            {isProduct ? (
              <rect x={pos.x - nodeW / 2} y={pos.y} width={nodeW} height={nodeH}
                rx="8" fill={color} opacity={isHovered ? 1 : 0.9}
                stroke={isHovered ? "#fff" : "none"} strokeWidth={isHovered ? 2 : 0}
              />
            ) : (
              <rect x={pos.x - nodeW / 2} y={pos.y} width={nodeW} height={nodeH}
                rx="8" fill={isHovered ? `${color}20` : "transparent"} stroke={color}
                strokeWidth={isHovered ? 2.5 : 2} opacity={isHovered ? 0.9 : 0.5}
              />
            )}
            <text x={pos.x} y={pos.y + nodeH / 2 + 1} textAnchor="middle" dominantBaseline="middle"
              fontSize={isProduct ? "11" : "10"} fontWeight={isProduct ? "700" : "500"}
              fill={isProduct ? "#fff" : color}
              fontFamily="'DM Mono', monospace"
              style={{ pointerEvents: "none" }}
            >
              {n.text}
            </text>
            {n.tip && (
              <circle cx={pos.x + nodeW/2 - 8} cy={pos.y + 8} r={4}
                fill={isProduct ? "rgba(255,255,255,0.4)" : `${color}60`}
                style={{ pointerEvents: "none" }}
              />
            )}
          </g>
        );
      })}
      {hoveredFlow && hoveredPos && hoveredFlow.tip && (() => {
        const { tx, ty, h, maxW } = getTipPos(hoveredPos, hoveredFlow.tip);
        return (
          <foreignObject x={tx} y={ty} width={maxW} height={h + 8} style={{ pointerEvents: "none", overflow: "visible" }}>
            <div style={{
              background: "rgba(0,0,0,0.92)",
              color: "#e8eaed",
              borderRadius: 8,
              padding: "10px",
              fontSize: 11.5,
              lineHeight: "1.4",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              {hoveredFlow.tip}
            </div>
          </foreignObject>
        );
      })()}
    </svg>
  );
}

