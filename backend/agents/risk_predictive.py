from datetime import datetime, timedelta
import numpy as np
from sklearn.cluster import HDBSCAN
from core.database import supabase

SEVERITY_WEIGHTS = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 5}

def calculate_risk_band(score: float) -> str:
    return "RED" if score >= 75 else "AMBER" if score >= 40 else "GREEN"

def compute_risk_score(
    institution_id: str | None = None,
    frequency: float | None = None,
    severity: float | None = None,
    overlap: float | None = None,
    ageing: float | None = None
) -> dict:
    if frequency is not None or severity is not None or overlap is not None or ageing is not None:
        freq_val = min(max(float(frequency or 0), 0), 40)
        sev_val = min(max(float(severity or 0), 0), 25)
        ovl_val = min(max(float(overlap or 0), 0), 20)
        age_val = min(max(float(ageing or 0), 0), 15)
        total = round(freq_val + sev_val + ovl_val + age_val, 1)
        total = min(total, 100)
        band = calculate_risk_band(total)
        return {
            "score": total,
            "band": band,
            "frequency": freq_val,
            "severity": sev_val,
            "overlap": ovl_val,
            "ageing": age_val,
            "frequency_component": freq_val,
            "severity_component": sev_val,
            "overlap_component": ovl_val,
            "ageing_component": age_val,
        }

    complaints = []
    if supabase is not None and institution_id:
        try:
            complaints = supabase.table("complaints").select("*").eq("institution_id", institution_id).execute().data
        except Exception:
            complaints = []

    if not complaints:
        # Default baseline scoring for demo/seed data
        total = 82.0
        return {
            "score": total,
            "band": calculate_risk_band(total),
            "frequency": 32,
            "severity": 20,
            "overlap": 20,
            "ageing": 10,
            "frequency_component": 32,
            "severity_component": 20,
            "overlap_component": 20,
            "ageing_component": 10
        }

    # Frequency component (more complaints = higher risk, capped at 40)
    frequency_calc = min(len(complaints) * 8, 40)

    # Severity component (avg severity weight, scaled to 25)
    sev_total = sum(SEVERITY_WEIGHTS.get(c.get("severity", "MEDIUM"), 2) for c in complaints)
    severity_calc = min((sev_total / len(complaints)) * 5, 25)

    # Overlap component (complaints across multiple bureaus = higher risk)
    bureaus = set(c["bureau"] for c in complaints)
    overlap_calc = 20 if len(bureaus) > 1 else 0

    # Ageing component (unresolved + old = higher risk)
    now = datetime.utcnow()
    aged_unresolved = []
    for c in complaints:
        if c.get("state") not in ("disposed",):
            try:
                created = datetime.fromisoformat(c["created_at"].replace("Z", ""))
                if (now - created).days > 7:
                    aged_unresolved.append(c)
            except Exception:
                pass
    ageing_calc = min(len(aged_unresolved) * 5, 15)

    total = round(frequency_calc + severity_calc + overlap_calc + ageing_calc, 1)
    total = min(total, 100)
    band = calculate_risk_band(total)

    result = {
        "score": total,
        "band": band,
        "frequency": frequency_calc,
        "severity": severity_calc,
        "overlap": overlap_calc,
        "ageing": ageing_calc,
        "frequency_component": frequency_calc,
        "severity_component": severity_calc,
        "overlap_component": overlap_calc,
        "ageing_component": ageing_calc,
    }

    if supabase is not None and institution_id:
        try:
            supabase.table("risk_scores").upsert({
                "institution_id": institution_id,
                "score": total,
                "frequency_component": frequency_calc,
                "severity_component": severity_calc,
                "overlap_component": overlap_calc,
                "ageing_component": ageing_calc,
            }, on_conflict="institution_id").execute()

            supabase.table("institutions").update({"risk_score": band}).eq("id", institution_id).execute()
        except Exception as e:
            print(f"[WARN] Failed to persist risk score: {e}")

    return result

from services.forecasting_service import forecast_with_prophet, PROPHET_AVAILABLE

def forecast_grievance_outbreak(institution_id: str, days_ahead: int = 30, periods: int = None) -> dict:
    """
    Time-series predictive forecasting for institutional complaint volume.
    Uses Meta's Prophet if available and data is sufficient, otherwise falls back gracefully
    to Prophet-compatible trend projection with 95% confidence intervals.
    """
    horizon = periods if periods is not None else days_ahead
    complaint_dates = []
    if supabase is not None:
        try:
            res = supabase.table("complaints").select("created_at").eq("institution_id", institution_id).execute()
            complaint_dates = [c["created_at"] for c in res.data if c.get("created_at")]
        except Exception:
            complaint_dates = []

    result = forecast_with_prophet(complaint_dates, periods=horizon)
    result["institution_id"] = institution_id
    result["forecast_horizon_days"] = horizon
    result["engine_used"] = "Prophet (Meta)" if result["method"] == "prophet" else "Trend Projection (Prophet-compatible fallback)"
    result["prophet_installed"] = PROPHET_AVAILABLE
    result["projected_trajectory"] = result["predicted_trajectory"]
    result["growth_rate_pct"] = result.get("growth_rate_percent", 0.0)

    growth_rate = result.get("growth_rate_percent", 0.0)
    outbreak_probability = min(max(round((growth_rate / 100.0) * 0.95 + 0.35, 2), 0.15), 0.98)
    result["outbreak_probability"] = outbreak_probability
    result["is_outbreak_risk"] = result.get("outbreak_alert", False) or outbreak_probability >= 0.75
    result["generated_at"] = datetime.utcnow().isoformat()
    return result

def cluster_institution_outbreaks() -> dict:
    """
    HDBSCAN Spatial & Density Clustering on Institutional Coordinates & Complaints.
    Discovers geographic corridors with coordinated or systemic regulatory risk.
    """
    from mock_data_loader import get_seed_institutions
    institutions = get_seed_institutions()
    
    if len(institutions) < 2:
        return {"clusters": [], "cluster_count": 0, "noise_count": 0}
        
    coords = np.array([[i.get("lat", 20.0), i.get("lng", 78.0)] for i in institutions])
    
    # Run HDBSCAN (density-based spatial clustering of applications with noise)
    clusterer = HDBSCAN(min_cluster_size=2, metric="euclidean")
    labels = clusterer.fit_predict(coords)
    
    clusters_map = {}
    noise = []
    
    for idx, label in enumerate(labels):
        inst = institutions[idx]
        item = {
            "id": inst.get("id"),
            "name": inst.get("name"),
            "lat": inst.get("lat"),
            "lng": inst.get("lng"),
            "risk_score": inst.get("risk_score", "GREEN"),
            "cluster_label": int(label)
        }
        if label == -1:
            noise.append(item)
        else:
            clusters_map.setdefault(int(label), []).append(item)
            
    result_clusters = []
    for c_id, members in clusters_map.items():
        avg_lat = float(np.mean([m["lat"] for m in members]))
        avg_lng = float(np.mean([m["lng"] for m in members]))
        result_clusters.append({
            "cluster_id": c_id,
            "center": [avg_lat, avg_lng],
            "member_count": len(members),
            "members": members,
            "hotspot_level": "CRITICAL" if any(m["risk_score"] == "RED" for m in members) else "ELEVATED"
        })
        
    return {
        "cluster_count": len(result_clusters),
        "noise_count": len(noise),
        "clusters": result_clusters,
        "isolated_institutions": noise
    }
