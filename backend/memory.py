import json
import os
from datetime import datetime

MEMORY_FILE = "meeting_memory.json"


# ----------------------------
# LOAD MEMORY
# ----------------------------
def load_memory() -> dict:
    if not os.path.exists(MEMORY_FILE):
        return {"meetings": [], "task_history": {}}

    with open(MEMORY_FILE, "r") as f:
        return json.load(f)


# ----------------------------
# NORMALIZE KEYWORDS (IMPORTANT)
# ----------------------------
def normalize_keywords(keywords: list) -> list:
    normalized = []

    for k in keywords:
        k = k.lower().strip()

        # Smart grouping (prevents mismatch)
        if "api" in k:
            normalized.append("api")
        elif "auth" in k:
            normalized.append("auth")
        elif "design" in k or "branding" in k:
            normalized.append("design")
        elif "test" in k:
            normalized.append("testing")
        elif "contract" in k or "legal" in k:
            normalized.append("legal")
        else:
            normalized.append(k)

    return list(set(normalized))  # remove duplicates


# ----------------------------
# SAVE MEMORY
# ----------------------------
def save_memory(meeting_title, tasks: list, memory: dict, reset=False):

    if reset:
        data = {"meetings": [], "task_history": {}}
        with open(MEMORY_FILE, "w") as f:
            json.dump(data, f, indent=2)
        return

    if not memory:
        memory = {"meetings": [], "task_history": {}}

    # ✅ Ensure unique meeting title
    meeting_title = f"{meeting_title}_{datetime.now().strftime('%H%M%S')}"

    current_time = datetime.now().isoformat()

    meeting_record = {
        "title": meeting_title,
        "date": current_time,
        "tasks": tasks,
    }

    memory["meetings"].append(meeting_record)

    # ✅ Update task_history
    for task in tasks:
        owner = task.get("owner", "unknown").lower()

        raw_keywords = task.get("keywords", ["general"])
        keywords = normalize_keywords(raw_keywords)

        for keyword in keywords:
            key = f"{owner}:{keyword}"

            if key not in memory["task_history"]:
                memory["task_history"][key] = []

            memory["task_history"][key].append({
                "meeting": meeting_title,
                "date": current_time,
                "task": task.get("task"),
                "status": task.get("status", "pending"),
            })

    # Save to file
    with open(MEMORY_FILE, "w") as f:
        json.dump(memory, f, indent=2)


# ----------------------------
# DETECT FLAGS
# ----------------------------
def detect_flags(tasks: list, memory: dict) -> list:
    """
    Flags tasks if similar owner + keyword appeared in past meetings.
    """

    task_history = memory.get("task_history", {})
    flagged_tasks = []

    for task in tasks:
        owner = task.get("owner", "unknown").lower()

        raw_keywords = task.get("keywords", ["general"])
        keywords = normalize_keywords(raw_keywords)

        flag_meetings = set()

        for keyword in keywords:
            key = f"{owner}:{keyword}"

            if key in task_history:
                for past in task_history[key]:
                    flag_meetings.add(past["meeting"])

        flag_meetings = list(flag_meetings)
        flag_count = len(flag_meetings)

        task["flag_count"] = flag_count
        task["flag_meetings"] = flag_meetings
        task["is_flagged"] = flag_count >= 1

        flagged_tasks.append(task)

    return flagged_tasks