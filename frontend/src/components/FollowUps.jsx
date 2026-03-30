import { useState } from "react";

const TONE_CONFIG = {
  escalated:  { label: "Escalated",   color: "var(--red)",    bg: "var(--red-bg)",    textColor: "var(--red-text)"    },
  direct:     { label: "Direct",      color: "var(--amber)",  bg: "var(--amber-bg)",  textColor: "var(--amber-text)"  },
  clarifying: { label: "Clarifying",  color: "var(--purple)", bg: "var(--purple-bg)", textColor: "var(--purple-text)" },
  nudge:      { label: "Nudge",       color: "var(--teal)",   bg: "var(--teal-bg)",   textColor: "var(--teal-text)"   },
  friendly:   { label: "Friendly",    color: "var(--green)",  bg: "var(--green-bg)",  textColor: "var(--green-text)"  },
};

export default function FollowUps({ followUps }) {
  const [copied, setCopied] = useState(null);

  function copy(id, text) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const sorted = [...followUps].sort((a, b) => {
    const order = { escalated: 0, direct: 1, clarifying: 2, nudge: 3, friendly: 4 };
    return (order[a.tone] ?? 5) - (order[b.tone] ?? 5);
  });

  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 12 }}>
        Messages are tone-adapted based on commitment history and confidence level.
      </div>
      {sorted.map((fu, i) => {
        const conf = TONE_CONFIG[fu.tone] || TONE_CONFIG.friendly;
        return (
          <div key={i} className="card" style={{ marginBottom: 12, borderLeft: `3px solid ${conf.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 500 }}>To: {fu.owner}</span>
                <span className="badge" style={{ background: conf.bg, color: conf.textColor }}>{conf.label}</span>
              </div>
              <button
                className="btn-ghost"
                style={{ fontSize: 12, padding: "4px 12px" }}
                onClick={() => copy(i, fu.message)}
              >
                {copied === i ? "Copied!" : "Copy"}
              </button>
            </div>
            <div style={{ fontSize: 13, color: "var(--text)", background: "var(--bg)", borderRadius: "var(--radius)", padding: "10px 14px", lineHeight: 1.7 }}>
              {fu.message}
            </div>
          </div>
        );
      })}
    </div>
  );
}
