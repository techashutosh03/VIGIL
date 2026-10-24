import hashlib
import json
from datetime import datetime
from core.database import supabase

def _hash_entry(action: str, actor: str, payload: dict, prev_hash: str) -> str:
    raw = json.dumps({
        "action": action, "actor": actor, "payload": payload,
        "prev_hash": prev_hash, "ts": datetime.utcnow().isoformat()
    }, sort_keys=True)
    return hashlib.sha256(raw.encode()).hexdigest()

def get_last_hash() -> str:
    if supabase is None:
        return "0" * 64
    try:
        res = supabase.table("audit_logs").select("hash").order("created_at", desc=True).limit(1).execute()
        if res.data:
            return res.data[0]["hash"]
    except Exception:
        pass
    return "0" * 64

def write_audit_log(action: str, actor: str, payload: dict) -> dict:
    prev_hash = get_last_hash()
    new_hash = _hash_entry(action, actor, payload, prev_hash)
    entry = {
        "action": action, "actor": actor, "payload": payload,
        "hash": new_hash, "prev_hash": prev_hash
    }
    if supabase is not None:
        try:
            supabase.table("audit_logs").insert(entry).execute()
        except Exception as e:
            print(f"[WARN] Failed to write audit log to Supabase: {e}")
    return entry
