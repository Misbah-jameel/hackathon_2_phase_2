"""Tests for app.main — root and health endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture()
def basic_client():
    """Simple client with no overrides (for root/health endpoints)."""
    with TestClient(app) as tc:
        yield tc


class TestRootEndpoint:
    def test_root_returns_ok(self, basic_client: TestClient):
        response = basic_client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "running" in data["message"].lower()


class TestHealthEndpoint:
    def test_health_returns_healthy(self, basic_client: TestClient):
        response = basic_client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
