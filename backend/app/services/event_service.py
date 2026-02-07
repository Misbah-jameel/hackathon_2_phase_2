import logging
from typing import Dict, Any

from ..schemas.events import TaskEvent, EventType
from .dapr_client import DaprClient

logger = logging.getLogger(__name__)


class EventService:
    """Service for publishing task lifecycle events via Dapr pub/sub."""

    TOPIC_TASK_EVENTS = "task-events"
    TOPIC_REMINDERS = "reminders"
    TOPIC_TASK_UPDATES = "task-updates"

    @staticmethod
    async def publish_task_created(user_id: str, task) -> bool:
        """Publish a task.created event."""
        event = TaskEvent.create(
            event_type=EventType.TASK_CREATED,
            user_id=user_id,
            task_id=task.id,
            payload={
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "tags": [t.strip() for t in task.tags.split(",") if t.strip()] if task.tags else [],
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "recurrence_pattern": task.recurrence_pattern,
            },
        )
        return await DaprClient.publish_event(
            EventService.TOPIC_TASK_EVENTS, event.model_dump()
        )

    @staticmethod
    async def publish_task_updated(user_id: str, task) -> bool:
        """Publish a task.updated event."""
        event = TaskEvent.create(
            event_type=EventType.TASK_UPDATED,
            user_id=user_id,
            task_id=task.id,
            payload={
                "title": task.title,
                "priority": task.priority,
                "tags": [t.strip() for t in task.tags.split(",") if t.strip()] if task.tags else [],
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "completed": task.completed,
            },
        )
        return await DaprClient.publish_event(
            EventService.TOPIC_TASK_EVENTS, event.model_dump()
        )

    @staticmethod
    async def publish_task_completed(user_id: str, task) -> bool:
        """Publish a task.completed event."""
        event = TaskEvent.create(
            event_type=EventType.TASK_COMPLETED,
            user_id=user_id,
            task_id=task.id,
            payload={
                "completed_at": task.updated_at.isoformat() if task.updated_at else None,
                "was_overdue": (
                    task.due_date is not None
                    and task.due_date < task.updated_at
                ) if task.due_date and task.updated_at else False,
                "recurrence_enabled": task.recurrence_enabled,
                "recurrence_pattern": task.recurrence_pattern,
            },
        )
        # Publish to task-events for audit
        await DaprClient.publish_event(
            EventService.TOPIC_TASK_EVENTS, event.model_dump()
        )
        # Also publish to task-updates for recurrence consumer
        if task.recurrence_enabled:
            await DaprClient.publish_event(
                EventService.TOPIC_TASK_UPDATES, event.model_dump()
            )
        return True

    @staticmethod
    async def publish_task_deleted(user_id: str, task) -> bool:
        """Publish a task.deleted event."""
        event = TaskEvent.create(
            event_type=EventType.TASK_DELETED,
            user_id=user_id,
            task_id=task.id,
            payload={
                "reason": "user_initiated",
            },
        )
        return await DaprClient.publish_event(
            EventService.TOPIC_TASK_EVENTS, event.model_dump()
        )

    @staticmethod
    async def publish_reminder_trigger(user_id: str, task) -> bool:
        """Publish a reminder trigger event."""
        from datetime import datetime

        minutes_until_due = 0
        if task.due_date:
            delta = task.due_date - datetime.utcnow()
            minutes_until_due = max(0, int(delta.total_seconds() / 60))

        event = TaskEvent.create(
            event_type=EventType.REMINDER_TRIGGER,
            user_id=user_id,
            task_id=task.id,
            payload={
                "task_title": task.title,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "minutes_until_due": minutes_until_due,
            },
        )
        return await DaprClient.publish_event(
            EventService.TOPIC_REMINDERS, event.model_dump()
        )
