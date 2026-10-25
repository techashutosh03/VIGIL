import os
import jwt
import time
import pytest
from fastapi import HTTPException
from core.config import settings
from core.security import get_current_officer

def test_protected_endpoint_rejects_missing_token_in_prod(client, monkeypatch):
    monkeypatch.setenv("DEV_MODE", "false")
    resp = client.post("/api/v1/institutions/override", json={
        "complaint_id": "c-100",
        "target_institution_id": "inst-1",
        "decision": "APPROVED"
    })
    assert resp.status_code == 401, f"Expected 401 when DEV_MODE=false and token missing, got {resp.status_code}"

def test_protected_endpoint_rejects_tampered_jwt(client):
    fake_token = jwt.encode({"sub": "attacker", "role": "admin"}, "attacker-wrong-secret", algorithm="HS256")
    resp = client.post(
        "/api/v1/institutions/override",
        headers={"Authorization": f"Bearer {fake_token}"},
        json={
            "complaint_id": "c-100",
            "target_institution_id": "inst-1",
            "decision": "APPROVED"
        }
    )
    assert resp.status_code == 401, f"Expected 401 for tampered JWT, got {resp.status_code}"

def test_expired_jwt_rejected(client):
    expired_token = jwt.encode(
        {"sub": "officer1", "role": "regulator", "exp": int(time.time()) - 3600},
        settings.JWT_SECRET,
        algorithm="HS256"
    )
    resp = client.post(
        "/api/v1/institutions/override",
        headers={"Authorization": f"Bearer {expired_token}"},
        json={
            "complaint_id": "c-100",
            "target_institution_id": "inst-1",
            "decision": "APPROVED"
        }
    )
    assert resp.status_code == 401, f"Expected 401 for expired token, got {resp.status_code}"

@pytest.mark.asyncio
async def test_dev_mode_bypass_is_explicit_not_silent(monkeypatch):
    """
    Brutal requirement: dev-mode bypass must be gated behind an explicit flag.
    When DEV_MODE is false or unset, get_current_officer(credentials=None) must raise 401.
    """
    monkeypatch.setenv("DEV_MODE", "false")
    with pytest.raises(HTTPException) as exc_info:
        await get_current_officer(credentials=None)
    assert exc_info.value.status_code == 401
