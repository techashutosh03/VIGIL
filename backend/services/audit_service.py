import hashlib
import json
from datetime import datetime
from core.database import supabase

_IN_MEMORY_AUDIT_LOGS = []

def _hash_entry(action: str, actor: str, payload: dict, prev_hash: str, ts: str | None = None) -> str:
    raw = json.dumps({
        "action": action,
        "actor": actor,
        "payload": payload,
        "prev_hash": prev_hash or "0" * 64,
        "ts": ts or ""
    }, sort_keys=True)
    return hashlib.sha256(raw.encode()).hexdigest()

def get_last_hash() -> str:
    if supabase is not None:
        try:
            res = supabase.table("audit_logs").select("hash").order("created_at", desc=True).limit(1).execute()
            if res.data:
                return res.data[0]["hash"]
        except Exception:
            pass
    if _IN_MEMORY_AUDIT_LOGS:
        return _IN_MEMORY_AUDIT_LOGS[-1]["hash"]
    return "0" * 64

def write_audit_log(action: str, actor: str, payload: dict, supabase_client=None, supabase=None) -> dict:
    sb = supabase if supabase is not None else (supabase_client or globals().get("supabase"))
    prev_hash = get_last_hash()
    ts = datetime.utcnow().isoformat()
    new_hash = _hash_entry(action, actor, payload, prev_hash, ts=ts)
    entry = {
        "id": f"audit-{int(datetime.utcnow().timestamp() * 1000)}-{len(_IN_MEMORY_AUDIT_LOGS)}",
        "action": action,
        "actor": actor,
        "payload": payload,
        "hash": new_hash,
        "prev_hash": prev_hash,
        "created_at": ts
    }
    _IN_MEMORY_AUDIT_LOGS.append(entry)
    if sb is not None:
        try:
            sb.table("audit_logs").insert(entry).execute()
        except Exception as e:
            print(f"[WARN] Failed to write audit log to Supabase: {e}")
    return entry

def get_in_memory_logs() -> list[dict]:
    return list(_IN_MEMORY_AUDIT_LOGS)

def verify_chain_integrity(entries: list[dict]) -> dict:
    """
    Re-walks an ordered list of audit log entries and recomputes each hash
    from (action, actor, payload, prev_hash, ts) to confirm it matches the
    stored hash, and that prev_hash linkage is unbroken.
    Returns {"valid": bool, "broken_at": id|None, "reason": str|None}
    """
    if not entries:
        return {"valid": True, "broken_at": None, "reason": "No audit entries to verify"}

    prev_hash_expected = None
    for entry in entries:
        if prev_hash_expected is not None and entry.get("prev_hash") != prev_hash_expected:
            return {
                "valid": False,
                "broken_at": entry.get("id"),
                "reason": f"prev_hash link mismatch: expected {prev_hash_expected}, got {entry.get('prev_hash')}"
            }

        recomputed = _hash_entry(
            action=entry["action"],
            actor=entry["actor"],
            payload=entry["payload"],
            prev_hash=entry.get("prev_hash") or "0" * 64,
            ts=entry.get("created_at") or entry.get("ts") or ""
        )
        if recomputed != entry.get("hash"):
            return {
                "valid": False,
                "broken_at": entry.get("id"),
                "reason": "hash does not match payload (tampered)"
            }

        prev_hash_expected = entry["hash"]

    return {"valid": True, "broken_at": None, "reason": None}

