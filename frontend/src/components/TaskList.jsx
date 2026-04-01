import { useState } from "react";

const CONF = {
  high:   { label: "High",   cls: "badge-green" },
  medium: { label: "Medium", cls: "badge-amber" },
  low:    { label: "Low",    cls: "badge-red"   },
};

const AVATAR_COLORS = [
  { bg: "#EDE9FE", text: "#5B21B6" },
  { bg: "#ECFDF5", text: "#065F46" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#FEE2E2", text: "#991B1B" },
  { bg: "#E0F2FE", text: "#075985" },
  { bg: "#FCE7F3", text: "#9D174D" },
];

const avatarColor = name =>
  AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

export default function TaskList({ tasks }) {
  const [done, setDone] = useState(new Set());

  if (!tasks.length)
    return <p style={{ color: "var(--text-3)", textAlign: "center", padding: 40 }}>No tasks extracted.</p>;

  const toggleDone = id =>
    setDone(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const active    = tasks.filter(t => !done.has(t.id));
  const completed = tasks.filter(t => done.has(t.id));

  return (
    <div>
      {/* Active tasks */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {active.map((task, i) => (
          <TaskCard
            key={task.id} task={task} index={i}
            isDone={false} onToggle={() => toggleDone(task.id)}
          />
        ))}
      </div>

      {/* Completed section */}
      {completed.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Completed ({completed.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {completed.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} isDone onToggle={() => toggleDone(task.id)} />
            ))}
          </div>
        </div>
      )}

      {/* All done state */}
      {active.length === 0 && completed.length > 0 && (
        <div style={{ textAlign: "center", padding: "20px 0 4px" }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>🎉</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--green)" }}>All tasks completed!</div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, index, isDone, onToggle }) {
  const conf  = CONF[task.confidence] || CONF.medium;
  const color = avatarColor(task.owner);

  return (
    <div
      className="card"
      style={{
        padding: "14px 18px",
        borderLeft: task.is_flagged && !isDone ? "3px solid var(--red)" : "3px solid transparent",
        opacity: isDone ? 0.55 : 1,
        transition: "opacity 0.3s ease",
        animation: `fadeUp 0.35s ease ${index * 0.06}s both`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>

        {/* Done checkbox */}
        <button
          onClick={onToggle}
          style={{
            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
            border: `2px solid ${isDone ? "var(--green)" : "var(--border-md)"}`,
            background: isDone ? "var(--green)" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginTop: 2, cursor: "pointer", transition: "all 0.2s",
          }}
        >
          {isDone && (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none" style={{ animation: "checkPop 0.2s ease" }}>
              <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: color.bg, color: color.text,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 11,
        }}>
          {task.owner?.slice(0, 2).toUpperCase() || "??"}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600, fontSize: 14, marginBottom: 5,
            textDecoration: isDone ? "line-through" : "none",
            color: isDone ? "var(--text-3)" : "var(--text)",
          }}>
            {task.task}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>{task.owner}</span>
            <span style={{ color: "var(--border-md)" }}>·</span>
            <span style={{ fontSize: 12, color: "var(--text-2)" }}>📅 {task.deadline}</span>
            <span className={`badge ${conf.cls}`}>{conf.label} confidence</span>
            {task.is_flagged && !isDone && (
              <span className="badge badge-red">🚩 {task.flag_count + 1}× flagged</span>
            )}
          </div>

          {task.confidence_reason && !isDone && (
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 5, fontStyle: "italic" }}>
              "{task.confidence_reason}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
