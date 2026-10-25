import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def mock_supabase():
    mock = MagicMock()
    # Mock table chained methods
    mock.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
    mock.table.return_value.select.return_value.limit.return_value.execute.return_value.data = []
    mock.table.return_value.select.return_value.execute.return_value.data = []
    mock.table.return_value.insert.return_value.execute.return_value.data = [{"id": "inst-new-mock", "name": "Mock Inst"}]
    mock.table.return_value.update.return_value.eq.return_value.execute.return_value.data = []
    mock.table.return_value.upsert.return_value.execute.return_value.data = []
    return mock

@pytest.fixture
def chaos_supabase():
    """A Supabase mock that can be configured to fail or raise connection errors."""
    mock = MagicMock()
    return mock

@pytest.fixture
def exploding_supabase(chaos_supabase):
    chaos_supabase.table.side_effect = ConnectionError("Supabase unreachable (simulated chaos)")
    return chaos_supabase
