import { useState } from "react";
import InputPanel from "./components/InputPanel";
import Dashboard from "./components/Dashboard";
import "./App.css";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">M</span>
          <div>
            <div className="logo-title">MeetingMOM</div>
            <div className="logo-sub">Meeting Outcome Manager</div>
          </div>
        </div>
        {result && (
          <button className="btn-ghost" onClick={() => setResult(null)}>
            ← New meeting
          </button>
        )}
      </header>

      <main className="app-main">
        {!result ? (
          <InputPanel setResult={setResult} setLoading={setLoading} loading={loading} />
        ) : (
          <Dashboard result={result} />
        )}
      </main>
    </div>
  );
}
