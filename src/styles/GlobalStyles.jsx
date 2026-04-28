export function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

      :root {
        --bg-0: #0a0c10;
        --bg-1: #11151c;
        --bg-2: #181e28;
        --bg-3: #232a36;
        --border: #232a36;
        --border-strong: #2f3848;
        --text-1: #e6edf3;
        --text-2: #9aa4b2;
        --text-3: #6b7280;
        --accent: #4f8cff;
        --shadow-sm: 0 1px 2px rgba(0,0,0,.35);
        --shadow-md: 0 8px 24px rgba(0,0,0,.35);
        --radius-sm: 6px;
        --radius-md: 10px;
        --radius-lg: 14px;
        --bg-primary: var(--bg-0);
        --bg-secondary: var(--bg-1);
        --bg-tertiary: var(--border);
        --text-primary: var(--text-1);
        --text-secondary: var(--text-2);
        color-scheme: dark;
      }

      @media (prefers-color-scheme: light) {
        :root {
          --bg-0: #f7f8fa;
          --bg-1: #ffffff;
          --bg-2: #f1f3f7;
          --bg-3: #e5e8ee;
          --border: #e5e8ee;
          --border-strong: #d4d8e0;
          --text-1: #0f172a;
          --text-2: #475569;
          --text-3: #94a3b8;
          --accent: #2563eb;
          --shadow-sm: 0 1px 2px rgba(15,23,42,.06);
          --shadow-md: 0 12px 32px rgba(15,23,42,.08);
          color-scheme: light;
        }
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { height: 100%; }
      body {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        font-feature-settings: 'cv02', 'cv03', 'cv11', 'ss01';
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background: var(--bg-0);
        color: var(--text-1);
      }

      .mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; }

      a { color: inherit; }

      button { font-family: inherit; }

      input { font-family: inherit; }

      input::placeholder { color: var(--text-3); }
      input:focus-visible { border-color: var(--accent) !important; box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent); }
      button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
      a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px; }

      @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

      ::-webkit-scrollbar { width: 10px; height: 10px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--bg-3); border-radius: 10px; border: 2px solid var(--bg-0); }
      ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }

      .icon-btn {
        display: inline-flex; align-items: center; justify-content: center;
        width: 34px; height: 34px; border-radius: var(--radius-md);
        background: transparent; border: 1px solid var(--border);
        color: var(--text-2); transition: color .15s ease, border-color .15s ease, background .15s ease;
        text-decoration: none;
      }
      .icon-btn:hover { color: var(--text-1); border-color: var(--border-strong); background: var(--bg-1); }

      .pill {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 12px; border-radius: 999px;
        font-size: 12.5px; font-weight: 500; letter-spacing: -0.01em;
        background: var(--bg-1); color: var(--text-2);
        border: 1px solid var(--border);
        cursor: pointer; white-space: nowrap;
        transition: color .15s ease, border-color .15s ease, background .15s ease;
      }
      .pill:hover { color: var(--text-1); border-color: var(--border-strong); }
      .pill[data-active="true"] { color: var(--text-1); background: var(--bg-2); border-color: var(--border-strong); }
      .pill .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

      .card {
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        transition: border-color .15s ease, background .15s ease;
      }
      .card:hover { border-color: var(--border-strong); }

      .surface-input {
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: 9px 14px 9px 36px;
        color: var(--text-1);
        font-size: 13.5px;
        width: 260px;
        outline: none;
        transition: border-color .15s ease, box-shadow .15s ease;
      }

      .eyebrow {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10.5px; font-weight: 500;
        text-transform: uppercase; letter-spacing: 0.1em;
        color: var(--text-3);
      }
    `}</style>
  );
}
