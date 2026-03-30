export default function CommitmentRadar({ tasks }) {
  const flagged = tasks.filter(t => t.is_flagged);
  const clean = tasks.filter(t => !t.is_flagged);

  return (
    <div>
      {flagged.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "36px 24px" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>No repeat flags detected</div>
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>All commitments appear to be fresh. Check back after more meetings are processed.</div>
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10 }}>
            These tasks have appeared in previous meetings without being completed.
          </div>
          {flagged.map(task => (
            <RadarCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {clean.length > 0 && (
        <div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 8 }}>Fresh commitments — no history</div>
          {clean.map(task => (
            <div key={task.id} className="card" style={{ padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13 }}>{task.task}</span>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>{task.owner}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RadarCard({ task }) {
  const severity = task.flag_count >= 2 ? "high" : "medium";

  return (
    <div className="card" style={{ marginBottom: 12, borderLeft: `3px solid ${severity === "high" ? "var(--red)" : "var(--amber)"}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontWeight: 500, fontSize: 14 }}>{task.task}</div>
        <span className={`badge ${severity === "high" ? "badge-red" : "badge-amber"}`}>
          Seen {task.flag_count + 1}x
        </span>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 10 }}>
        Owner: <strong>{task.owner}</strong> · Due: {task.deadline}
      </div>

      {/* History timeline */}
      {task.flag_meetings?.length > 0 && (
        <div style={{ fontSize: 12, color: "var(--text-3)", background: "var(--bg)", borderRadius: "var(--radius)", padding: "8px 12px" }}>
          Previously raised in: {task.flag_meetings.join(", ")}
        </div>
      )}

      <div style={{ marginTop: 10, fontSize: 12, color: severity === "high" ? "var(--red-text)" : "var(--amber-text)", background: severity === "high" ? "var(--red-bg)" : "var(--amber-bg)", borderRadius: "var(--radius)", padding: "6px 10px" }}>
        {severity === "high"
          ? "High risk — this task has repeatedly slipped. Escalated follow-up has been drafted."
          : "Moderate risk — this task was mentioned before. Direct follow-up has been drafted."}
      </div>
    </div>
  );
}
