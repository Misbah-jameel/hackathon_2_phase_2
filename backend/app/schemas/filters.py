from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


VALID_SORT_FIELDS = {"created_at", "updated_at", "due_date", "priority", "title"}
VALID_SORT_ORDERS = {"asc", "desc"}


class TaskQueryParams(BaseModel):
    """Query parameters for filtering, sorting, and searching tasks."""
    search: Optional[str] = None
    priority: Optional[str] = None  # Comma-separated: "high,medium"
    tags: Optional[str] = None  # Comma-separated: "work,urgent"
    status: Optional[str] = None  # "pending" or "completed"
    due_before: Optional[datetime] = None
    due_after: Optional[datetime] = None
    sort_by: str = "created_at"
    sort_order: str = "desc"
    page: int = 1
    page_size: int = 20

    @field_validator("sort_by")
    @classmethod
    def validate_sort_by(cls, v: str) -> str:
        if v not in VALID_SORT_FIELDS:
            raise ValueError(f"sort_by must be one of: {VALID_SORT_FIELDS}")
        return v

    @field_validator("sort_order")
    @classmethod
    def validate_sort_order(cls, v: str) -> str:
        v = v.lower()
        if v not in VALID_SORT_ORDERS:
            raise ValueError(f"sort_order must be one of: {VALID_SORT_ORDERS}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.lower()
            if v not in {"pending", "completed"}:
                raise ValueError("status must be 'pending' or 'completed'")
        return v

    @property
    def priority_list(self) -> List[str]:
        if self.priority:
            return [p.strip().lower() for p in self.priority.split(",")]
        return []

    @property
    def tags_list(self) -> List[str]:
        if self.tags:
            return [t.strip().lower() for t in self.tags.split(",")]
        return []
