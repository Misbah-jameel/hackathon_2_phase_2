from typing import List, Optional
from datetime import datetime
from sqlmodel import Session, select

from ..models.task import Task


class TaskService:
    """Service for task CRUD operations."""

    @staticmethod
    def get_tasks_by_user(session: Session, user_id: str) -> List[Task]:
        """Get all tasks for a user."""
        statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
        return list(session.exec(statement).all())

    @staticmethod
    def get_task_by_id(session: Session, task_id: str, user_id: str) -> Optional[Task]:
        """Get a task by ID (must belong to user)."""
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        return session.exec(statement).first()

    @staticmethod
    def get_task_by_title(session: Session, title: str, user_id: str) -> Optional[Task]:
        """Get a task by title (case-insensitive partial match, must belong to user)."""
        # Use lower() for case-insensitive search (works with both SQLite and PostgreSQL)
        from sqlalchemy import func
        statement = select(Task).where(
            func.lower(Task.title).contains(title.lower()),
            Task.user_id == user_id
        )
        return session.exec(statement).first()

    @staticmethod
    def create_task(
        session: Session,
        user_id: str,
        title: str,
        description: Optional[str] = None,
    ) -> Task:
        """Create a new task."""
        task = Task(
            title=title,
            description=description,
            user_id=user_id,
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

    @staticmethod
    def update_task(
        session: Session,
        task: Task,
        title: Optional[str] = None,
        description: Optional[str] = None,
        completed: Optional[bool] = None,
    ) -> Task:
        """Update a task."""
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if completed is not None:
            task.completed = completed
        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

    @staticmethod
    def delete_task(session: Session, task: Task) -> None:
        """Delete a task."""
        session.delete(task)
        session.commit()

    @staticmethod
    def toggle_task(session: Session, task: Task) -> Task:
        """Toggle a task's completion status."""
        task.completed = not task.completed
        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

    @staticmethod
    def get_pending_tasks(session: Session, user_id: str) -> List[Task]:
        """Get all pending (incomplete) tasks for a user."""
        statement = select(Task).where(
            Task.user_id == user_id,
            Task.completed == False
        ).order_by(Task.created_at.desc())
        return list(session.exec(statement).all())

    @staticmethod
    def get_completed_tasks(session: Session, user_id: str) -> List[Task]:
        """Get all completed tasks for a user."""
        statement = select(Task).where(
            Task.user_id == user_id,
            Task.completed == True
        ).order_by(Task.created_at.desc())
        return list(session.exec(statement).all())
