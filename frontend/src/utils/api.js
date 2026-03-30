const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function transcribeAudio(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/transcribe`, { method: "POST", body: form });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function processTranscript(text, meetingTitle = "Untitled") {
  const res = await fetch(`${BASE}/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, meeting_title: meetingTitle }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getMemory() {
  const res = await fetch(`${BASE}/memory`);
  return res.json();
}

export async function clearMemory() {
  const res = await fetch(`${BASE}/memory`, { method: "DELETE" });
  return res.json();
}
