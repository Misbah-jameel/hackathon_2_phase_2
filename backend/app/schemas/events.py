from pydantic import BaseModel
from typing import Any, Dict, Optional
from datetime import datetime
from enum import Enum
import uuid


class EventType(str, Enum):
    """Task lifecycle event types."""
    TASK_CREATED = "task.created"
    TASK_UPDATED = "task.updated"
    TASK_COMPLETED = "task.completed"
    TASK_DELETED = "task.deleted"
    REMINDER_TRIGGER = "reminder.trigger"
    RECURRENCE_GENERATE = "recurrence.generate"


class TaskEvent(BaseModel):
    """Event envelope for task lifecycle events."""
    event_id: str
    event_type: str
    timestamp: str  # ISO-8601
    version: int = 1
    user_id: str
    task_id: str
    payload: Dict[str, Any]

    @classmethod
    def create(
        cls,
        event_type: EventType,
        user_id: str,
        task_id: str,
        payload: Dict[str, Any],
    ) -> "TaskEvent":
        return cls(
            event_id=str(uuid.uuid4()),
            event_type=event_type.value,
            timestamp=datetime.utcnow().isoformat() + "Z",
            version=1,
            user_id=user_id,
            task_id=task_id,
            payload=payload,
        )


class AuditLogResponse(BaseModel):
    """Audit log entry response schema."""
    id: str
    eventId: str
    eventType: str
    userId: str
    taskId: str
    timestamp: datetime
    payloadSnapshot: str
    createdAt: datetime

    class Config:
        from_attributes = True
