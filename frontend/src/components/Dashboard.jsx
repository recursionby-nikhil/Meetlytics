import { useState } from "react";
import TaskList from "./TaskList";
import CommitmentRadar from "./CommitmentRadar";
import FollowUps from "./FollowUps";

export default function Dashboard({ result, setResult }) {
  const [tab, setTab] = useState("tasks");

  const flagged    = result.tasks.filter(t => t.is_flagged).length;
  const lowConf    = result.tasks.filter(t => t.confidence === "low").length;
  const followUps  = result.follow_ups.filter(f => f.tone !== "friendly").length;

  const providerColor = {
    mock:   "#6B7280",
    groq:   "#F97316",
    gemini: "#3B82F6",
    openai: "#10B981",
    nvidia: "#76B900",
  }[result.provider] || "#6B7280";

  return (
    <div className="fade-up">

      {/* Summary card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              Meeting summary
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>{result.meeting_title}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: providerColor }} />
            <span style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {result.provider}
            </span>
          </div>
        </div>

        <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 20 }}>
          {result.summary}
        </p>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <StatCard label="Tasks extracted" value={result.tasks.length} color="var(--brand)" />
          <StatCard label="Commitment flags" value={flagged} color={flagged > 0 ? "var(--red)" : "var(--green)"} />
          <StatCard label="Follow-ups needed" value={followUps} color={followUps > 0 ? "var(--amber)" : "var(--green)"} />
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === "tasks" ? "active" : ""}`} onClick={() => setTab("tasks")}>
          Action items ({result.tasks.length})
        </button>
        <button className={`tab ${tab === "radar" ? "active" : ""}`} onClick={() => setTab("radar")}>
          Commitment radar {flagged > 0 && <span className="badge badge-red" style={{ marginLeft: 6, fontSize: 10 }}>{flagged}</span>}
        </button>
        <button className={`tab ${tab === "followups" ? "active" : ""}`} onClick={() => setTab("followups")}>
          Follow-ups ({result.follow_ups.length})
        </button>
      </div>

      <div className="fade-in" key={tab}>
        {tab === "tasks"     && <TaskList tasks={result.tasks} />}
        {tab === "radar"     && <CommitmentRadar tasks={result.tasks} />}
        {tab === "followups" && <FollowUps followUps={result.follow_ups} />}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "var(--bg-2)", borderRadius: 12,
      padding: "14px 18px",
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "sans-serif", color, letterSpacing: "-0.03em" }}>
        {value}
      </div>
    </div>
  );
}
