import asyncio
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.get("/stream")
async def stream_agent_reasoning():
    async def log_generator():
        logs = [
            {"agent": "IntakeAgent", "message": "Normalized incoming complaint #4821 metadata across bureaus.", "level": "info"},
            {"agent": "DNAEngine", "message": "Exact ID lookup negative. RapidFuzz score 88.2 → candidate found.", "level": "info"},
            {"agent": "DNAEngine", "message": "SentenceTransformer 384-dim similarity 0.87 — entering ambiguous arbitration zone.", "level": "warn"},
            {"agent": "LLMJudge", "message": "Groq Llama-3.1-70B evaluated address tokens. Same institution confirmed (confidence 0.94).", "level": "decision"},
            {"agent": "Orchestrator", "message": "Auto-linked to Permanent ID 1-9820341. Forwarded to Overlap Graph.", "level": "decision"},
            {"agent": "RiskModel", "message": "Institution Risk score updated to 82/100 (HIGH RISK). Triggered War Room alert.", "level": "warn"},
            {"agent": "AuditAgent", "message": "Committed SHA-256 state transition to tamper-evident audit ledger.", "level": "info"},
        ]
        
        idx = 0
        while True:
            log = logs[idx % len(logs)]
            yield f"data: {json.dumps(log)}\n\n"
            idx += 1
            await asyncio.sleep(1.8)

    return StreamingResponse(
        log_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
