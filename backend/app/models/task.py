from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid


class Task(SQLModel, table=True):
    """Task model for todo items."""

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
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
