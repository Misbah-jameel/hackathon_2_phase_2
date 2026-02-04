from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TaskCreate(BaseModel):
    """Task creation request schema."""
    title: str
    description: Optional[str] = None


class TaskUpdate(BaseModel):
    """Task update request schema."""
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None


class TaskResponse(BaseModel):
    """Task response schema."""
    id: str
    title: str
    description: Optional[str]
    completed: bool
    userId: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True
