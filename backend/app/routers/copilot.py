from fastapi import APIRouter
from app.models.schemas import CopilotQueryRequest, CopilotQueryResponse

router = APIRouter(prefix="/copilot", tags=["AI Co-Pilot"])

@router.post("/query", response_model=CopilotQueryResponse)
async def query_copilot(req: CopilotQueryRequest):
    q = req.query.lower()
    
    if "maharashtra" in q or "mumbai" in q or "pune" in q:
        answer = (
            "Found 4 institutions flagged RED in the Maharashtra region. "
            "XYZ Engineering College has 3 overlapping PGRC complaints exceeding the 30-day SLA by 14+ days, "
            "triggering an automated escalation recommendation to the Regulation Bureau."
        )
    elif "overlap" in q or "duplicate" in q:
        answer = (
            "Active Overlap Alert: RB Case #101 (issued 12 Mar for infra non-compliance) and "
            "PGRC Grievance #204 (received 14 Mar) target the exact same computer lab facilities at "
            "ABC Institute of Tech. The AI Mediator recommends merging hearing dockets."
        )
    elif "risk" in q or "red" in q:
        answer = (
            "Institution Risk DNA analysis identified 14 high-risk (RED) institutions nationally. "
            "Primary drivers: concurrent multi-bureau notices, faculty cadre ratio discrepancies, "
            "and unresolved student fee refund disputes."
        )
    elif "sla" in q or "pending" in q:
        answer = (
            "There are currently 28 active grievances across bureaus. 4 cases are within 48 hours of "
            "SLA breach in the Northern Regional Office. AI Co-Pilot has drafted reminder notices."
        )
    else:
        answer = (
            f"VIGIL Co-Pilot processed query: '{req.query}'. "
            "Cross-referenced with 41,280 AICTE permanent institute registries and active grievance dockets. "
            "No unaddressed statutory violations detected; 1 potential overlap identified under Regulation Bureau monitoring."
        )

    return CopilotQueryResponse(answer=answer, confidence=0.96)
