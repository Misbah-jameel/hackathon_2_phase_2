"""Tests for app.services.task_service — CRUD + fuzzy matching."""

import pytest
from sqlmodel import Session

from app.services.task_service import TaskService
from app.models.user import User
from app.models.task import Task


class TestGetTasksByUser:
    def test_with_data(self, db_session: Session, test_user: User, sample_tasks):
        tasks = TaskService.get_tasks_by_user(db_session, test_user.id)
        assert len(tasks) == 3

    def test_empty(self, db_session: Session, test_user: User):
        tasks = TaskService.get_tasks_by_user(db_session, test_user.id)
        assert tasks == []

    def test_isolation(self, db_session: Session, test_user: User, other_user: User, sample_tasks):
        """Other user should not see test_user's tasks."""
        tasks = TaskService.get_tasks_by_user(db_session, other_user.id)
        assert len(tasks) == 0


class TestGetTaskById:
    def test_found(self, db_session: Session, test_user: User, sample_tasks):
        task = TaskService.get_task_by_id(db_session, sample_tasks[0].id, test_user.id)
        assert task is not None
        assert task.title == "Buy groceries"

    def test_wrong_user(self, db_session: Session, other_user: User, sample_tasks):
        task = TaskService.get_task_by_id(db_session, sample_tasks[0].id, other_user.id)
        assert task is None

    def test_nonexistent(self, db_session: Session, test_user: User):
        task = TaskService.get_task_by_id(db_session, "no-such-id", test_user.id)
        assert task is None


class TestGetTaskByTitle:
    def test_exact_match(self, db_session: Session, test_user: User, sample_tasks):
        task = TaskService.get_task_by_title(db_session, "Buy groceries", test_user.id)
        assert task is not None
        assert task.title == "Buy groceries"

    def test_case_insensitive(self, db_session: Session, test_user: User, sample_tasks):
        task = TaskService.get_task_by_title(db_session, "buy GROCERIES", test_user.id)
        assert task is not None

    def test_not_found(self, db_session: Session, test_user: User, sample_tasks):
        task = TaskService.get_task_by_title(db_session, "Nonexistent task", test_user.id)
        assert task is None


class TestFindTaskByTitle:
    def test_exact_match(self, db_session: Session, test_user: User, sample_tasks):
        match_type, task, candidates = TaskService.find_task_by_title(
            db_session, "Buy groceries", test_user.id
        )
        assert match_type == "exact"
        assert task is not None
        assert task.title == "Buy groceries"
        assert candidates == []

    def test_fuzzy_match(self, db_session: Session, test_user: User):
        """Use a single task so fuzzy match is unambiguous."""
        TaskService.create_task(db_session, test_user.id, "Buy groceries")
        match_type, task, candidates = TaskService.find_task_by_title(
            db_session, "buy groceri", test_user.id
        )
        assert match_type in ("exact", "fuzzy")
        assert task is not None
        assert task.title == "Buy groceries"

    def test_no_match(self, db_session: Session, test_user: User, sample_tasks):
        match_type, task, candidates = TaskService.find_task_by_title(
            db_session, "completely unrelated xyz", test_user.id
        )
        assert match_type == "none"
        assert task is None
        assert candidates == []

    def test_no_tasks(self, db_session: Session, test_user: User):
        match_type, task, candidates = TaskService.find_task_by_title(
            db_session, "anything", test_user.id
        )
        assert match_type == "none"
        assert task is None

    def test_ambiguous_match(self, db_session: Session, test_user: User):
        """Create tasks with similar names to trigger ambiguous result."""
        TaskService.create_task(db_session, test_user.id, "Buy apples from store")
        TaskService.create_task(db_session, test_user.id, "Buy oranges from store")
        TaskService.create_task(db_session, test_user.id, "Buy bananas from store")

        match_type, task, candidates = TaskService.find_task_by_title(
            db_session, "buy from store", test_user.id
        )
        # With very similar titles, should be ambiguous
        assert match_type in ("ambiguous", "fuzzy")
        if match_type == "ambiguous":
            assert len(candidates) >= 2


class TestCreateTask:
    def test_creates_task(self, db_session: Session, test_user: User):
        task = TaskService.create_task(
            db_session, test_user.id, "New task", "A description"
        )
        assert task.title == "New task"
        assert task.description == "A description"
        assert task.completed is False
        assert task.user_id == test_user.id
        assert task.id is not None

    def test_creates_task_without_description(self, db_session: Session, test_user: User):
        task = TaskService.create_task(db_session, test_user.id, "No desc")
        assert task.description is None


class TestUpdateTask:
    def test_update_title(self, db_session: Session, test_user: User, sample_tasks):
        updated = TaskService.update_task(db_session, sample_tasks[0], title="Updated title")
        assert updated.title == "Updated title"

    def test_update_completed(self, db_session: Session, test_user: User, sample_tasks):
        updated = TaskService.update_task(db_session, sample_tasks[0], completed=True)
        assert updated.completed is True

    def test_update_description(self, db_session: Session, test_user: User, sample_tasks):
        updated = TaskService.update_task(db_session, sample_tasks[1], description="New desc")
        assert updated.description == "New desc"

    def test_partial_update_preserves_other_fields(self, db_session: Session, test_user: User, sample_tasks):
        original_title = sample_tasks[0].title
        updated = TaskService.update_task(db_session, sample_tasks[0], completed=True)
        assert updated.title == original_title


class TestDeleteTask:
    def test_deletes_task(self, db_session: Session, test_user: User, sample_tasks):
        task_id = sample_tasks[0].id
        TaskService.delete_task(db_session, sample_tasks[0])
        found = TaskService.get_task_by_id(db_session, task_id, test_user.id)
        assert found is None


class TestToggleTask:
    def test_toggle_pending_to_completed(self, db_session: Session, test_user: User, sample_tasks):
        assert sample_tasks[0].completed is False
        toggled = TaskService.toggle_task(db_session, sample_tasks[0])
        assert toggled.completed is True

    def test_toggle_completed_to_pending(self, db_session: Session, test_user: User, sample_tasks):
        assert sample_tasks[2].completed is True
        toggled = TaskService.toggle_task(db_session, sample_tasks[2])
        assert toggled.completed is False


class TestGetPendingTasks:
    def test_returns_only_pending(self, db_session: Session, test_user: User, sample_tasks):
        pending = TaskService.get_pending_tasks(db_session, test_user.id)
        assert len(pending) == 2
        assert all(not t.completed for t in pending)


class TestGetCompletedTasks:
    def test_returns_only_completed(self, db_session: Session, test_user: User, sample_tasks):
        completed = TaskService.get_completed_tasks(db_session, test_user.id)
        assert len(completed) == 1
        assert all(t.completed for t in completed)
