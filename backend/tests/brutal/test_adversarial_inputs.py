import pytest
from agents.dna_engine import resolve_institution

ADVERSARIAL_STRINGS = [
    "",                                                   # empty
    " ",                                                  # whitespace only
    "a" * 10000,                                          # 10k char DoS attempt
    "ABC Institute'; DROP TABLE institutions;--",         # SQLi-shaped
    "<script>alert(document.cookie)</script> Institute",  # XSS-shaped
    "अखिल भारतीय प्रौद्योगिकी संस्थान",                       # Devanagari unicode
    "🏫🔥💀 Institute of Technology",                      # emoji
    "ABC\x00Institute",                                   # null byte
    "ABC\nInstitute\r\n\x1b[31mRED",                       # control chars / ANSI injection
    None,                                                 # NoneType
]

@pytest.mark.parametrize("raw_name", ADVERSARIAL_STRINGS)
def test_dna_engine_never_crashes_on_adversarial_input(raw_name, mock_supabase):
    """
    Brutal requirement: no input should ever cause an unhandled 500 or uncaught crash.
    Either a clean no-match result or an explicit ValueError/TypeError — never a stack trace leak.
    """
    try:
        result = resolve_institution(raw_name, region="Test", supabase=mock_supabase)
        assert isinstance(result, dict)
        assert "matched" in result
    except (TypeError, ValueError):
        pass  # acceptable: explicit validation rejection
    except Exception as e:
        pytest.fail(f"Unhandled exception leaked for input {raw_name!r}: {type(e).__name__}: {e}")

def test_api_rejects_sqli_payload_cleanly(client):
    resp = client.post("/api/v1/institutions/resolve", json={
        "institution_name_raw": "x'; DROP TABLE institutions; --",
        "region": "Test"
    })
    assert resp.status_code in (200, 422)
    if resp.status_code == 200:
        data = resp.json()
        assert "matched" in data
    health = client.get("/healthz")
    assert health.status_code == 200

def test_api_rejects_oversized_payload(client):
    huge_payload = {"institution_name_raw": "A" * 500_000, "region": "Test"}
    resp = client.post("/api/v1/institutions/resolve", json=huge_payload)
    # Must not 500 — either 200 (handled gracefully) or 413/422
    assert resp.status_code != 500
