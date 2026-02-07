"""Tests for app.routers.auth — signup/login/logout/me endpoints."""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user import User


class TestSignup:
    def test_success(self, client: TestClient):
        response = client.post("/api/auth/signup", json={
            "email": "signup@example.com",
            "password": "StrongPass1",
            "name": "Signup User",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["email"] == "signup@example.com"
        assert "token" in data

    def test_duplicate_email(self, client: TestClient, test_user: User):
        response = client.post("/api/auth/signup", json={
            "email": "test@example.com",
            "password": "StrongPass1",
            "name": "Dup User",
        })
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    def test_weak_password(self, client: TestClient):
        response = client.post("/api/auth/signup", json={
            "email": "weak@example.com",
            "password": "short",
            "name": "Weak User",
        })
        assert response.status_code == 422


class TestLogin:
    def test_success(self, client: TestClient, test_user: User):
        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "TestPass123",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["email"] == "test@example.com"
        assert "token" in data

    def test_wrong_password(self, client: TestClient, test_user: User):
        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "WrongPass1",
        })
        assert response.status_code == 401

    def test_nonexistent_email(self, client: TestClient):
        response = client.post("/api/auth/login", json={
            "email": "ghost@example.com",
            "password": "AnyPass1",
        })
        assert response.status_code == 401


class TestLogout:
    def test_authenticated(self, client: TestClient):
        response = client.post("/api/auth/logout")
        assert response.status_code == 204

    def test_unauthenticated(self, unauth_client: TestClient):
        response = unauth_client.post("/api/auth/logout")
        assert response.status_code in (401, 403)


class TestMe:
    def test_authenticated(self, client: TestClient, test_user: User):
        response = client.get("/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["name"] == "Test User"

    def test_unauthenticated(self, unauth_client: TestClient):
        response = unauth_client.get("/api/auth/me")
        assert response.status_code in (401, 403)
