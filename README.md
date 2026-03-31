# Meetlytics — AI Meeting-to-Action System

> **"It remembers. Basic tools don't."**

Meetlytics is an AI-powered meeting productivity system that converts raw meeting transcripts or audio into structured tasks, tracks commitment history across meetings, and drafts intelligent follow-up messages — automatically.

Most tools stop at transcription. Meetlytics goes from **discussion → tasks → accountability → action.**

---

## What It Does

| Feature | Description |
|---|---|
| **Task extraction** | Pulls action items, owners, and deadlines from any transcript |
| **Confidence scoring** | Rates each commitment as high / medium / low based on tone and certainty |
| **Commitment radar** | Cross-references past meetings to flag repeat missed commitments |
| **Adaptive follow-ups** | Drafts messages in 5 tones — friendly, nudge, clarifying, direct, escalated |
| **Memory engine** | Remembers who committed to what across all previous meetings |

---

## Demo

1. Paste a meeting transcript (or use the built-in demo transcript)
2. Click **Process meeting**
3. See tasks extracted with confidence scores instantly
4. Click **Commitment radar** — see repeat-miss flags with history
5. Click **Follow-ups** — read tone-adapted messages ready to send

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Backend | FastAPI (Python) |
| AI — Extraction | GPT-4o / Gemini / Mock / Nvidia / Groq |
| AI — Transcription | OpenAI Whisper |
| Memory store | JSON (local persistence) |

---

## Project Structure

```
Meetlytics/
├── backend/
│   ├── main.py               # FastAPI app — all routes + AI calls
│   ├── memory.py             # Commitment memory + flag detection
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── main.jsx
    │   ├── components/
    │   │   ├── InputPanel.jsx       # Audio upload + transcript input
    │   │   ├── Dashboard.jsx        # Tabbed results view
    │   │   ├── TaskList.jsx         # Task cards with confidence badges
    │   │   ├── CommitmentRadar.jsx  # Repeat-miss detector
    │   │   └── FollowUps.jsx        # Adaptive follow-up drafts
    │   └── utils/
    │       └── api.js               # All backend API calls
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Setup & Run

### Prerequisites
- Python 3.10+
- Node.js 18+

---

### 1. Clone the repo

```bash
git clone https://github.com/recursionby-nikhil/Meetlytics.git
cd Meetlytics
```

---

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set your preferred provider (see below)
```

#### `.env` configuration

```env
# ── Choose your AI provider ──────────────────────────

# mock(fake) || gemini(paid) || openai(paid) || groq(free) || nvidia(free)
AI_PROVIDER=groq

# nvidia
NVIDIA_API_KEY=nvidia_api_key
NVIDIA_MODEL=z-ai/glm5

# Groq
GROQ_API_KEY=groq_api_key
GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct

# Gemini
GEMINI_API_KEY=gemini_api_key

# OpenAI
OPENAI_API_KEY=openai_api_key
```

| `AI_PROVIDER` value | What happens |
|---|---|
| `mock` | Instant demo data, no API key needed |
| `gemini` | Uses Gemini API (paid tier) |
| `openai` | Uses GPT-4o + Whisper (paid tier) |
| `groq` | Uses meta-llama-4 (free tier) |
| `nvidia` | Uses glm5 (free tier) |

#### Start the backend

```bash
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`  
API docs at: `http://localhost:8000/docs`

---

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Health check + active provider |
| `POST` | `/transcribe` | Upload audio → returns transcript (OpenAI only) |
| `POST` | `/process` | Transcript text → tasks + flags + follow-ups |
| `GET` | `/memory` | View full commitment history |
| `DELETE` | `/memory` | Reset memory (useful for demo resets) |

---

## How the Commitment Radar Works

Every task extracted from a meeting is stored in `meeting_memory.json` keyed by `owner:keyword`. When the same owner appears with a similar task in a future meeting, the system:

1. Increments the flag count
2. Records which meetings the task appeared in
3. Upgrades the follow-up tone automatically — from nudge → direct → escalated

This is the core innovation. It's not just extraction — it's **memory**.

---

## Follow-up Tone Logic

| Condition | Tone | Example |
|---|---|---|
| No history, high confidence | Friendly | "You're all set, ping us if blocked!" |
| Low confidence commitment | Nudge | "Quick heads-up, deadline is Wednesday" |
| Vague or unclear commitment | Clarifying | "Can you confirm you're owning this?" |
| Seen in 1 previous meeting | Direct | "This came up last meeting too, any update?" |
| Seen in 2+ previous meetings | Escalated | "This has come up 3 times now, we need a status update" |

---

## Built For

**Hackatron — AI Meeting-to-Action System Track**

Solving the universal problem: meetings happen, decisions get made, nothing gets done.

---

## License

MIT
