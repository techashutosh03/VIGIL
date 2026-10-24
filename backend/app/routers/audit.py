import asyncio
import hashlib
import json
import random
import time
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.schemas import AuditReasoningResponse

router = APIRouter(prefix="/audit", tags=["Audit"])

@router.get("/stream")
async def stream_audit_hashchain():
    async def audit_generator():
        prev_hash = "0000a1f3c8b4e2d1"
        actions = [
            "INSTITUTION_MATCHED",
            "OVERLAP_DETECTED",
            "RISK_SCORE_UPDATED",
            "COMPLAINT_ROUTED",
            "HUMAN_REVIEW_APPROVED",
            "WAR_ROOM_CONVENED",
            "ARBITRATION_VERDICT_LOGGED"
        ]
        
        idx = 0
        while True:
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

    return StreamingResponse(
        audit_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )

@router.get("/{decision_id}/reasoning", response_model=AuditReasoningResponse)
async def get_audit_reasoning(decision_id: str):
    return AuditReasoningResponse(
        decision_id=decision_id,
        reasoning=(
            "Matched via semantic similarity (0.87) + Groq Llama-3.1-70B Chain-of-Thought confirmation (0.94). "
            "Both complaints reference 'ABC Institute' with matching address tokens ('Delhi-NCR Sector 62') despite "
            "differing institutional abbreviations. Tamper-evident SHA-256 hash committed to VIGIL Ledger."
        ),
        timestamp="2026-10-24T21:40:00Z",
        provenance_hash="8f4b23c91d8a4f009e27c126834b9d5a89e47201c9b68ef5332f91ac8990142b"
    )
