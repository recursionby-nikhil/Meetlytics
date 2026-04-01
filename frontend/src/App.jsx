import { useState, useEffect } from "react";
import InputPanel from "./components/InputPanel";
import Dashboard from "./components/Dashboard";
import "./index.css";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header
        dark={dark}
        toggleDark={() => setDark(d => !d)}
        hasResult={!!result}
        onBack={() => setResult(null)}
      />
      <main style={{ flex: 1, padding: "40px 24px", maxWidth: 900, margin: "0 auto", width: "100%" }}>
        {!result
          ? <InputPanel setResult={setResult} setLoading={setLoading} loading={loading} />
          : <Dashboard result={result} setResult={setResult} />
        }
      </main>
    </div>
  );
}

function Header({ dark, toggleDark, hasResult, onBack }) {
  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 28px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      position: "sticky", top: 0, zIndex: 100,
      backdropFilter: "blur(12px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "var(--brand)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "sans-serif", fontWeight: 800, fontSize: 16, color: "#fff",
          letterSpacing: "-0.02em",
        }}>M</div>
        <div>
          <div style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", color: "var(--text)" }}>
            Meetlytics
          </div>
          <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: -2 }}>Meeting Outcome Manager</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {hasResult && (
          <button className="btn-ghost" onClick={onBack} style={{ fontSize: 13 }}>
            ← New meeting
          </button>
        )}
        <button
          className="btn-icon"
          onClick={toggleDark}
          title={dark ? "Light mode" : "Dark mode"}
          style={{ fontSize: 15 }}
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}
