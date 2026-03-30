# MeetingMOM — Meeting Outcome Manager

> "It remembers. Basic tools don't."

AI-powered system that converts meeting transcripts into structured tasks, flags repeat missed commitments, and drafts adaptive follow-up messages.

---

## Project Structure

```
meetingmom/
├── backend/
│   ├── main.py          # FastAPI app — transcription + extraction + follow-ups
│   ├── memory.py        # Commitment memory + repeat-miss detection
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── InputPanel.jsx     # Dual input: audio upload + transcript paste
    │   │   ├── Dashboard.jsx      # Tabbed result view
    │   │   ├── TaskList.jsx       # Extracted tasks with confidence + flags
    │   │   ├── CommitmentRadar.jsx # Repeat-miss detector (the wow feature)
    │   │   └── FollowUps.jsx      # Tone-adaptive follow-up drafts
    │   └── utils/api.js
    └── package.json
```

---

## Setup & Run

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set your OpenAI API key
cp .env.example .env
# Edit .env and add your key: OPENAI_API_KEY=sk-...

# Run the server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

---

## How it works

1. **Input** — paste a transcript or upload audio (MP3/WAV/M4A)
2. **Whisper** — audio is transcribed via OpenAI Whisper API
3. **GPT-4o** — extracts tasks, owners, deadlines, and confidence levels
4. **Memory engine** — cross-references past meetings to flag repeated tasks
5. **Follow-up agent** — generates tone-adapted messages (friendly → escalated)

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/transcribe` | Upload audio → returns transcript text |
| POST | `/process` | Transcript text → tasks + flags + follow-ups |
| GET | `/memory` | View all stored meeting history |
| DELETE | `/memory` | Reset memory (demo reset) |

---

## Demo tip

For a reliable hackathon demo:
- Use the built-in "Load demo transcript" button in the UI
- Process the same meeting twice to trigger commitment flags
- Show the Commitment Radar tab — that's your wow moment
