const CONFIDENCE_CONFIG = {
  high:   { label: "High confidence",   cls: "badge-green"  },
  medium: { label: "Medium confidence", cls: "badge-amber"  },
  low:    { label: "Low confidence",    cls: "badge-red"    },
};

const OWNER_COLORS = [
  { bg: "#EEEDFE", text: "#3C3489" },
  { bg: "#E1F5EE", text: "#085041" },
  { bg: "#FAEEDA", text: "#412402" },
  { bg: "#FAECE7", text: "#4A1B0C" },
  { bg: "#E6F1FB", text: "#042C53" },
];

const ownerColor = (name) => {
  const idx = (name?.charCodeAt(0) || 0) % OWNER_COLORS.length;
  return OWNER_COLORS[idx];
};

export default function TaskList({ tasks }) {
  if (!tasks.length) return <p style={{ color: "var(--text-3)" }}>No tasks extracted.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {tasks.map((task) => {
        const conf = CONFIDENCE_CONFIG[task.confidence] || CONFIDENCE_CONFIG.medium;
        const color = ownerColor(task.owner);

        return (
          <div key={task.id} className="card" style={{ padding: "14px 18px", borderLeft: task.is_flagged ? "3px solid var(--red)" : "3px solid transparent" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>

              {/* Owner avatar */}
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: color.bg, color: color.text, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 12, flexShrink: 0, marginTop: 2 }}>
                {task.owner?.slice(0, 2).toUpperCase() || "??"}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, marginBottom: 6 }}>{task.task}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--text-2)" }}>{task.owner}</span>
                  <span style={{ color: "var(--text-3)" }}>·</span>
                  <span style={{ fontSize: 12, color: "var(--text-2)" }}>Due: {task.deadline}</span>
                  <span className={`badge ${conf.cls}`}>{conf.label}</span>
                  {task.is_flagged && (
                    <span className="badge badge-red">
                      {task.flag_count + 1}x flagged
                    </span>
                  )}
                </div>
                {task.confidence_reason && (
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 5, fontStyle: "italic" }}>
                    "{task.confidence_reason}"
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
