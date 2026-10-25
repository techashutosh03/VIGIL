"""
Brutal boundary testing: our thresholds are the entire trust model.
0.70 / 0.85 / 0.92 / 40 / 75 — test EXACTLY on the line, not just "around" it.
"""
from agents.risk_predictive import compute_risk_score, calculate_risk_band
from agents.dna_engine import is_ambiguous_zone, evaluate_match_confidence
from services.matcher import fuzzy_score

def test_risk_score_exactly_at_green_amber_boundary():
    # Score lands exactly at 40 -> confirm which side AMBER starts on
    result = compute_risk_score(frequency=40, severity=0, overlap=0, ageing=0)
    assert result["band"] in ("GREEN", "AMBER")
    assert result["band"] == "AMBER"  # 40 starts AMBER: score >= 40

    # Determinism check: must be identical both times
    result2 = compute_risk_score(frequency=40, severity=0, overlap=0, ageing=0)
    assert result == result2

def test_risk_score_one_unit_below_and_above_amber_red_boundary():
    below = compute_risk_score(frequency=37, severity=25, overlap=12, ageing=0)   # = 74 -> AMBER
    above = compute_risk_score(frequency=38, severity=25, overlap=12, ageing=0)   # = 75 -> RED
    assert below["band"] == "AMBER"
    assert above["band"] == "RED"
    assert below["band"] != above["band"], "Boundary of 75 must change the band"

def test_risk_score_cap_enforcement_not_bypassable():
    # Frequency capped at 40 — feeding 999,999 must not exceed 40
    result = compute_risk_score(frequency=999999, severity=0, overlap=0, ageing=0)
    assert result["frequency_component"] <= 40, "Frequency cap bypassed — score inflatable"
    assert result["score"] <= 40

def test_confidence_exactly_at_human_review_threshold_085():
    """
    0.85 is the line between 'AI can proceed' and 'mandatory human review'.
    This is the single most safety-critical threshold in the system.
    """
    result_at = evaluate_match_confidence(confidence=0.85)
    result_below = evaluate_match_confidence(confidence=0.8499)
    result_above = evaluate_match_confidence(confidence=0.8501)

    assert result_below["requires_human_review"] is True
    assert result_above["requires_human_review"] is False
    # Threshold definition: confidence < 0.85 requires review, exactly 0.85 is satisfied
    assert result_at["requires_human_review"] is False

def test_ambiguous_zone_exact_bounds_070_and_092():
    # Ambiguous band is [0.70, 0.92)
    assert is_ambiguous_zone(0.70) is True
    assert is_ambiguous_zone(0.6999) is False
    assert is_ambiguous_zone(0.9201) is False
    assert is_ambiguous_zone(0.80) is True

def test_fuzzy_short_circuit_threshold():
    # Near-identical strings score >= 90
    res = fuzzy_score("ABC Institute of Technology", "ABC Institute of Technology ")
    assert res["combined_score"] >= 90
