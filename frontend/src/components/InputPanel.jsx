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

export default function InputPanel({ setResult, setLoading, loading }) {
  const [mode, setMode] = useState("transcript");
  const [transcript, setTranscript] = useState("");
  const [title, setTitle] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [status, setStatus] = useState("");
  const fileRef = useRef();

  async function handleSubmit() {
    setLoading(true);
    setStatus("");
    try {
      let text = transcript;

      if (mode === "audio" && audioFile) {
        setStatus("Transcribing audio with Whisper...");
        const res = await transcribeAudio(audioFile);
        text = res.transcript;
        setStatus("Extracting tasks and analysing commitments...");
      } else {
        setStatus("Extracting tasks and analysing commitments...");
      }

      const result = await processTranscript(text, title || "Team Standup");
      setResult(result);
    } catch (err) {
      setStatus("Error: " + (err.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Process a meeting</h1>
        <p style={{ color: "var(--text-2)", fontSize: 14 }}>
          Upload audio or paste a transcript — we'll extract tasks, flag repeat issues, and draft follow-ups.
        </p>
      </div>

      {/* Meeting title */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>Meeting title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Weekly product standup"
          style={{ width: "100%", padding: "9px 12px", borderRadius: "var(--radius)", border: "0.5px solid var(--border-md)", background: "var(--surface)", fontSize: 14, color: "var(--text)" }}
        />
      </div>

      {/* Mode tabs */}
      <div className="tabs">
        <button className={`tab ${mode === "transcript" ? "active" : ""}`} onClick={() => setMode("transcript")}>Paste transcript</button>
        <button className={`tab ${mode === "audio" ? "active" : ""}`} onClick={() => setMode("audio")}>Upload audio</button>
      </div>

      {mode === "transcript" ? (
        <div style={{ marginBottom: 16 }}>
          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here..."
            rows={12}
            style={{ width: "100%", padding: "12px", borderRadius: "var(--radius)", border: "0.5px solid var(--border-md)", fontSize: 13, fontFamily: "inherit", resize: "vertical", background: "var(--surface)", color: "var(--text)" }}
          />
          <button
            style={{ fontSize: 12, color: "var(--text-3)", background: "none", border: "none", marginTop: 4, padding: 0 }}
            onClick={() => setTranscript(DEMO_TRANSCRIPT)}
          >
            Load demo transcript ↗
          </button>
        </div>
      ) : (
        <div
          style={{ border: "0.5px dashed var(--border-md)", borderRadius: "var(--radius-lg)", padding: 32, textAlign: "center", marginBottom: 16, cursor: "pointer", background: audioFile ? "var(--teal-bg)" : "var(--surface)" }}
          onClick={() => fileRef.current.click()}
        >
          <input ref={fileRef} type="file" accept=".mp3,.wav,.m4a,.mp4,.webm" style={{ display: "none" }} onChange={e => setAudioFile(e.target.files[0])} />
          {audioFile ? (
            <p style={{ color: "var(--teal-text)", fontWeight: 500 }}>{audioFile.name}</p>
          ) : (
            <>
              <p style={{ fontWeight: 500, marginBottom: 4 }}>Click to upload audio</p>
              <p style={{ fontSize: 12, color: "var(--text-3)" }}>MP3, WAV, M4A, MP4, WEBM</p>
            </>
          )}
        </div>
      )}

      {status && (
        <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <div className="spinner" style={{ borderColor: "rgba(0,0,0,0.15)", borderTopColor: "var(--text-2)" }} />
          {status}
        </div>
      )}

      <button
        className="btn-primary"
        style={{ width: "100%", padding: "12px" }}
        disabled={loading || (mode === "transcript" ? !transcript.trim() : !audioFile)}
        onClick={handleSubmit}
      >
        {loading ? <span className="spinner" /> : "Process meeting →"}
      </button>
    </div>
  );
}
