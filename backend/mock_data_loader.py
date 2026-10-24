import json
from pathlib import Path
from core.database import supabase

def get_seed_institutions() -> list:
    if supabase is not None:
        try:
            data = supabase.table("institutions").select("*").execute().data
            if data:
                return data
        except Exception:
            pass

    mock_path = Path(__file__).resolve().parent.parent / "mock-data" / "institutions.json"
    if mock_path.exists():
        try:
            with open(mock_path, "r") as f:
                return json.load(f)
        except Exception:
            pass

    return [
        {"id": "inst-1", "name": "ABC Institute of Technology", "lat": 28.6280, "lng": 77.3649, "risk_score": "RED", "region": "Northern"},
        {"id": "inst-2", "name": "XYZ Engineering College", "lat": 19.1176, "lng": 72.8631, "risk_score": "AMBER", "region": "Western"},
        {"id": "inst-3", "name": "Sri Venkateswara College of Engineering", "lat": 12.9863, "lng": 79.9722, "risk_score": "GREEN", "region": "Southern"},
        {"id": "inst-4", "name": "Bengaluru Academy of Technology", "lat": 12.8452, "lng": 77.6602, "risk_score": "RED", "region": "South-Western"},
        {"id": "inst-5", "name": "Pune College of Engineering & Research", "lat": 18.5912, "lng": 73.7389, "risk_score": "GREEN", "region": "Western"},
    ]
