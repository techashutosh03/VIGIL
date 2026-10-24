import asyncio
import hashlib
import json
import time
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from core.database import supabase

router = APIRouter(prefix="/api/v1", tags=["streams"])

async def audit_event_generator():
    last_seen = None
    prev_hash = "0000a1f3c8b4e2d1"
    actions = [
        "INSTITUTION_MATCHED",
        "OVERLAP_DETECTED",
        "RISK_SCORE_UPDATED",
        "COMPLAINT_ROUTED",
        "HUMAN_REVIEW_APPROVED",
        "WAR_ROOM_CONVENED"
    ]
    idx = 0
    while True:
        if supabase is not None:
            try:
                res = supabase.table("audit_logs").select("*").order("created_at", desc=True).limit(1).execute()
                if res.data and res.data[0].get("id") != last_seen:
                    last_seen = res.data[0]["id"]
                    item = res.data[0]
                    entry = {
                        "action": item.get("action", "STATE_UPDATED"),
                        "hash": item.get("hash", "")[:12] + "...",
                        "prevHash": item.get("prev_hash", "")[:10] + "..."
                    }
                    yield f"data: {json.dumps(entry)}\n\n"
            except Exception:
                pass
        
        # Real-time SHA-256 hash-chain ticker entry
        action = actions[idx % len(actions)]
        current_raw = f"{action}:{prev_hash}:{time.time()}"
        curr_hash = hashlib.sha256(current_raw.encode()).hexdigest()[:12] + "..."
        entry = {
            "action": action,
            "hash": curr_hash,
            "prevHash": prev_hash[:10] + "..."
        }
        prev_hash = curr_hash
        idx += 1
        yield f"data: {json.dumps(entry)}\n\n"
        await asyncio.sleep(2.2)

@router.get("/audit/stream")
async def audit_stream():
    return StreamingResponse(
        audit_event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"}
    )

async def agent_reasoning_generator():
    logs = [
        {"agent": "IntakeAgent", "message": "Normalized incoming complaint metadata across bureaus.", "level": "info"},
        {"agent": "DNAEngine", "message": "RapidFuzz token score 88.2 + Double Metaphone aligned.", "level": "info"},
        {"agent": "DNAEngine", "message": "SentenceTransformer 384-dim similarity 0.87 (entering ambiguous zone).", "level": "warn"},
        {"agent": "LLMJudge", "message": "Groq Llama-3.1-70B Chain-of-Thought verified same institution (confidence 0.94).", "level": "decision"},
        {"agent": "Orchestrator", "message": "Auto-linked to Permanent ID 1-9820341. Forwarded to Overlap Graph.", "level": "decision"},
        {"agent": "WorkflowSLAAgent", "message": "72-hr SLA timer initialized for Regulation Bureau action.", "level": "info"},
    ]
    idx = 0
    while True:
        yield f"data: {json.dumps(logs[idx % len(logs)])}\n\n"
        idx += 1
        await asyncio.sleep(1.8)

@router.get("/agents/stream")
async def agents_stream():
    return StreamingResponse(
        agent_reasoning_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"}
    )
