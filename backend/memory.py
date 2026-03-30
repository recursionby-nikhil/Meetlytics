import json, os
from datetime import datetime

MEMORY_FILE = "meeting_memory.json"


def load_memory() -> dict:
    if not os.path.exists(MEMORY_FILE):
        return {"meetings": [], "task_history": {}}
    with open(MEMORY_FILE, "r") as f:
        return json.load(f)


def save_memory(meeting_title, tasks: list, memory: dict, reset=False):
    if reset:
        data = {"meetings": [], "task_history": {}}
        with open(MEMORY_FILE, "w") as f:
            json.dump(data, f, indent=2)
        return

    if not memory:
        memory = {"meetings": [], "task_history": {}}

    meeting_record = {
        "title": meeting_title,
        "date": datetime.now().isoformat(),
        "tasks": tasks,
    }
    memory["meetings"].append(meeting_record)

    # Update task_history keyed by "owner:keyword"
    for task in tasks:
        owner = task.get("owner", "unknown").lower()
        for keyword in task.get("keywords", []):
            key = f"{owner}:{keyword.lower()}"
            if key not in memory["task_history"]:
                memory["task_history"][key] = []
            memory["task_history"][key].append({
                "meeting": meeting_title,
                "date": datetime.now().isoformat(),
                "task": task.get("task"),
                "status": task.get("status", "pending"),
            })

    with open(MEMORY_FILE, "w") as f:
        json.dump(memory, f, indent=2)


def detect_flags(tasks: list, memory: dict) -> list:
    """
    Cross-reference each task against memory.
    If same owner + similar keyword appeared in past meetings → flag it.
    """
    task_history = memory.get("task_history", {})
    flagged_tasks = []

    for task in tasks:
        owner = task.get("owner", "unknown").lower()
        keywords = [k.lower() for k in task.get("keywords", [])]
        flag_count = 0
        flag_meetings = []

        for keyword in keywords:
            key = f"{owner}:{keyword}"
            if key in task_history:
                past = task_history[key]
                flag_count = max(flag_count, len(past))
                flag_meetings = [p["meeting"] for p in past]

        task["flag_count"] = flag_count
        task["flag_meetings"] = flag_meetings
        task["is_flagged"] = flag_count >= 1
        flagged_tasks.append(task)

    return flagged_tasks
