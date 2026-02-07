from typing import List, Optional, Tuple, Literal, Dict, Any
from datetime import datetime, timedelta
from sqlmodel import Session, select
from sqlalchemy import func, or_
from rapidfuzz import fuzz

from ..models.task import Task
from ..schemas.filters import TaskQueryParams


# Type alias for match result type
MatchType = Literal["exact", "fuzzy", "ambiguous", "none"]

# Priority sort order mapping
PRIORITY_ORDER = {"high": 3, "medium": 2, "low": 1, "none": 0}


class TaskService:
    """Service for task CRUD operations with advanced features."""

    # Fuzzy matching thresholds
    FUZZY_THRESHOLD = 80
    CONFIDENT_THRESHOLD = 95

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
        """Get a task by title (case-insensitive exact match only)."""
        statement = select(Task).where(
            func.lower(Task.title) == title.lower(),
            Task.user_id == user_id
        )
        return session.exec(statement).first()

    @staticmethod
    def find_task_by_title(
        session: Session,
        title: str,
        user_id: str,
    ) -> Tuple[MatchType, Optional[Task], List[Task]]:
        """Find a task by title using fuzzy matching with disambiguation support."""
        search_title = title.strip().lower()

        all_tasks = TaskService.get_tasks_by_user(session, user_id)
        if not all_tasks:
            return ("none", None, [])

        for task in all_tasks:
            if task.title.lower() == search_title:
                return ("exact", task, [])

        matches = []
        for task in all_tasks:
            score = fuzz.token_set_ratio(search_title, task.title.lower())
            if score >= TaskService.FUZZY_THRESHOLD:
                matches.append((task, score))

        if not matches:
            return ("none", None, [])

        matches.sort(key=lambda x: x[1], reverse=True)

        best_task, best_score = matches[0]
        if best_score >= TaskService.CONFIDENT_THRESHOLD:
            if len(matches) == 1 or matches[1][1] < best_score - 10:
                return ("fuzzy", best_task, [])

        candidates = [task for task, score in matches[:5]]
        return ("ambiguous", None, candidates)

    @staticmethod
    def create_task(
        session: Session,
        user_id: str,
        title: str,
        description: Optional[str] = None,
        priority: str = "none",
        tags: Optional[List[str]] = None,
        due_date: Optional[datetime] = None,
        reminder_minutes_before: int = 15,
        recurrence_pattern: Optional[str] = None,
        recurrence_cron: Optional[str] = None,
    ) -> Task:
        """Create a new task with advanced features."""
        tags_str = ",".join(tags) if tags else ""

        # Compute reminder_at
        reminder_at = None
        if due_date:
            reminder_at = due_date - timedelta(minutes=reminder_minutes_before)

        # Set recurrence
        recurrence_enabled = recurrence_pattern is not None

        task = Task(
            title=title,
            description=description,
            user_id=user_id,
            priority=priority,
            tags=tags_str,
            due_date=due_date,
            reminder_at=reminder_at,
            reminder_minutes_before=reminder_minutes_before,
            recurrence_pattern=recurrence_pattern,
            recurrence_cron=recurrence_cron,
            recurrence_enabled=recurrence_enabled,
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
        priority: Optional[str] = None,
        tags: Optional[List[str]] = None,
        due_date: Optional[datetime] = None,
        reminder_minutes_before: Optional[int] = None,
        recurrence_pattern: Optional[str] = None,
        recurrence_cron: Optional[str] = None,
        recurrence_enabled: Optional[bool] = None,
    ) -> Task:
        """Update a task with advanced features."""
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if completed is not None:
            task.completed = completed
        if priority is not None:
            task.priority = priority
        if tags is not None:
            task.tags = ",".join(tags)
        if due_date is not None:
            task.due_date = due_date
        if reminder_minutes_before is not None:
            task.reminder_minutes_before = reminder_minutes_before
        if recurrence_pattern is not None:
            task.recurrence_pattern = recurrence_pattern
        if recurrence_cron is not None:
            task.recurrence_cron = recurrence_cron
        if recurrence_enabled is not None:
            task.recurrence_enabled = recurrence_enabled

        # Recompute reminder_at if due_date or reminder_minutes changed
        if task.due_date and (due_date is not None or reminder_minutes_before is not None):
            task.reminder_at = task.due_date - timedelta(minutes=task.reminder_minutes_before)

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

    @staticmethod
    def search_tasks(session: Session, user_id: str, query: str) -> List[Task]:
        """Search tasks by title and description (case-insensitive)."""
        search_pattern = f"%{query}%"
        statement = select(Task).where(
            Task.user_id == user_id,
            or_(
                func.lower(Task.title).like(func.lower(search_pattern)),
                func.lower(Task.description).like(func.lower(search_pattern)),
            )
        )
        return list(session.exec(statement).all())

    @staticmethod
    def get_tasks_filtered(
        session: Session,
        user_id: str,
        params: TaskQueryParams,
    ) -> Tuple[List[Task], int]:
        """Get tasks with search, filter, sort, and pagination."""
        statement = select(Task).where(Task.user_id == user_id)

        # Search filter
        if params.search:
            search_pattern = f"%{params.search}%"
            statement = statement.where(
                or_(
                    func.lower(Task.title).like(func.lower(search_pattern)),
                    func.lower(Task.description).like(func.lower(search_pattern)),
                )
            )

        # Status filter
        if params.status:
            if params.status == "completed":
                statement = statement.where(Task.completed == True)
            elif params.status == "pending":
                statement = statement.where(Task.completed == False)

        # Priority filter
        if params.priority_list:
            statement = statement.where(Task.priority.in_(params.priority_list))

        # Due date range filter
        if params.due_before:
            statement = statement.where(Task.due_date <= params.due_before)
        if params.due_after:
            statement = statement.where(Task.due_date >= params.due_after)

        # Get all matching for count (before pagination)
        all_results = list(session.exec(statement).all())

        # Tag filter (done in Python since tags are comma-separated)
        if params.tags_list:
            all_results = [
                task for task in all_results
                if any(
                    tag in [t.strip().lower() for t in task.tags.split(",") if t.strip()]
                    for tag in params.tags_list
                )
            ]

        # Sort
        sort_key = params.sort_by
        reverse = params.sort_order == "desc"

        if sort_key == "priority":
            all_results.sort(key=lambda t: PRIORITY_ORDER.get(t.priority, 0), reverse=reverse)
        elif sort_key == "due_date":
            # Tasks without due_date go to the end
            all_results.sort(
                key=lambda t: t.due_date if t.due_date else datetime.max,
                reverse=reverse,
            )
        elif sort_key == "title":
            all_results.sort(key=lambda t: t.title.lower(), reverse=reverse)
        elif sort_key == "updated_at":
            all_results.sort(key=lambda t: t.updated_at, reverse=reverse)
        else:  # created_at (default)
            all_results.sort(key=lambda t: t.created_at, reverse=reverse)

        total = len(all_results)

        # Pagination
        start = (params.page - 1) * params.page_size
        end = start + params.page_size
        paginated = all_results[start:end]

        return paginated, total

    @staticmethod
    def create_recurring_instance(
        session: Session,
        parent_task: Task,
        new_due_date: Optional[datetime] = None,
    ) -> Task:
        """Create a new instance from a recurring task."""
        task = Task(
            title=parent_task.title,
            description=parent_task.description,
            user_id=parent_task.user_id,
            priority=parent_task.priority,
            tags=parent_task.tags,
            due_date=new_due_date,
            reminder_minutes_before=parent_task.reminder_minutes_before,
            reminder_at=(
                new_due_date - timedelta(minutes=parent_task.reminder_minutes_before)
                if new_due_date else None
            ),
            recurrence_pattern=parent_task.recurrence_pattern,
            recurrence_cron=parent_task.recurrence_cron,
            recurrence_enabled=parent_task.recurrence_enabled,
            parent_task_id=parent_task.id,
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        return task
