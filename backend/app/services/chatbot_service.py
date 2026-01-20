"""
Chatbot Service - AI-Powered Task Management

PHASE III AI CHATBOT INTEGRATION:
Currently uses regex pattern matching for command parsing.

Future AI enhancements (Phase III):
- Integration with OpenAI/Anthropic API for true NLU
- Semantic understanding of user intent
- Context-aware multi-turn conversations
- Smart task categorization and tagging
- Natural language task scheduling
- Sentiment analysis for task prioritization

To integrate AI in Phase III:
1. Add AI provider client (e.g., openai, anthropic)
2. Replace detect_intent() with AI-based intent classification
3. Add conversation history for context
4. Implement embeddings for semantic task matching
"""

import re
from typing import Optional, Dict, Any, List, Tuple
from sqlmodel import Session

from .task_service import TaskService
from ..schemas.chatbot import ChatbotResponse


class ChatbotService:
    """Service for processing natural language commands."""

    # Intent patterns
    PATTERNS = {
        "add": [
            r"add\s+task[:\s]+(.+)",
            r"create[:\s]+(.+)",
            r"new\s+task[:\s]+(.+)",
            r"add[:\s]+(.+)",
        ],
        "list": [
            r"show\s+(all\s+)?tasks?",
            r"list\s+(all\s+)?tasks?",
            r"my\s+tasks?",
            r"show\s+pending(\s+tasks?)?",
            r"show\s+completed(\s+tasks?)?",
            r"pending\s+tasks?",
            r"completed\s+tasks?",
            r"what.*tasks",
        ],
        "complete": [
            r"complete[:\s]+(.+)",
            r"mark\s+done[:\s]+(.+)",
            r"finish[:\s]+(.+)",
            r"done[:\s]+(.+)",
        ],
        "delete": [
            r"delete[:\s]+(.+)",
            r"remove[:\s]+(.+)",
        ],
        "help": [
            r"^help$",
            r"^\?$",
            r"commands?",
            r"what\s+can\s+you\s+do",
        ],
    }

    HELP_MESSAGE = """I can help you manage your tasks! Try these commands:

**Add tasks:**
- "Add task: Buy groceries"
- "Create: Review documents"

**View tasks:**
- "Show my tasks"
- "Show pending tasks"
- "Show completed tasks"

**Complete tasks:**
- "Complete: Buy groceries"
- "Mark done: Review documents"

**Delete tasks:**
- "Delete: Old task"
- "Remove: Cancelled item"

**Get help:**
- "Help" or "?"
"""

    @classmethod
    def detect_intent(cls, message: str) -> Tuple[str, Optional[str]]:
        """Detect the intent and extract any parameters from the message."""
        message_lower = message.lower().strip()

        for intent, patterns in cls.PATTERNS.items():
            for pattern in patterns:
                match = re.search(pattern, message_lower, re.IGNORECASE)
                if match:
                    # Extract captured group if exists
                    param = match.group(1).strip() if match.lastindex else None
                    return intent, param

        return "unknown", None

    @classmethod
    def process_message(
        cls,
        session: Session,
        user_id: str,
        message: str,
    ) -> ChatbotResponse:
        """Process a natural language message and execute the appropriate action."""
        intent, param = cls.detect_intent(message)

        if intent == "help":
            return cls._handle_help()
        elif intent == "add":
            return cls._handle_add(session, user_id, param)
        elif intent == "list":
            return cls._handle_list(session, user_id, message)
        elif intent == "complete":
            return cls._handle_complete(session, user_id, param)
        elif intent == "delete":
            return cls._handle_delete(session, user_id, param)
        else:
            return cls._handle_unknown()

    @classmethod
    def _handle_help(cls) -> ChatbotResponse:
        """Handle help intent."""
        return ChatbotResponse(
            message=cls.HELP_MESSAGE,
            intent="help",
            success=True,
            suggestions=["Show my tasks", "Add task: ", "Help"],
        )

    @classmethod
    def _handle_add(
        cls,
        session: Session,
        user_id: str,
        task_title: Optional[str],
    ) -> ChatbotResponse:
        """Handle add task intent."""
        if not task_title:
            return ChatbotResponse(
                message="Please specify a task title. Example: 'Add task: Buy groceries'",
                intent="add",
                success=False,
                suggestions=["Add task: Buy groceries", "Add task: Review documents"],
            )

        task = TaskService.create_task(session, user_id, task_title)

        return ChatbotResponse(
            message=f"Task '{task.title}' created!",
            intent="add",
            success=True,
            data={
                "id": task.id,
                "title": task.title,
                "completed": task.completed,
            },
            suggestions=["Show my tasks", "Add another task", "Complete: " + task.title],
        )

    @classmethod
    def _handle_list(
        cls,
        session: Session,
        user_id: str,
        message: str,
    ) -> ChatbotResponse:
        """Handle list tasks intent."""
        message_lower = message.lower()

        if "pending" in message_lower:
            tasks = TaskService.get_pending_tasks(session, user_id)
            filter_type = "pending"
        elif "completed" in message_lower:
            tasks = TaskService.get_completed_tasks(session, user_id)
            filter_type = "completed"
        else:
            tasks = TaskService.get_tasks_by_user(session, user_id)
            filter_type = "all"

        if not tasks:
            return ChatbotResponse(
                message=f"No {filter_type} tasks found.",
                intent="list",
                success=True,
                suggestions=["Add task: ", "Show all tasks"],
            )

        task_list = []
        for task in tasks[:10]:  # Limit to 10 tasks
            status = "[x]" if task.completed else "[ ]"
            task_list.append(f"{status} {task.title}")

        task_str = "\n".join(task_list)
        count_msg = f" (showing 10 of {len(tasks)})" if len(tasks) > 10 else ""

        return ChatbotResponse(
            message=f"Your {filter_type} tasks{count_msg}:\n\n{task_str}",
            intent="list",
            success=True,
            data=[{"id": t.id, "title": t.title, "completed": t.completed} for t in tasks[:10]],
            suggestions=["Show pending tasks", "Show completed tasks", "Add task: "],
        )

    @classmethod
    def _handle_complete(
        cls,
        session: Session,
        user_id: str,
        task_title: Optional[str],
    ) -> ChatbotResponse:
        """Handle complete task intent."""
        if not task_title:
            return ChatbotResponse(
                message="Please specify which task to complete. Example: 'Complete: Buy groceries'",
                intent="complete",
                success=False,
                suggestions=["Show my tasks", "Complete: "],
            )

        task = TaskService.get_task_by_title(session, task_title, user_id)

        if not task:
            return ChatbotResponse(
                message=f"Couldn't find a task matching '{task_title}'.",
                intent="complete",
                success=False,
                suggestions=["Show my tasks", "Add task: " + task_title],
            )

        if task.completed:
            return ChatbotResponse(
                message=f"Task '{task.title}' is already completed!",
                intent="complete",
                success=True,
                data={"id": task.id, "title": task.title, "completed": task.completed},
                suggestions=["Show my tasks", "Delete: " + task.title],
            )

        TaskService.update_task(session, task, completed=True)

        return ChatbotResponse(
            message=f"Task '{task.title}' marked as complete!",
            intent="complete",
            success=True,
            data={"id": task.id, "title": task.title, "completed": True},
            suggestions=["Show my tasks", "Show pending tasks", "Add task: "],
        )

    @classmethod
    def _handle_delete(
        cls,
        session: Session,
        user_id: str,
        task_title: Optional[str],
    ) -> ChatbotResponse:
        """Handle delete task intent."""
        if not task_title:
            return ChatbotResponse(
                message="Please specify which task to delete. Example: 'Delete: Buy groceries'",
                intent="delete",
                success=False,
                suggestions=["Show my tasks", "Delete: "],
            )

        task = TaskService.get_task_by_title(session, task_title, user_id)

        if not task:
            return ChatbotResponse(
                message=f"Couldn't find a task matching '{task_title}'.",
                intent="delete",
                success=False,
                suggestions=["Show my tasks"],
            )

        title = task.title
        TaskService.delete_task(session, task)

        return ChatbotResponse(
            message=f"Task '{title}' deleted!",
            intent="delete",
            success=True,
            suggestions=["Show my tasks", "Add task: "],
        )

    @classmethod
    def _handle_unknown(cls) -> ChatbotResponse:
        """Handle unknown intent."""
        return ChatbotResponse(
            message="I didn't understand that. Try 'Help' to see what I can do!",
            intent="unknown",
            success=False,
            suggestions=["Help", "Show my tasks", "Add task: "],
        )
