export function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&family=DM+Mono:wght@400;500&display=swap');
      :root { --bg-primary: #0d1117; --bg-secondary: #161b22; --bg-tertiary: #21262d; --text-primary: #c9d1d9; --text-secondary: #8b949e; }
      @media (prefers-color-scheme: light) { :root { --bg-primary: #f6f8fa; --bg-secondary: #ffffff; --bg-tertiary: #e8eaed; --text-primary: #1f2328; --text-secondary: #656d76; } }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: var(--bg-tertiary); border-radius: 3px; }
    `}</style>
  );
}

