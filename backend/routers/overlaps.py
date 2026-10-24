import asyncio
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from agents.graph_orchestrator import create_war_room

router = APIRouter(prefix="/api/v1/overlaps", tags=["overlaps"])

@router.get("/{institution_id}/war-room")
def war_room(institution_id: str):
    return create_war_room(institution_id)

@router.get("/{institution_id}/stream")
async def war_room_stream(institution_id: str):
    async def war_room_event_generator():
        data = create_war_room(institution_id)
        events = [
            {"source": data.get("suggested_lead_bureau", "RB"), "text": "Issued show-cause notice on 12 Mar for infra non-compliance.", "ts": "12 Mar"},
            {"source": "PGRC", "text": "Received grievance on 14 Mar regarding same infra issue — duplicate scope detected.", "ts": "14 Mar"},
            {"source": "AI_MEDIATOR", "text": f"Recommending PGRC defer action; {data.get('suggested_lead_bureau', 'RB')} notice already covers scope. Confidence: 0.94", "ts": "Now"},
            {"source": "AI_MEDIATOR", "text": "Joint docket hearing scheduled to eliminate conflicting orders.", "ts": "Just now"},
        ]
        idx = 0
        while True:
            yield f"data: {json.dumps(events[idx % len(events)])}\n\n"
            idx += 1
            await asyncio.sleep(2.0)

    return StreamingResponse(
        war_room_event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"}
    )
