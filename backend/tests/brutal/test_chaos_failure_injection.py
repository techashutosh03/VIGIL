from agents.dna_engine import resolve_institution
from agents.co_pilot import answer_query
from services.forecasting_service import forecast_with_prophet

def test_dna_engine_survives_supabase_outage(exploding_supabase):
    result = resolve_institution("ABC Institute", "Test", supabase=exploding_supabase)
    assert isinstance(result, dict)
    assert result.get("matched") is False or "error" in result
    # Must degrade gracefully, never throw ConnectionError up to the API layer

def test_copilot_survives_groq_api_down(monkeypatch, mock_supabase):
    def exploding_groq(*args, **kwargs):
        raise TimeoutError("Groq API timeout (simulated)")
    monkeypatch.setattr("services.llm_judge.call_groq", exploding_groq)

    result = answer_query("What are fee complaints?", supabase=mock_supabase)
    assert isinstance(result, dict)
    assert "unavailable" in str(result).lower() or result.get("source") == "fallback"

def test_forecasting_survives_prophet_import_failure(monkeypatch):
    monkeypatch.setattr("services.forecasting_service.PROPHET_AVAILABLE", False)
    result = forecast_with_prophet([1, 2, 3, 4, 5, 6, 7])
    assert result.get("engine_used") != "Prophet (Meta)" or result.get("method") != "prophet"
    assert result.get("prophet_installed") is False

def test_sla_daemon_survives_one_bad_case_without_killing_whole_batch(mock_supabase):
    """
    If check_sla_breaches() hits one malformed case (e.g. null sla_deadline),
    it must not crash and skip checking every OTHER case in the batch.
    """
    from agents.workflow_sla import check_sla_breaches
    mock_supabase.table.return_value.select.return_value.execute.return_value.data = [
        {"id": "c1", "sla_deadline": None, "state": "pending"},   # malformed
        {"id": "c2", "sla_deadline": "2020-01-01T00:00:00", "state": "pending"},  # clearly breached
    ]
    results = check_sla_breaches(supabase=mock_supabase)
    breached_ids = [r["id"] for r in results if r.get("breached")]
    assert "c2" in breached_ids, "Malformed case c1 must not block c2 from being correctly flagged"
