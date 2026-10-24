import asyncio
import json
from datetime import datetime
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/overlaps", tags=["Overlaps"])

@router.get("/{overlap_id}/stream")
async def stream_overlap_events(overlap_id: str):
    async def event_generator():
        events = [
            {"source": "RB", "text": "Issued show-cause notice on 12 Mar for infra non-compliance.", "ts": "12 Mar"},
            {"source": "PGRC", "text": "Received grievance on 14 Mar regarding same infra issue — duplicate scope detected.", "ts": "14 Mar"},
            {"source": "AI_MEDIATOR", "text": "Recommending PGRC defer action; RB notice already covers scope. Confidence: 0.91", "ts": "Now"},
            {"source": "RB", "text": "Regional Officer accepted automated docket consolidation.", "ts": "Just now"},
            {"source": "AI_MEDIATOR", "text": "Single joint hearing scheduled to avoid contradictory orders.", "ts": "Upcoming"},
        ]
        
        idx = 0
        while True:
            event = events[idx % len(events)]
            yield f"data: {json.dumps(event)}\n\n"
            idx += 1
            await asyncio.sleep(2.0)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
