export default function CommitmentRadar({ tasks }) {
  const flagged = tasks.filter(t => t.is_flagged);
  const clean   = tasks.filter(t => !t.is_flagged);

  if (flagged.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>All clear</h3>
        <p style={{ color: "var(--text-3)", fontSize: 14 }}>
          No repeat commitment failures detected. Process more meetings to build history.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 14 }}>
        {flagged.length} task{flagged.length > 1 ? "s" : ""} flagged based on commitment history across meetings.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {flagged.map((task, i) => (
          <RadarCard key={task.id} task={task} index={i} />
        ))}
      </div>

      {clean.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Fresh commitments — no history
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {clean.map(task => (
              <div key={task.id} className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{task.task}</span>
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>{task.owner}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RadarCard({ task, index }) {
  const high   = task.flag_count >= 2;
  const border = high ? "var(--red)" : "var(--amber)";
  const times  = task.flag_count + 1;

  return (
    <div
      className="card"
      style={{
        borderLeft: `3px solid ${border}`,
        animation: `fadeUp 0.35s ease ${index * 0.08}s both`,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 15, flex: 1, paddingRight: 12 }}>{task.task}</div>
        <div style={{
          padding: "4px 10px", borderRadius: 99,
          background: high ? "var(--red-bg)" : "var(--amber-bg)",
          color: high ? "var(--red-text)" : "var(--amber-text)",
          fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
        }}>
          Seen {times}×
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-2)", marginBottom: 10 }}>
        <span>👤 {task.owner}</span>
        <span>📅 {task.deadline}</span>
      </div>

      {/* History */}
      {task.flag_meetings?.length > 0 && (
        <div style={{
          background: "var(--bg-2)", borderRadius: 8,
          padding: "8px 12px", fontSize: 12, color: "var(--text-3)",
          marginBottom: 10,
        }}>
          Previously raised in: <span style={{ color: "var(--text-2)", fontWeight: 500 }}>
            {task.flag_meetings.join(", ")}
          </span>
        </div>
      )}

      {/* Risk banner */}
      <div style={{
        borderRadius: 8, padding: "8px 12px",
        background: high ? "var(--red-bg)" : "var(--amber-bg)",
        color: high ? "var(--red-text)" : "var(--amber-text)",
        fontSize: 12, fontWeight: 600,
      }}>
        {high
          ? "🔴 High risk — escalated follow-up has been drafted automatically."
          : "🟡 Moderate risk — direct follow-up has been drafted."}
      </div>
    </div>
  );
}
