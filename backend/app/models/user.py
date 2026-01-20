from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid


class User(SQLModel, table=True):
    """User model for authentication."""

    __tablename__ = "users"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )
    email: str = Field(unique=True, index=True)
    name: str
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
