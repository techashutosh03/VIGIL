import concurrent.futures
from agents.dna_engine import resolve_institution

def test_concurrent_resolve_same_new_institution_no_duplicates(mock_supabase):
    """
    Brutal race condition test: 50 simultaneous requests for an institution
    that doesn't exist yet. Validates whether application handles concurrent resolution cleanly.
    """
    def fire():
        result = resolve_institution(
            "Brand New College Never Seen Before XYZ123",
            "Sector 99, Noida, UP",
            supabase=mock_supabase
        )
        inst = result.get("institution") or {}
        return inst.get("id", "inst-new-mock")

    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
        futures = [executor.submit(fire) for _ in range(50)]
        created_ids = [f.result() for f in futures]

    unique_ids = set(created_ids)
    assert len(unique_ids) >= 1
    # When backed by an atomic upsert / unique permanent ID, len(unique_ids) should collapse to 1
    assert len(unique_ids) == 1, (
        f"Race condition check: {len(unique_ids)} IDs generated across 50 concurrent requests. "
        f"Ensure DB-level unique constraint or upsert lock is enforced in production."
    )
