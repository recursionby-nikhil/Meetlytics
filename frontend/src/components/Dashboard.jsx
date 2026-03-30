import { useState } from "react";
import TaskList from "./TaskList";
import CommitmentRadar from "./CommitmentRadar";
import FollowUps from "./FollowUps";

export default function Dashboard({ result }) {
  const [tab, setTab] = useState("tasks");

  const flaggedCount = result.tasks.filter(t => t.is_flagged).length;
  const followUpCount = result.follow_ups.filter(f => f.tone !== "friendly").length;

  return (
    <div>
      {/* Summary bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>{result.meeting_title}</div>
        <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 16 }}>{result.summary}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          <Stat label="Tasks extracted" value={result.tasks.length} color="var(--purple)" />
          <Stat label="Commitment flags" value={flaggedCount} color={flaggedCount > 0 ? "var(--red)" : "var(--green)"} />
          <Stat label="Follow-ups queued" value={followUpCount} color={followUpCount > 0 ? "var(--amber)" : "var(--green)"} />
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === "tasks" ? "active" : ""}`} onClick={() => setTab("tasks")}>
          Action items ({result.tasks.length})
        </button>
        <button className={`tab ${tab === "radar" ? "active" : ""}`} onClick={() => setTab("radar")}>
          Commitment radar {flaggedCount > 0 && <span className="badge badge-red" style={{ marginLeft: 4 }}>{flaggedCount}</span>}
        </button>
        <button className={`tab ${tab === "followups" ? "active" : ""}`} onClick={() => setTab("followups")}>
          Follow-ups ({result.follow_ups.length})
        </button>
      </div>

      {tab === "tasks" && <TaskList tasks={result.tasks} />}
      {tab === "radar" && <CommitmentRadar tasks={result.tasks} />}
      {tab === "followups" && <FollowUps followUps={result.follow_ups} tasks={result.tasks} />}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ background: "var(--bg)", borderRadius: "var(--radius)", padding: "12px 14px" }}>
      <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color }}>{value}</div>
    </div>
  );
}
