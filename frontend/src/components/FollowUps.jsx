import { useState } from "react";

const TONE = {
  escalated:  { label: "Escalated",  color: "var(--red)",   bg: "var(--red-bg)",   text: "var(--red-text)"   },
  direct:     { label: "Direct",     color: "var(--amber)", bg: "var(--amber-bg)", text: "var(--amber-text)"  },
  clarifying: { label: "Clarifying", color: "var(--brand)", bg: "var(--brand-light)", text: "var(--brand-dark)" },
  nudge:      { label: "Nudge",      color: "var(--teal)",  bg: "var(--teal-bg)",  text: "var(--teal-text)"  },
  friendly:   { label: "Friendly",   color: "var(--green)", bg: "var(--green-bg)", text: "var(--green-text)"  },
};

const TONE_ORDER = { escalated: 0, direct: 1, clarifying: 2, nudge: 3, friendly: 4 };

export default function FollowUps({ followUps }) {
  const [copied, setCopied] = useState(null);

  function copy(id, text) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const sorted = [...followUps].sort((a, b) =>
    (TONE_ORDER[a.tone] ?? 5) - (TONE_ORDER[b.tone] ?? 5)
  );

  return (
    <div>
      {/* Tone legend */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {Object.entries(TONE).map(([key, t]) => (
          <div key={key} style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 99,
            background: t.bg, color: t.text,
            fontSize: 11, fontWeight: 600,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.color }} />
            {t.label}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sorted.map((fu, i) => {
          const t = TONE[fu.tone] || TONE.friendly;
          return (
            <div
              key={i}
              className="card"
              style={{
                borderLeft: `3px solid ${t.color}`,
                animation: `fadeUp 0.35s ease ${i * 0.07}s both`,
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>To: {fu.owner}</span>
                  <span style={{
                    padding: "3px 9px", borderRadius: 99,
                    background: t.bg, color: t.text,
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {t.label}
                  </span>
                </div>
                <button
                  className="btn-ghost"
                  style={{ fontSize: 12, padding: "5px 14px" }}
                  onClick={() => copy(i, fu.message)}
                >
                  {copied === i ? "✓ Copied!" : "Copy"}
                </button>
              </div>

              {/* Message */}
              <div style={{
                fontSize: 13, color: "var(--text-2)",
                background: "var(--bg-2)",
                borderRadius: 8, padding: "12px 14px",
                lineHeight: 1.7,
                fontStyle: "italic",
              }}>
                "{fu.message}"
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
