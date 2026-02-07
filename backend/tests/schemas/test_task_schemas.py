"""Tests for app.schemas.task — TaskCreate, TaskUpdate, TaskResponse."""

import pytest
from pydantic import ValidationError
from datetime import datetime
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse


class TestTaskCreate:
    def test_with_title_only(self):
        tc = TaskCreate(title="Buy milk")
        assert tc.title == "Buy milk"
        assert tc.description is None

    def test_with_title_and_description(self):
        tc = TaskCreate(title="Buy milk", description="From the store")
        assert tc.description == "From the store"

    def test_missing_title(self):
        with pytest.raises(ValidationError):
            TaskCreate()

    def test_with_priority(self):
        tc = TaskCreate(title="Urgent task", priority="high")
        assert tc.priority == "high"

    def test_invalid_priority(self):
        with pytest.raises(ValidationError):
            TaskCreate(title="Task", priority="critical")

    def test_with_tags(self):
        tc = TaskCreate(title="Task", tags=["work", "urgent"])
        assert tc.tags == ["work", "urgent"]

    def test_too_many_tags(self):
        with pytest.raises(ValidationError):
            TaskCreate(title="Task", tags=[f"tag{i}" for i in range(11)])


class TestTaskUpdate:
    def test_partial_update_title(self):
        tu = TaskUpdate(title="Updated")
        assert tu.title == "Updated"
        assert tu.description is None
        assert tu.completed is None

    def test_partial_update_completed(self):
        tu = TaskUpdate(completed=True)
        assert tu.completed is True
        assert tu.title is None

    def test_empty_update(self):
        tu = TaskUpdate()
        assert tu.title is None
        assert tu.description is None
        assert tu.completed is None

    def test_update_priority(self):
        tu = TaskUpdate(priority="medium")
        assert tu.priority == "medium"


class TestTaskResponse:
    def test_valid_response(self):
        now = datetime.utcnow()
        tr = TaskResponse(
            id="t1",
            title="Task",
            description="Desc",
            completed=False,
            userId="u1",
            priority="none",
            tags=[],
            dueDate=None,
            reminderAt=None,
            recurrencePattern=None,
            recurrenceEnabled=False,
            parentTaskId=None,
            isOverdue=False,
            createdAt=now,
            updatedAt=now,
        )
        assert tr.id == "t1"
        assert tr.completed is False
        assert tr.userId == "u1"
        assert tr.priority == "none"
        assert tr.tags == []

    def test_null_description(self):
        now = datetime.utcnow()
        tr = TaskResponse(
            id="t1",
            title="Task",
            description=None,
            completed=True,
            userId="u1",
            priority="high",
            tags=["work"],
            dueDate=None,
            reminderAt=None,
            recurrencePattern=None,
            recurrenceEnabled=False,
            parentTaskId=None,
            isOverdue=False,
            createdAt=now,
            updatedAt=now,
        )
        assert tr.description is None
        assert tr.priority == "high"
        assert tr.tags == ["work"]
