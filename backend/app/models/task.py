from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid


class Task(SQLModel, table=True):
    """Task model for todo items with advanced features."""

    __tablename__ = "tasks"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )
    title: str
    description: Optional[str] = None
    completed: bool = Field(default=False)
    user_id: str = Field(foreign_key="users.id", index=True)

    # Phase V: Priority & Organization
    priority: str = Field(default="none")  # high, medium, low, none
    tags: str = Field(default="")  # Comma-separated tags

    # Phase V: Due Dates & Reminders
    due_date: Optional[datetime] = None
    reminder_at: Optional[datetime] = None
    reminder_minutes_before: int = Field(default=15)

    # Phase V: Recurring Tasks
    recurrence_pattern: Optional[str] = None  # daily, weekly, monthly, custom
    recurrence_cron: Optional[str] = None  # Cron expression for custom
    recurrence_enabled: bool = Field(default=False)
    parent_task_id: Optional[str] = Field(default=None)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
