"""Tests for app.schemas.chatbot — ChatbotRequest, ChatbotResponse."""

import pytest
from pydantic import ValidationError
from app.schemas.chatbot import ChatbotRequest, ChatbotResponse


class TestChatbotRequest:
    def test_valid_request(self):
        req = ChatbotRequest(message="show my tasks")
        assert req.message == "show my tasks"

    def test_missing_message(self):
        with pytest.raises(ValidationError):
            ChatbotRequest()


class TestChatbotResponse:
    def test_minimal_response(self):
        resp = ChatbotResponse(message="Hello!", intent="greeting", success=True)
        assert resp.message == "Hello!"
        assert resp.data is None
        assert resp.suggestions == []

    def test_full_response(self):
        resp = ChatbotResponse(
            message="Done",
            intent="add",
            success=True,
            data={"id": "1", "title": "Test"},
            suggestions=["Show tasks", "Help"],
        )
        assert resp.data == {"id": "1", "title": "Test"}
        assert len(resp.suggestions) == 2
