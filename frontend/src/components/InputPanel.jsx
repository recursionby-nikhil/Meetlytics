import { useState, useRef } from "react";
import { processTranscript, transcribeAudio } from "../utils/api";

const DEMO_TRANSCRIPT = `Sarah: Alright team, let's get started. Ravi, where are we on the payments API integration?

Ravi: Uh, yeah, I'm still working on it. There were some issues with the sandbox environment.

Sarah: This is the third week it's come up. We really need this done. Can you commit to Friday?

Ravi: I'll try my best, yeah.

Sarah: Okay. Priya, what about the unit tests for the auth flow?

Priya: I can get those done by Wednesday for sure. I've already started.

Sarah: Perfect. Meera, did you send the vendor contract to legal?

Meera: Oh, I completely forgot. I'll do it today, promise.

Sarah: Meera, we discussed this last week too. Please prioritize it. Sam, design mockups?

Sam: Yes, new branding mockups will be ready by Monday. I'm about 70% done.

Sarah: Great. Everyone please update the project tracker after this call. Let's wrap up.`;

const PROCESSING_STEPS = [
  { label: "Reading transcript",       duration: 600  },
  { label: "Extracting action items",  duration: 900  },
  { label: "Scoring commitments",      duration: 700  },
  { label: "Checking memory & flags",  duration: 800  },
  { label: "Drafting follow-ups",      duration: 500  },
];

export default function InputPanel({ setResult, setLoading, loading }) {
  const [mode, setMode]           = useState("transcript");
  const [transcript, setTranscript] = useState("");
  const [title, setTitle]         = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [step, setStep]           = useState(-1);
  const [error, setError]         = useState("");
  const fileRef = useRef();

  async function handleSubmit() {
    setError("");
    setLoading(true);
    setStep(0);

    try {
      let text = transcript;

      // Animate through steps while waiting for API
      const stepTimer = (i) => setTimeout(() => {
        if (i < PROCESSING_STEPS.length) setStep(i);
      }, PROCESSING_STEPS.slice(0, i).reduce((a, s) => a + s.duration, 0));

      PROCESSING_STEPS.forEach((_, i) => stepTimer(i));

      if (mode === "audio" && audioFile) {
        const res = await transcribeAudio(audioFile);
        text = res.transcript;
      }

      const result = await processTranscript(text, title || "Team Standup");
      setResult(result);
    } catch (err) {
      setError(err.message || "Something went wrong. Check your backend is running.");
      setStep(-1);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <ProcessingScreen step={step} />;

  return (
    <div className="fade-up" style={{ maxWidth: 620, margin: "0 auto" }}>

      {/* Hero text */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 10 }}>
          Turn meetings into<br />
          <span style={{ color: "var(--brand)" }}>action.</span>
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: 16, maxWidth: 420, margin: "0 auto" }}>
          Paste a transcript and get structured tasks, commitment flags, and follow-up messages — instantly.
        </p>
      </div>

      {/* Main card */}
      <div className="card" style={{ padding: 28 }}>

        {/* Meeting title */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Meeting title
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Weekly product standup"
          />
        </div>

        {/* Mode tabs */}
        <div className="tabs" style={{ marginBottom: 18 }}>
          <button className={`tab ${mode === "transcript" ? "active" : ""}`} onClick={() => setMode("transcript")}>
            Paste transcript
          </button>
          <button className={`tab ${mode === "audio" ? "active" : ""}`} onClick={() => setMode("audio")}>
            Upload audio
          </button>
        </div>

        {/* Input area */}
        {mode === "transcript" ? (
          <div style={{ marginBottom: 8 }}>
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="Paste your meeting transcript here..."
              rows={10}
              style={{ resize: "vertical", lineHeight: 1.7, fontSize: 13 }}
            />
            <button
              style={{ fontSize: 12, color: "var(--brand)", background: "none", border: "none", marginTop: 6, padding: 0, fontWeight: 500, cursor: "pointer" }}
              onClick={() => setTranscript(DEMO_TRANSCRIPT)}
            >
              Load demo transcript →
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current.click()}
            style={{
              border: `2px dashed ${audioFile ? "var(--brand)" : "var(--border-md)"}`,
              borderRadius: 'var(--radius)',
              padding: "36px 24px",
              textAlign: "center",
              cursor: "pointer",
              background: audioFile ? "var(--brand-light)" : "var(--bg-2)",
              marginBottom: 8,
              transition: "all 0.2s",
            }}
          >
            <input ref={fileRef} type="file" accept=".mp3,.wav,.m4a,.mp4,.webm" style={{ display: "none" }} onChange={e => setAudioFile(e.target.files[0])} />
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎙️</div>
            {audioFile
              ? <p style={{ fontWeight: 600, color: "var(--brand)" }}>{audioFile.name}</p>
              : <>
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>Click to upload audio</p>
                  <p style={{ fontSize: 12, color: "var(--text-3)" }}>MP3, WAV, M4A, MP4, WEBM</p>
                </>
            }
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "var(--red-bg)", color: "var(--red-text)", borderRadius: 'var(--radius)', padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          className="btn-primary"
          style={{ width: "100%", marginTop: 8 }}
          disabled={loading || (mode === "transcript" ? !transcript.trim() : !audioFile)}
          onClick={handleSubmit}
        >
          Process meeting →
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 28 }}>
        {[
          { num: "4+", label: "AI providers" },
          { num: "5",  label: "tone levels" },
          { num: "∞",  label: "memory" },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: 22, color: "var(--brand)" }}>{s.num}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessingScreen({ step }) {
  return (
    <div className="fade-in" style={{ maxWidth: 480, margin: "60px auto", textAlign: "center" }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: "var(--brand)", margin: "0 auto 28px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28,
        animation: "pulse 1.5s ease infinite",
      }}>⚡</div>

      <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>
        Analysing meeting...
      </h2>
      <p style={{ color: "var(--text-3)", marginBottom: 36, fontSize: 14 }}>
        Extracting tasks, checking commitment history
      </p>

      <div style={{ textAlign: "left" }}>
        {PROCESSING_STEPS.map((s, i) => {
          const done    = i < step;
          const active  = i === step;
          const pending = i > step;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "11px 0",
              borderBottom: i < PROCESSING_STEPS.length - 1 ? "1px solid var(--border)" : "none",
              opacity: pending ? 0.35 : 1,
              transition: "opacity 0.3s ease",
              animation: active ? "slideIn 0.3s ease" : "none",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700,
                background: done ? "var(--green-bg)" : active ? "var(--brand-light)" : "var(--bg-3)",
                color: done ? "var(--green)" : active ? "var(--brand)" : "var(--text-3)",
                transition: "all 0.3s ease",
              }}>
                {done ? "✓" : active ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>◌</span> : i + 1}
              </div>
              <span style={{
                fontSize: 14, fontWeight: active ? 600 : 400,
                color: done ? "var(--text-2)" : active ? "var(--text)" : "var(--text-3)",
                transition: "all 0.3s",
              }}>
                {s.label}
              </span>
              {active && (
                <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
                  {[0,1,2].map(d => (
                    <div key={d} style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: "var(--brand)",
                      animation: `pulse 1s ease ${d * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
