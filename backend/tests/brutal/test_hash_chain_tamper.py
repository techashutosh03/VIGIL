from services.audit_service import write_audit_log, verify_chain_integrity

def test_tampering_is_actually_detected(mock_supabase):
    entries = []
    for i in range(5):
        entry = write_audit_log(
            action=f"action_{i}",
            actor="agent",
            payload={"i": i},
            supabase=mock_supabase
        )
        entries.append(entry)

    # Confirm untampered chain is valid
    check = verify_chain_integrity(entries)
    assert check["valid"] is True, f"Untampered chain failed verification: {check.get('reason')}"

    # BRUTAL: tamper with entry 2's payload after the fact, without recomputing hash
    tampered_entries = [dict(e) for e in entries]
    tampered_entries[2]["payload"] = {"i": 999, "injected": "malicious change"}

    check_after_tamper = verify_chain_integrity(tampered_entries)
    assert check_after_tamper["valid"] is False, "Tampering with an audit entry must be detectable"
    assert check_after_tamper["broken_at"] == tampered_entries[2]["id"]


def test_tampering_with_prev_hash_link_detected(mock_supabase):
    entries = []
    for i in range(3):
        entry = write_audit_log(
            action=f"step_{i}",
            actor="officer",
            payload={"step": i},
            supabase=mock_supabase
        )
        entries.append(entry)

    # Sever link between entry 1 and 2
    severed_entries = [dict(e) for e in entries]
    severed_entries[2]["prev_hash"] = "deadbeef" * 8

    check = verify_chain_integrity(severed_entries)
    assert check["valid"] is False
    assert check["broken_at"] == severed_entries[2]["id"]
    assert "link" in check["reason"].lower() or "mismatch" in check["reason"].lower()
