from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid


class AuditLog(SQLModel, table=True):
    """Audit log model for recording task lifecycle events."""

    __tablename__ = "audit_logs"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )
    event_id: str = Field(index=True)
    event_type: str = Field(index=True)
    user_id: str = Field(index=True)
    task_id: str = Field(index=True)
    timestamp: datetime
    payload_snapshot: str  # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow)
