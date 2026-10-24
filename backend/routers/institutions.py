from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from agents.dna_engine import resolve_institution
from services.audit_service import write_audit_log
from core.database import supabase
from core.security import get_current_officer

router = APIRouter(prefix="/api/v1/institutions", tags=["institutions"])

class ResolveRequest(BaseModel):
    text: str
    address: str = ""
    aicte_id: str | None = None

class HumanOverrideRequest(BaseModel):
    complaint_id: str
    target_institution_id: str
    decision: str = "APPROVED"  # "APPROVED" | "REJECTED"
    reviewer: Optional[str] = "Officer"
    notes: Optional[str] = ""

@router.post("/resolve")
def resolve(req: ResolveRequest):
    return resolve_institution(req.text, req.address, req.aicte_id)

@router.post("/override")
def human_override(req: HumanOverrideRequest, current_user: dict = Depends(get_current_officer)):
    """
    Human-in-the-Loop Override Endpoint.
    Triggered when AI matching confidence is below 0.85 or flagged for regulatory audit.
    Writes an immutable SHA-256 state transition to the tamper-evident audit ledger.
    """
    reviewer_name = req.reviewer or current_user.get("name", "Officer")
    action_type = "HUMAN_REVIEW_APPROVED" if req.decision.upper() == "APPROVED" else "HUMAN_REVIEW_REJECTED"

    payload = {
        "complaint_id": req.complaint_id,
        "target_institution_id": req.target_institution_id,
        "decision": req.decision.upper(),
        "notes": req.notes,
        "bureau": current_user.get("bureau", "RB"),
        "reviewer": reviewer_name,
    }

    audit_entry = write_audit_log(action_type, reviewer_name, payload)

    if supabase is not None and req.decision.upper() == "APPROVED":
        try:
            supabase.table("complaints").update({
                "institution_id": req.target_institution_id,
                "state": "under-process"
            }).eq("id", req.complaint_id).execute()
        except Exception as e:
            print(f"[WARN] Failed to link complaint in Supabase: {e}")

    return {
        "success": True,
        "action": action_type,
        "reviewer": reviewer_name,
        "audit_entry": audit_entry,
        "message": f"Human review decision '{req.decision.upper()}' cryptographically committed to audit trail."
    }
