import logging
from datetime import datetime, timedelta
from fastapi import APIRouter, Request
from sqlmodel import Session

from ..database import engine
from ..models.task import Task
from ..services.task_service import TaskService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["consumers"])


def compute_next_due_date(pattern: str, current_due: datetime) -> datetime:
    """Compute the next due date based on recurrence pattern."""
    if pattern == "daily":
        return current_due + timedelta(days=1)
    elif pattern == "weekly":
        return current_due + timedelta(weeks=1)
    elif pattern == "monthly":
        # Add roughly one month
        month = current_due.month + 1
        year = current_due.year
        if month > 12:
            month = 1
            year += 1
        try:
            return current_due.replace(year=year, month=month)
        except ValueError:
            # Handle edge case like Jan 31 → Feb 28
            return current_due.replace(year=year, month=month, day=28)
    else:
        # Default: next day
        return current_due + timedelta(days=1)


@router.post("/api/events/task-updates")
async def handle_task_update(request: Request):
    """Dapr subscription handler for task-updates topic.
    Generates new task instances from recurring tasks when completed.
    """
    try:
        cloud_event = await request.json()
        data = cloud_event.get("data", cloud_event)

        event_type = data.get("event_type", "")
        task_id = data.get("task_id", "")
        payload = data.get("payload", {})

        # Only process task.completed events for recurring tasks
        if event_type != "task.completed":
            return {"status": "DROP"}

        if not payload.get("recurrence_enabled"):
            return {"status": "DROP"}

        # Get the completed task
        with Session(engine) as session:
            task = session.get(Task, task_id)
            if not task:
                logger.info(f"Task {task_id} not found, skipping recurrence")
                return {"status": "DROP"}

            if not task.recurrence_enabled:
                logger.info(f"Task {task_id} recurrence disabled, skipping")
                return {"status": "DROP"}

            # Compute next due date
            new_due_date = None
            if task.due_date and task.recurrence_pattern:
                new_due_date = compute_next_due_date(
                    task.recurrence_pattern, task.due_date
                )

            # Create new task instance
            new_task = TaskService.create_recurring_instance(
                session, task, new_due_date
            )
            logger.info(
                f"Recurring task created: {new_task.id} from parent {task_id}, "
                f"due: {new_due_date}"
            )

        return {"status": "SUCCESS"}

    except Exception as e:
        logger.error(f"Error processing recurrence: {e}")
        return {"status": "RETRY"}
