from fastapi import APIRouter
from pydantic import BaseModel
from agents.workflow_sla import get_cases, transition_state, check_sla_breaches

router = APIRouter(prefix="/api/v1/workflow", tags=["workflow"])

@router.get("/cases")
def list_cases():
    return get_cases()

class TransitionRequest(BaseModel):
    new_state: str
    performed_by: str = "official"

@router.post("/cases/{complaint_id}/transition")
def transition(complaint_id: str, req: TransitionRequest):
    return transition_state(complaint_id, req.new_state, req.performed_by)

@router.post("/check-sla")
def run_sla_check():
    return {"escalated_case_ids": check_sla_breaches()}
