from typing import List
from fastapi import APIRouter
from app.models.schemas import OverlapGraphResponse, GraphNode, GraphLink, RiskMapPoint

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/overlap-graph", response_model=OverlapGraphResponse)
async def get_overlap_graph():
    return OverlapGraphResponse(
        nodes=[
            GraphNode(id="inst-1", label="ABC Institute of Tech (Delhi NCR)", type="institution", risk="RED"),
            GraphNode(id="c-101", label="RB Show-Cause #101 (Infra Shortfall)", type="complaint"),
            GraphNode(id="c-204", label="PGRC Grievance #204 (Lab Deficiencies)", type="complaint"),
            GraphNode(id="c-205", label="Approvals Bureau #205 (Faculty Ratio)", type="complaint"),
            GraphNode(id="inst-2", label="XYZ Engineering College (Mumbai)", type="institution", risk="AMBER"),
            GraphNode(id="c-305", label="RB Complaint #305 (Fee Overcharge)", type="complaint"),
            GraphNode(id="inst-3", label="PQR Polytechnic (Chennai)", type="institution", risk="GREEN"),
            GraphNode(id="c-401", label="PGRC Routine Notice #401", type="complaint"),
        ],
        links=[
            GraphLink(source="c-101", target="inst-1", bureau="RB"),
            GraphLink(source="c-204", target="inst-1", bureau="PGRC"),
            GraphLink(source="c-205", target="inst-1", bureau="Approvals"),
            GraphLink(source="c-305", target="inst-2", bureau="RB"),
            GraphLink(source="c-401", target="inst-3", bureau="PGRC"),
            GraphLink(source="inst-1", target="inst-2", bureau="Shared Trust Oversight"),
        ]
    )

@router.get("/risk-map", response_model=List[RiskMapPoint])
async def get_risk_map():
    return [
        RiskMapPoint(name="ABC Institute of Tech (Delhi)", coordinates=[77.1025, 28.7041], risk="RED"),
        RiskMapPoint(name="XYZ Engineering College (Mumbai)", coordinates=[72.8777, 19.0760], risk="AMBER"),
        RiskMapPoint(name="PQR Polytechnic (Chennai)", coordinates=[80.2707, 13.0827], risk="GREEN"),
        RiskMapPoint(name="Bengaluru Tech Institute (Bengaluru)", coordinates=[77.5946, 12.9716], risk="RED"),
        RiskMapPoint(name="Kolkata Engineering College (Kolkata)", coordinates=[88.3639, 22.5726], risk="AMBER"),
        RiskMapPoint(name="Pune Institute of Tech (Pune)", coordinates=[73.8567, 18.5204], risk="GREEN"),
        RiskMapPoint(name="Hyderabad Institute of Science (Hyderabad)", coordinates=[78.4867, 17.3850], risk="RED"),
    ]
