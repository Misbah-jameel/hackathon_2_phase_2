from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


VALID_PRIORITIES = {"high", "medium", "low", "none"}
VALID_RECURRENCE_PATTERNS = {"daily", "weekly", "monthly", "custom"}


class TaskCreate(BaseModel):
    """Task creation request schema."""
    title: str
    description: Optional[str] = None
    priority: str = "none"
    tags: List[str] = []
    due_date: Optional[datetime] = None
    reminder_minutes_before: int = 15
    recurrence_pattern: Optional[str] = None
    recurrence_cron: Optional[str] = None

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        v = v.lower()
        if v not in VALID_PRIORITIES:
            raise ValueError(f"Priority must be one of: {VALID_PRIORITIES}")
        return v

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        if len(v) > 10:
            raise ValueError("Maximum 10 tags per task")
        for tag in v:
            if len(tag) > 30:
                raise ValueError(f"Tag '{tag}' exceeds 30 character limit")
            if len(tag) < 1:
                raise ValueError("Tags cannot be empty strings")
        return v

    @field_validator("recurrence_pattern")
    @classmethod
    def validate_recurrence(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.lower()
            if v not in VALID_RECURRENCE_PATTERNS:
                raise ValueError(f"Recurrence pattern must be one of: {VALID_RECURRENCE_PATTERNS}")
        return v


class TaskUpdate(BaseModel):
    """Task update request schema."""
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    reminder_minutes_before: Optional[int] = None
    recurrence_pattern: Optional[str] = None
    recurrence_cron: Optional[str] = None
    recurrence_enabled: Optional[bool] = None

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.lower()
            if v not in VALID_PRIORITIES:
                raise ValueError(f"Priority must be one of: {VALID_PRIORITIES}")
        return v

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is not None:
            if len(v) > 10:
                raise ValueError("Maximum 10 tags per task")
            for tag in v:
                if len(tag) > 30:
                    raise ValueError(f"Tag '{tag}' exceeds 30 character limit")
        return v

    @field_validator("recurrence_pattern")
    @classmethod
    def validate_recurrence(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.lower()
            if v not in VALID_RECURRENCE_PATTERNS:
                raise ValueError(f"Recurrence pattern must be one of: {VALID_RECURRENCE_PATTERNS}")
        return v


class TaskResponse(BaseModel):
    """Task response schema."""
    id: str
    title: str
    description: Optional[str]
    completed: bool
    userId: str
    priority: str
    tags: List[str]
    dueDate: Optional[datetime]
    reminderAt: Optional[datetime]
    recurrencePattern: Optional[str]
    recurrenceEnabled: bool
    parentTaskId: Optional[str]
    isOverdue: bool
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True
