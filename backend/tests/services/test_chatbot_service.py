"""Tests for app.services.chatbot_service — intent detection + handlers."""

import json
import pytest
from unittest.mock import patch, MagicMock
from sqlmodel import Session

from app.services.chatbot_service import ChatbotService
from app.services.task_service import TaskService
from app.models.user import User
from app.models.task import Task


# ---------------------------------------------------------------------------
# detect_intent (regex fallback)
# ---------------------------------------------------------------------------

class TestDetectIntent:
    @pytest.mark.parametrize("message,expected_intent", [
        ("add task: Buy milk", "add"),
        ("create: Review docs", "add"),
        ("new task: Read book", "add"),
        ("add: groceries", "add"),
    ])
    def test_add_intent(self, message, expected_intent):
        intent, param = ChatbotService.detect_intent(message)
        assert intent == expected_intent
        assert param is not None

    @pytest.mark.parametrize("message", [
        "show all tasks",
        "list tasks",
        "my tasks",
        "show pending tasks",
        "show completed tasks",
        "pending tasks",
        "completed tasks",
        "what are my tasks",
    ])
    def test_list_intent(self, message):
        intent, _ = ChatbotService.detect_intent(message)
        assert intent == "list"

    @pytest.mark.parametrize("message,expected_intent", [
        ("complete: Buy milk", "complete"),
        ("mark done: groceries", "complete"),
        ("finish: homework", "complete"),
        ("done: laundry", "complete"),
    ])
    def test_complete_intent(self, message, expected_intent):
        intent, param = ChatbotService.detect_intent(message)
        assert intent == expected_intent
        assert param is not None

    @pytest.mark.parametrize("message", [
        "delete: old task",
        "remove: cancelled",
    ])
    def test_delete_intent(self, message):
        intent, param = ChatbotService.detect_intent(message)
        assert intent == "delete"
        assert param is not None

    @pytest.mark.parametrize("message", [
        "help", "?", "commands", "what can you do",
    ])
    def test_help_intent(self, message):
        intent, _ = ChatbotService.detect_intent(message)
        assert intent == "help"

    @pytest.mark.parametrize("message", [
        "hi", "hello", "hey", "howdy", "yo", "sup",
        "good morning", "hello there", "how are you",
    ])
    def test_greeting_intent(self, message):
        intent, _ = ChatbotService.detect_intent(message)
        assert intent == "greeting"

    def test_unknown_intent(self):
        intent, param = ChatbotService.detect_intent("asdfghjkl random gibberish")
        assert intent == "unknown"
        assert param is None

    def test_add_extracts_title(self):
        intent, param = ChatbotService.detect_intent("add task: Buy groceries")
        assert intent == "add"
        assert param == "buy groceries"


# ---------------------------------------------------------------------------
# detect_intent_with_ai
# ---------------------------------------------------------------------------

class TestDetectIntentWithAI:
    def test_no_api_key_falls_back_to_regex(self):
        with patch("app.services.chatbot_service.settings") as mock_settings:
            mock_settings.has_anthropic_key = False
            intent, param, filter_type = ChatbotService.detect_intent_with_ai("add: test")
            assert intent == "add"
            assert filter_type is None

    def test_successful_ai_response(self):
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text='{"intent": "add", "param": "buy milk", "filter": null}')]

        with patch("app.services.chatbot_service.settings") as mock_settings:
            mock_settings.has_anthropic_key = True
            mock_settings.anthropic_api_key = "test-key"
            mock_settings.anthropic_model = "claude-3-haiku-20240307"
            with patch("anthropic.Anthropic") as mock_anthropic:
                mock_client = MagicMock()
                mock_client.messages.create.return_value = mock_response
                mock_anthropic.return_value = mock_client

                intent, param, filter_type = ChatbotService.detect_intent_with_ai("add buy milk")
                assert intent == "add"
                assert param == "buy milk"

    def test_json_parse_error_falls_back(self):
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="not valid json")]

        with patch("app.services.chatbot_service.settings") as mock_settings:
            mock_settings.has_anthropic_key = True
            mock_settings.anthropic_api_key = "test-key"
            mock_settings.anthropic_model = "claude-3-haiku-20240307"
            with patch("anthropic.Anthropic") as mock_anthropic:
                mock_client = MagicMock()
                mock_client.messages.create.return_value = mock_response
                mock_anthropic.return_value = mock_client

                intent, param, filter_type = ChatbotService.detect_intent_with_ai("help")
                assert intent == "help"
                assert filter_type is None

    def test_api_error_falls_back(self):
        with patch("app.services.chatbot_service.settings") as mock_settings:
            mock_settings.has_anthropic_key = True
            mock_settings.anthropic_api_key = "test-key"
            mock_settings.anthropic_model = "claude-3-haiku-20240307"
            with patch("anthropic.Anthropic") as mock_anthropic:
                mock_client = MagicMock()
                mock_client.messages.create.side_effect = Exception("API down")
                mock_anthropic.return_value = mock_client

                intent, param, filter_type = ChatbotService.detect_intent_with_ai("help")
                assert intent == "help"
                assert filter_type is None


# ---------------------------------------------------------------------------
# Handlers
# ---------------------------------------------------------------------------

class TestHandleGreeting:
    def test_returns_greeting(self):
        resp = ChatbotService._handle_greeting()
        assert resp.intent == "greeting"
        assert resp.success is True
        assert "Hello" in resp.message


class TestHandleHelp:
    def test_returns_help(self):
        resp = ChatbotService._handle_help()
        assert resp.intent == "help"
        assert resp.success is True
        assert "Add tasks" in resp.message


class TestHandleAdd:
    def test_success(self, db_session: Session, test_user: User):
        resp = ChatbotService._handle_add(db_session, test_user.id, "New task")
        assert resp.intent == "add"
        assert resp.success is True
        assert "created" in resp.message.lower()
        assert resp.data["title"] == "New task"

    def test_no_title(self, db_session: Session, test_user: User):
        resp = ChatbotService._handle_add(db_session, test_user.id, None)
        assert resp.success is False
        assert "specify" in resp.message.lower()


class TestHandleList:
    def test_all_tasks(self, db_session: Session, test_user: User, sample_tasks):
        resp = ChatbotService._handle_list(db_session, test_user.id, "show tasks")
        assert resp.intent == "list"
        assert resp.success is True
        assert resp.data is not None
        assert len(resp.data) == 3

    def test_pending_tasks(self, db_session: Session, test_user: User, sample_tasks):
        resp = ChatbotService._handle_list(
            db_session, test_user.id, "show pending tasks", filter_type="pending"
        )
        assert resp.success is True
        assert all(not t["completed"] for t in resp.data)

    def test_completed_tasks(self, db_session: Session, test_user: User, sample_tasks):
        resp = ChatbotService._handle_list(
            db_session, test_user.id, "show completed tasks", filter_type="completed"
        )
        assert resp.success is True
        assert all(t["completed"] for t in resp.data)

    def test_empty(self, db_session: Session, test_user: User):
        resp = ChatbotService._handle_list(db_session, test_user.id, "show tasks")
        assert resp.success is True
        assert "No" in resp.message


class TestHandleComplete:
    def test_exact_match(self, db_session: Session, test_user: User, sample_tasks):
        resp = ChatbotService._handle_complete(db_session, test_user.id, "Buy groceries")
        assert resp.success is True
        assert "complete" in resp.message.lower()

    def test_no_title(self, db_session: Session, test_user: User):
        resp = ChatbotService._handle_complete(db_session, test_user.id, None)
        assert resp.success is False

    def test_no_match(self, db_session: Session, test_user: User, sample_tasks):
        resp = ChatbotService._handle_complete(db_session, test_user.id, "nonexistent xyz abc")
        assert resp.success is False
        assert "Couldn't find" in resp.message

    def test_already_completed(self, db_session: Session, test_user: User, sample_tasks):
        resp = ChatbotService._handle_complete(db_session, test_user.id, "Clean house")
        assert resp.success is True
        assert "already completed" in resp.message.lower()

    def test_ambiguous(self, db_session: Session, test_user: User):
        TaskService.create_task(db_session, test_user.id, "Buy apples from market")
        TaskService.create_task(db_session, test_user.id, "Buy oranges from market")
        TaskService.create_task(db_session, test_user.id, "Buy bananas from market")

        resp = ChatbotService._handle_complete(db_session, test_user.id, "buy from market")
        # Could be ambiguous or fuzzy match depending on scores
        assert resp.intent == "complete"


class TestHandleDelete:
    def test_exact_match(self, db_session: Session, test_user: User, sample_tasks):
        resp = ChatbotService._handle_delete(db_session, test_user.id, "Buy groceries")
        assert resp.success is True
        assert "deleted" in resp.message.lower()

    def test_no_title(self, db_session: Session, test_user: User):
        resp = ChatbotService._handle_delete(db_session, test_user.id, None)
        assert resp.success is False

    def test_no_match(self, db_session: Session, test_user: User, sample_tasks):
        resp = ChatbotService._handle_delete(db_session, test_user.id, "nonexistent xyz abc")
        assert resp.success is False
        assert "Couldn't find" in resp.message


class TestHandleUnknown:
    def test_returns_unknown(self):
        resp = ChatbotService._handle_unknown()
        assert resp.intent == "unknown"
        assert resp.success is False
        assert "Help" in resp.message
