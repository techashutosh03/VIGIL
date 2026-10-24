from datetime import datetime, timedelta
from core.database import supabase
from core.config import settings
from services.audit_service import write_audit_log

VALID_TRANSITIONS = {
    "pending": ["under-process", "transferred"],
    "under-process": ["transferred", "escalated", "disposed"],
    "transferred": ["under-process", "escalated"],
    "escalated": ["disposed"],
    "disposed": [],
}

DEFAULT_CASES = [
    {
        "id": "case-rb-101",
        "institution": "ABC Institute of Technology",
        "bureau": "RB",
        "state": "under-process",
        "createdAt": "2026-03-12T10:00:00Z",
        "slaDeadline": "2026-03-15T10:00:00Z",
        "actionHistory": [
            {"action": "Show-cause notice served", "by": "RB Officer", "at": "2026-03-12T10:00:00Z"}
        ]
    },
    {
        "id": "case-pgrc-204",
        "institution": "ABC Institute of Technology",
        "bureau": "PGRC",
        "state": "pending",
        "createdAt": "2026-03-14T11:30:00Z",
        "slaDeadline": "2026-03-17T11:30:00Z",
        "actionHistory": [
            {"action": "Grievance ingested", "by": "Citizen Portal", "at": "2026-03-14T11:30:00Z"}
        ]
    }
]

def get_cases() -> list[dict]:
    if supabase is not None:
        try:
            complaints = supabase.table("complaints").select("*, institutions(name)").execute().data
            if complaints:
                result = []
                for c in complaints:
                    actions = supabase.table("case_actions").select("*").eq("complaint_id", c["id"]).order("created_at").execute().data
                    result.append({
                        "id": c["id"],
                        "institution": c.get("institutions", {}).get("name", "Unknown") if isinstance(c.get("institutions"), dict) else "Unknown",
                        "bureau": c["bureau"],
                        "state": c["state"],
                        "createdAt": c["created_at"],
                        "slaDeadline": c["sla_deadline"],
                        "actionHistory": [{"action": a["action"], "by": a["performed_by"], "at": a["created_at"]} for a in actions],
                    })
                return result
        except Exception:
            pass
    return DEFAULT_CASES

def transition_state(complaint_id: str, new_state: str, performed_by: str) -> dict:
    current = "under-process"
    if supabase is not None:
        try:
            complaint = supabase.table("complaints").select("*").eq("id", complaint_id).single().execute().data
            if complaint:
                current = complaint["state"]
                if new_state not in VALID_TRANSITIONS.get(current, []):
                    raise ValueError(f"Invalid transition {current} -> {new_state}")

                supabase.table("complaints").update({"state": new_state}).eq("id", complaint_id).execute()
                supabase.table("case_actions").insert({
                    "complaint_id": complaint_id,
                    "action": f"State changed: {current} → {new_state}",
                    "performed_by": performed_by,
                }).execute()
        except Exception as e:
            print(f"[WARN] Failed state transition in Supabase: {e}")

    write_audit_log("CASE_STATE_CHANGED", performed_by,
                     {"complaint_id": complaint_id, "from": current, "to": new_state})

    return {"complaint_id": complaint_id, "new_state": new_state}

def check_sla_breaches() -> list[dict]:
    """Run periodically (cron/background task) to auto-escalate breached cases."""
    if supabase is None:
        return []
    try:
        now = datetime.utcnow().isoformat()
        overdue = supabase.table("complaints").select("*") \
            .lt("sla_deadline", now).neq("state", "disposed").neq("state", "escalated").execute().data

        escalated = []
        for c in overdue:
            transition_state(c["id"], "escalated", "WorkflowSLAAgent")
            escalated.append(c["id"])
        return escalated
    except Exception:
        return []
