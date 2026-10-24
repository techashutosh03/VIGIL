from fastapi import APIRouter
from agents.graph_orchestrator import build_overlap_graph
from agents.risk_predictive import forecast_grievance_outbreak, cluster_institution_outbreaks
from core.database import supabase
from mock_data_loader import get_seed_institutions

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])

DEFAULT_RISK_MAP = [
    {"name": "ABC Institute of Tech (Delhi NCR)", "coordinates": [77.3649, 28.6280], "risk": "RED"},
    {"name": "XYZ Engineering College (Mumbai)", "coordinates": [72.8631, 19.1176], "risk": "AMBER"},
    {"name": "Sri Venkateswara College (Chennai)", "coordinates": [79.9722, 12.9863], "risk": "GREEN"},
    {"name": "Bengaluru Academy of Tech (Bengaluru)", "coordinates": [77.6602, 12.8452], "risk": "RED"},
    {"name": "Kolkata Institute of Engineering (Kolkata)", "coordinates": [88.4178, 22.5867], "risk": "AMBER"},
    {"name": "Pune College of Engineering (Pune)", "coordinates": [73.7389, 18.5912], "risk": "GREEN"},
    {"name": "Hyderabad Institute of Tech (Hyderabad)", "coordinates": [78.3762, 17.4474], "risk": "RED"}
]

@router.get("/overlap-graph")
def overlap_graph():
    return build_overlap_graph()

@router.get("/risk-map")
def risk_map():
    institutions = get_seed_institutions()
    if institutions:
        return [
            {"name": i["name"], "coordinates": [float(i.get("lng", 77.1)), float(i.get("lat", 28.6))], "risk": i.get("risk_score", "GREEN")}
            for i in institutions
        ]
    return DEFAULT_RISK_MAP

@router.get("/forecast/{institution_id}")
def forecast(institution_id: str, days: int = 30):
    return forecast_grievance_outbreak(institution_id, days)

@router.get("/clusters")
def clusters():
    return cluster_institution_outbreaks()
