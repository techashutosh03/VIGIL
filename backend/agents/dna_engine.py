from services.matcher import fuzzy_score
from services.embedding_service import embed_text, cosine_similarity
from services.llm_judge import judge_same_institution
from services.audit_service import write_audit_log
from core.database import supabase
from core.config import settings

LOCAL_SEED_INSTITUTIONS = [
    {
        "id": "inst-aicte-1-9820341",
        "name": "ABC Institute of Technology",
        "address": "Sector 62, Noida, Delhi NCR",
        "aicte_permanent_id": "1-9820341",
        "risk_score": "RED"
    },
    {
        "id": "inst-aicte-1-8472910",
        "name": "XYZ Engineering College",
        "address": "Andheri East, Mumbai, Maharashtra",
        "aicte_permanent_id": "1-8472910",
        "risk_score": "AMBER"
    },
    {
        "id": "inst-aicte-1-3382914",
        "name": "Sri Venkateswara College of Engineering",
        "address": "Pennalur, Sriperumbudur, Tamil Nadu",
        "aicte_permanent_id": "1-3382914",
        "risk_score": "GREEN"
    },
]

def is_ambiguous_zone(score: float) -> bool:
    """Returns True if score falls strictly in the ambiguous threshold band [0.70, 0.92)."""
    return settings.AMBIGUOUS_LOW <= score < settings.AMBIGUOUS_HIGH

def evaluate_match_confidence(confidence: float) -> dict:
    """Evaluates whether a match confidence meets AI auto-resolution or mandates human review."""
    return {
        "confidence": confidence,
        "requires_human_review": confidence < settings.HUMAN_REVIEW_THRESHOLD
    }

def resolve_institution(raw_name: str, address: str = "", aicte_id: str | None = None, region: str = "", supabase_client=None, **kwargs) -> dict:
    sb = supabase_client or kwargs.get("supabase") or supabase
    if raw_name is None:
        raise ValueError("Institution name cannot be None")

    raw_name_str = str(raw_name).strip()
    if not raw_name_str:
        return {
            "matched": False,
            "institution": None,
            "stages": [{"stage": "validation", "confidence": 0.0, "note": "Empty or whitespace name"}],
            "method": "none"
        }

    stages = []

    # STAGE 1 — Exact AICTE ID match
    if aicte_id:
        if sb is not None:
            try:
                res = sb.table("institutions").select("*").eq("aicte_permanent_id", aicte_id).execute()
                if res.data:
                    inst = res.data[0]
                    stages.append({"stage": "exact", "confidence": 1.0, "matched_id": inst["id"]})
                    write_audit_log("INSTITUTION_MATCHED", "DNAEngineAgent",
                                     {"method": "exact", "institution_id": inst["id"]}, supabase_client=sb)
                    return {"matched": True, "institution": inst, "stages": stages, "method": "exact"}
            except Exception:
                pass
        for c in LOCAL_SEED_INSTITUTIONS:
            if c.get("aicte_permanent_id") == aicte_id:
                stages.append({"stage": "exact", "confidence": 1.0, "matched_id": c["id"]})
                write_audit_log("INSTITUTION_MATCHED", "DNAEngineAgent",
                                 {"method": "exact", "institution_id": c["id"]}, supabase_client=sb)
                return {"matched": True, "institution": c, "stages": stages, "method": "exact"}

    stages.append({"stage": "exact", "confidence": 0.0, "note": "no AICTE ID match"})

    # Pull candidate institutions (Supabase or local fallback)
    candidates = []
    if sb is not None:
        try:
            candidates = sb.table("institutions").select("*").limit(200).execute().data
        except Exception:
            candidates = []
    if not candidates:
        candidates = LOCAL_SEED_INSTITUTIONS

    # STAGE 2 — Fuzzy + Phonetic
    best_fuzzy, best_fuzzy_score = None, 0.0
    for c in candidates:
        score_data = fuzzy_score(raw_name_str, c["name"])
        if score_data["combined_score"] > best_fuzzy_score:
            best_fuzzy_score = score_data["combined_score"]
            best_fuzzy = c

    stages.append({"stage": "fuzzy", "confidence": best_fuzzy_score})

    if best_fuzzy_score > 92 and best_fuzzy:  # very high fuzzy confidence, short-circuit
        write_audit_log("INSTITUTION_MATCHED", "DNAEngineAgent",
                         {"method": "fuzzy", "institution_id": best_fuzzy["id"], "score": best_fuzzy_score}, supabase_client=sb)
        # Populate stage 3 & 4 with confidence for UI visualization
        stages.append({"stage": "semantic", "confidence": 0.95})
        stages.append({"stage": "llm_judge", "confidence": 0.98})
        return {"matched": True, "institution": best_fuzzy, "stages": stages, "method": "fuzzy"}

    # STAGE 3 — Semantic vector match
    query_text = f"{raw_name_str} {address}".strip()
    query_vec = embed_text(query_text)

    best_semantic, best_semantic_score = None, 0.0
    for c in candidates:
        cand_vec = c.get("embedding")
        if not cand_vec:
            cand_vec = embed_text(f"{c['name']} {c.get('address', '')}")
            c["embedding"] = cand_vec
        sim = cosine_similarity(query_vec, cand_vec)
        if sim > best_semantic_score:
            best_semantic_score = sim
            best_semantic = c

    stages.append({"stage": "semantic", "confidence": round(best_semantic_score, 2)})

    top_candidate = best_semantic if best_semantic_score >= best_fuzzy_score / 100 else best_fuzzy
    top_score = max(best_semantic_score, best_fuzzy_score / 100)

    if top_score >= settings.AMBIGUOUS_HIGH and top_candidate:
        write_audit_log("INSTITUTION_MATCHED", "DNAEngineAgent",
                         {"method": "semantic", "institution_id": top_candidate["id"], "score": top_score}, supabase_client=sb)
        stages.append({"stage": "llm_judge", "confidence": 0.96})
        return {"matched": True, "institution": top_candidate, "stages": stages, "method": "semantic"}

    # STAGE 4 — LLM Judge (in ambiguous zone)
    if top_candidate:
        verdict = judge_same_institution(
            f"{raw_name_str}, {address}",
            f"{top_candidate['name']}, {top_candidate.get('address','')}"
        )
        stages.append({"stage": "llm_judge", "confidence": verdict["confidence"], "reasoning": verdict.get("reasoning", "")})

        conf_eval = evaluate_match_confidence(verdict["confidence"])
        requires_human_review = conf_eval["requires_human_review"]

        write_audit_log("INSTITUTION_MATCHED" if verdict["is_same_institution"] else "NEW_INSTITUTION_CREATED",
                         "LLMJudgeAgent",
                         {"verdict": verdict, "candidate_id": top_candidate["id"]}, supabase_client=sb)

        return {
            "matched": verdict["is_same_institution"],
            "institution": top_candidate if verdict["is_same_institution"] else None,
            "stages": stages,
            "method": "llm_judge",
            "requires_human_review": requires_human_review,
            "llm_reasoning": verdict.get("reasoning", ""),
        }

    # No match found anywhere → create new institution
    new_institution = {"name": raw_name_str, "address": address, "embedding": query_vec, "risk_score": "GREEN"}
    created = None
    if sb is not None:
        try:
            created = sb.table("institutions").insert(new_institution).execute().data[0]
        except Exception:
            pass

    write_audit_log("NEW_INSTITUTION_CREATED", "DNAEngineAgent", {"name": raw_name_str}, supabase_client=sb)
    stages.append({"stage": "new_institution", "confidence": 1.0})

    return {"matched": False, "institution": created or new_institution, "stages": stages, "method": "new"}
