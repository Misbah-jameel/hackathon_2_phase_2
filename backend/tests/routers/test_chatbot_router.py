"""Tests for app.routers.chatbot — chatbot endpoint + unauth."""

import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

from app.models.user import User


class TestChatbotEndpoint:
    @patch("app.services.chatbot_service.ChatbotService.detect_intent_with_ai")
    def test_help_message(self, mock_ai, client: TestClient):
        mock_ai.return_value = ("help", None, None)
        response = client.post("/api/chatbot", json={"message": "help"})
        assert response.status_code == 200
        data = response.json()
        assert data["intent"] == "help"
        assert data["success"] is True

    @patch("app.services.chatbot_service.ChatbotService.detect_intent_with_ai")
    def test_add_task(self, mock_ai, client: TestClient):
        mock_ai.return_value = ("add", "Buy milk", None)
        response = client.post("/api/chatbot", json={"message": "add: Buy milk"})
        assert response.status_code == 200
        data = response.json()
        assert data["intent"] == "add"
        assert data["success"] is True

    @patch("app.services.chatbot_service.ChatbotService.detect_intent_with_ai")
    def test_unknown_message(self, mock_ai, client: TestClient):
        mock_ai.return_value = ("unknown", None, None)
        response = client.post("/api/chatbot", json={"message": "random gibberish"})
        assert response.status_code == 200
        data = response.json()
        assert data["intent"] == "unknown"
        assert data["success"] is False

    def test_missing_body(self, client: TestClient):
        response = client.post("/api/chatbot", json={})
        assert response.status_code == 422

    def test_unauthenticated(self, unauth_client: TestClient):
        response = unauth_client.post("/api/chatbot", json={"message": "help"})
        assert response.status_code in (401, 403)
