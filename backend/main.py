from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json, os, tempfile, re
from memory import load_memory, save_memory, detect_flags

# ─── AI Provider setup ────────────────────────────────────────────────────────
# Set AI_PROVIDER=mock   → no API key needed, instant fake data (for testing)
# Set AI_PROVIDER=gemini → uses GEMINI_API_KEY
# Set AI_PROVIDER=openai → uses OPENAI_API_KEY

AI_PROVIDER = os.getenv("AI_PROVIDER", "mock").lower()

if AI_PROVIDER == "openai":
    from openai import OpenAI
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    print("✅ Using OpenAI (GPT-4o + Whisper)")
elif AI_PROVIDER == "gemini":
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    gemini_model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-2.0-flash"))
    print(f"✅ Using Gemini ({os.getenv('GEMINI_MODEL', 'gemini-2.0-flash')})")
else:
    print("✅ Using MOCK mode — no API key needed")

app = FastAPI(title="MeetingMOM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ───────────────────────────────────────────────────────────────────

class TranscriptInput(BaseModel):
    text: str
    meeting_title: Optional[str] = "Untitled Meeting"

class ProcessResponse(BaseModel):
    meeting_title: str
    transcript: str
    tasks: list
    summary: str
    follow_ups: list
    provider: str


# ─── Extraction prompt ────────────────────────────────────────────────────────

EXTRACTION_PROMPT = """
You are an expert meeting analyst. Analyze the meeting transcript below and extract structured data.

Return ONLY valid JSON — no markdown, no explanation, just raw JSON.

Extract the following:

{
  "summary": "2-3 sentence summary of what was discussed and decided",
  "tasks": [
    {
      "id": "unique short id like task_001",
      "task": "clear description of what needs to be done",
      "owner": "First name only of the person responsible",
      "deadline": "specific date or relative like 'this Friday', 'next Monday', or 'not specified'",
      "confidence": "high | medium | low",
      "confidence_reason": "why you rated confidence this way",
      "keywords": ["2-3 keywords that identify this task for memory matching"]
    }
  ]
}

Confidence levels:
- high: person clearly agreed, deadline given, enthusiastic or direct
- medium: person agreed but vague on timing or details
- low: person was hesitant, non-committal, or deadline was pushed back

Transcript:
"""


# ─── Mock data ────────────────────────────────────────────────────────────────

MOCK_RESPONSE = {
    "summary": "Team reviewed the payments API blocker, design mockups, vendor contract, and unit tests. Ravi has repeatedly missed the API deadline. Meera forgot the vendor contract again. Sam and Priya have high-confidence commitments.",
    "tasks": [
        {
            "id": "task_001",
            "task": "Finish API integration for payments module",
            "owner": "Ravi",
            "deadline": "this Friday",
            "confidence": "low",
            "confidence_reason": "Vague commitment, mentioned issues again, no clear plan shared",
            "keywords": ["api", "payments", "integration"]
        },
        {
            "id": "task_002",
            "task": "Update design mockups with new branding",
            "owner": "Sam",
            "deadline": "next Monday",
            "confidence": "high",
            "confidence_reason": "Owner confirmed enthusiastically, 70% already done",
            "keywords": ["design", "mockups", "branding"]
        },
        {
            "id": "task_003",
            "task": "Send vendor contract to legal team",
            "owner": "Meera",
            "deadline": "today",
            "confidence": "low",
            "confidence_reason": "Forgot to do it last week, vague promise again",
            "keywords": ["vendor", "contract", "legal"]
        },
        {
            "id": "task_004",
            "task": "Write unit tests for the auth flow",
            "owner": "Priya",
            "deadline": "this Wednesday",
            "confidence": "high",
            "confidence_reason": "Clear deadline given, owner confirmed directly",
            "keywords": ["tests", "auth", "unit"]
        }
    ]
}


# ─── Unified AI call ──────────────────────────────────────────────────────────

def call_ai(transcript_text: str) -> dict:
    """Call configured provider. Returns parsed dict."""

    if AI_PROVIDER == "mock":
        return MOCK_RESPONSE

    prompt = EXTRACTION_PROMPT + transcript_text

    if AI_PROVIDER == "openai":
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a precise meeting analyst. Return only valid JSON."},
                {"role": "user",   "content": prompt}
            ],
            temperature=0.2,
        )
        raw = response.choices[0].message.content.strip()

    elif AI_PROVIDER == "gemini":
        response = gemini_model.generate_content(
            f"You are a precise meeting analyst. Return only valid JSON.\n\n{prompt}"
        )
        raw = response.text.strip()

    else:
        return MOCK_RESPONSE

    # Strip markdown fences
    raw = re.sub(r"^```(?:json)?\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)
    return json.loads(raw)


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"status": "MeetingMOM running", "provider": AI_PROVIDER}


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Audio → transcript via Whisper (OpenAI only)."""
    if AI_PROVIDER != "openai":
        raise HTTPException(
            status_code=400,
            detail="Audio transcription requires OpenAI. Set AI_PROVIDER=openai in .env."
        )
    if not file.filename.endswith((".mp3", ".mp4", ".wav", ".m4a", ".webm")):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as audio_file:
            result = openai_client.audio.transcriptions.create(
                model="whisper-1", file=audio_file
            )
        return {"transcript": result.text}
    finally:
        os.unlink(tmp_path)


@app.post("/process", response_model=ProcessResponse)
async def process_transcript(data: TranscriptInput):
    """Transcript → tasks + flags + follow-ups."""
    try:
        extracted = call_ai(data.text)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI call failed: {str(e)}")

    tasks   = extracted.get("tasks", [])
    summary = extracted.get("summary", "")

    memory = load_memory()
    tasks_with_flags = detect_flags(tasks, memory)
    save_memory(data.meeting_title, tasks_with_flags, memory)
    follow_ups = generate_follow_ups(tasks_with_flags)

    return {
        "meeting_title": data.meeting_title,
        "transcript":    data.text,
        "tasks":         tasks_with_flags,
        "summary":       summary,
        "follow_ups":    follow_ups,
        "provider":      AI_PROVIDER,
    }


@app.get("/memory")
async def get_memory():
    return load_memory()


@app.delete("/memory")
async def clear_memory():
    save_memory(None, [], {}, reset=True)
    return {"status": "cleared"}


# ─── Follow-up generation ─────────────────────────────────────────────────────

def generate_follow_ups(tasks: list) -> list:
    follow_ups = []
    for task in tasks:
        flag_count = task.get("flag_count", 0)
        confidence = task.get("confidence", "medium")
        owner      = task.get("owner", "Team")
        task_desc  = task.get("task", "")
        deadline   = task.get("deadline", "soon")

        if flag_count >= 2:
            tone = "escalated"
            message = (
                f"Hey {owner} — this task has come up in {flag_count + 1} meetings now: "
                f'"{task_desc}". We really need to close this out by {deadline}. '
                f"Can you share a status update so we can unblock the team?"
            )
        elif flag_count == 1:
            tone = "direct"
            message = (
                f"Hi {owner}, just following up — \"{task_desc}\" was discussed last meeting too. "
                f"Deadline is {deadline}. Let us know if you're blocked on anything."
            )
        elif confidence == "low":
            tone = "clarifying"
            message = (
                f"Hi {owner}, I noticed the commitment on \"{task_desc}\" was a bit unclear in the meeting. "
                f"Can you confirm you're owning this and share your expected completion date?"
            )
        elif confidence == "medium":
            tone = "nudge"
            message = (
                f"Hey {owner}! Quick reminder — \"{task_desc}\" is due {deadline}. "
                f"Let me know if you need any help or context."
            )
        else:
            tone = "friendly"
            message = (
                f"Hi {owner}, you're all set on \"{task_desc}\" by {deadline}. "
                f"Ping the team if you hit any blockers!"
            )

        follow_ups.append({
            "owner":   owner,
            "task_id": task.get("id"),
            "tone":    tone,
            "message": message,
        })

    return follow_ups
