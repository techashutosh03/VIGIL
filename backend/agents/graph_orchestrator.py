from core.database import supabase
from services.audit_service import write_audit_log

DEFAULT_NODES = [
    {"id": "inst-1", "label": "ABC Institute of Tech (Delhi NCR)", "type": "institution", "risk": "RED"},
    {"id": "c-101", "label": "RB Show-Cause #101 (Infra Shortfall)", "type": "complaint"},
    {"id": "c-204", "label": "PGRC Grievance #204 (Lab Deficiencies)", "type": "complaint"},
    {"id": "c-205", "label": "Approvals Bureau #205 (Faculty Ratio)", "type": "complaint"},
    {"id": "inst-2", "label": "XYZ Engineering College (Mumbai)", "type": "institution", "risk": "AMBER"},
    {"id": "c-305", "label": "RB Complaint #305 (Fee Overcharge)", "type": "complaint"},
    {"id": "inst-3", "label": "PQR Polytechnic (Chennai)", "type": "institution", "risk": "GREEN"},
    {"id": "c-401", "label": "PGRC Routine Notice #401", "type": "complaint"},
]

DEFAULT_LINKS = [
    {"source": "c-101", "target": "inst-1", "bureau": "RB"},
    {"source": "c-204", "target": "inst-1", "bureau": "PGRC"},
    {"source": "c-205", "target": "inst-1", "bureau": "Approvals"},
    {"source": "c-305", "target": "inst-2", "bureau": "RB"},
    {"source": "c-401", "target": "inst-3", "bureau": "PGRC"},
    {"source": "inst-1", "target": "inst-2", "bureau": "Shared Trust Oversight"},
]

def build_overlap_graph() -> dict:
    nodes, links = [], []

    if supabase is not None:
        try:
            institutions = supabase.table("institutions").select("*").execute().data
            complaints = supabase.table("complaints").select("*").execute().data

            if institutions and complaints:
                inst_bureau_map: dict[str, set] = {}

                for inst in institutions:
                    nodes.append({
                        "id": inst["id"], "label": inst["name"],
                        "type": "institution", "risk": inst.get("risk_score", "GREEN")
                    })

                for c in complaints:
                    if not c.get("institution_id"):
                        continue
                    nodes.append({"id": c["id"], "label": f"{c['bureau']} Complaint", "type": "complaint"})
                    links.append({"source": c["id"], "target": c["institution_id"], "bureau": c["bureau"]})
                    inst_bureau_map.setdefault(c["institution_id"], set()).add(c["bureau"])

                overlaps = [inst_id for inst_id, bureaus in inst_bureau_map.items() if len(bureaus) > 1]
                for inst_id in overlaps:
                    write_audit_log("OVERLAP_DETECTED", "GraphOrchestratorAgent", {"institution_id": inst_id})

                return {"nodes": nodes, "links": links, "overlap_institution_ids": overlaps}
        except Exception:
            pass

    return {
        "nodes": DEFAULT_NODES,
        "links": DEFAULT_LINKS,
        "overlap_institution_ids": ["inst-1"]
    }

def create_war_room(institution_id: str) -> dict:
    complaints = []
    if supabase is not None:
        try:
            complaints = supabase.table("complaints").select("*").eq("institution_id", institution_id).execute().data
        except Exception:
            complaints = []

    if not complaints:
        complaints = [
            {"id": "c-101", "bureau": "RB", "description": "Infra shortfall notice", "created_at": "2026-03-12T10:00:00"},
            {"id": "c-204", "bureau": "PGRC", "description": "Lab equipment grievance", "created_at": "2026-03-14T11:30:00"}
        ]

    bureaus_involved = list(set(c["bureau"] for c in complaints))
    lead_bureau = min(complaints, key=lambda c: c.get("created_at", ""))["bureau"] if complaints else "RB"

    write_audit_log("WAR_ROOM_CREATED", "GraphOrchestratorAgent",
                     {"institution_id": institution_id, "lead_bureau": lead_bureau})

    return {
        "institution_id": institution_id,
        "bureaus_involved": bureaus_involved,
        "suggested_lead_bureau": lead_bureau,
        "complaint_count": len(complaints),
        "complaints": complaints,
    }
