from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime
from sqlmodel import Session

from ..database import get_session
from ..services.task_service import TaskService
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse
from ..schemas.filters import TaskQueryParams
from ..dependencies.auth import get_current_user
from ..models.user import User


router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def task_to_response(task) -> TaskResponse:
    """Convert a Task model to TaskResponse schema."""
    tags_list = [t.strip() for t in task.tags.split(",") if t.strip()] if task.tags else []
    is_overdue = (
        task.due_date is not None
        and task.due_date < datetime.utcnow()
        and not task.completed
    )

    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        userId=task.user_id,
        priority=task.priority,
        tags=tags_list,
        dueDate=task.due_date,
        reminderAt=task.reminder_at,
        recurrencePattern=task.recurrence_pattern,
        recurrenceEnabled=task.recurrence_enabled,
        parentTaskId=task.parent_task_id,
        isOverdue=is_overdue,
        createdAt=task.created_at,
        updatedAt=task.updated_at,
    )


@router.get("", response_model=List[TaskResponse])
async def get_tasks(
    search: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    task_status: Optional[str] = Query(None, alias="status"),
    due_before: Optional[datetime] = Query(None),
    due_after: Optional[datetime] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get all tasks for the current user with search, filter, sort, and pagination."""
    params = TaskQueryParams(
        search=search,
        priority=priority,
        tags=tags,
        status=task_status,
        due_before=due_before,
        due_after=due_after,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )
    tasks, total = TaskService.get_tasks_filtered(session, current_user.id, params)
    return [task_to_response(t) for t in tasks]


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    input: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Create a new task."""
    task = TaskService.create_task(
        session,
        user_id=current_user.id,
        title=input.title,
        description=input.description,
        priority=input.priority,
        tags=input.tags if input.tags else None,
        due_date=input.due_date,
        reminder_minutes_before=input.reminder_minutes_before,
        recurrence_pattern=input.recurrence_pattern,
        recurrence_cron=input.recurrence_cron,
    )

    # Publish event (fire-and-forget, import here to avoid circular)
    try:
        from ..services.event_service import EventService
        await EventService.publish_task_created(current_user.id, task)
    except Exception:
        pass  # Don't fail request if event publish fails

    return task_to_response(task)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get a specific task by ID."""
    task = TaskService.get_task_by_id(session, task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task_to_response(task)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    input: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Update a task."""
    task = TaskService.get_task_by_id(session, task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    updated_task = TaskService.update_task(
        session,
        task,
        title=input.title,
        description=input.description,
        completed=input.completed,
        priority=input.priority,
        tags=input.tags,
        due_date=input.due_date,
        reminder_minutes_before=input.reminder_minutes_before,
        recurrence_pattern=input.recurrence_pattern,
        recurrence_cron=input.recurrence_cron,
        recurrence_enabled=input.recurrence_enabled,
    )

    # Publish event
    try:
        from ..services.event_service import EventService
        if input.completed is True and updated_task.completed:
            await EventService.publish_task_completed(current_user.id, updated_task)
        else:
            await EventService.publish_task_updated(current_user.id, updated_task)
    except Exception:
        pass

    return task_to_response(updated_task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Delete a task."""
    task = TaskService.get_task_by_id(session, task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Publish event before delete
    try:
        from ..services.event_service import EventService
        await EventService.publish_task_deleted(current_user.id, task)
    except Exception:
        pass

    TaskService.delete_task(session, task)
    return None


@router.patch("/{task_id}/toggle", response_model=TaskResponse)
async def toggle_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Toggle a task's completion status."""
    task = TaskService.get_task_by_id(session, task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    toggled_task = TaskService.toggle_task(session, task)

    # Publish event
    try:
        from ..services.event_service import EventService
        if toggled_task.completed:
            await EventService.publish_task_completed(current_user.id, toggled_task)
        else:
            await EventService.publish_task_updated(current_user.id, toggled_task)
    except Exception:
        pass

    return task_to_response(toggled_task)


@router.post("/{task_id}/reminder", response_model=TaskResponse)
async def schedule_reminder(
    task_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Manually schedule/reschedule a reminder for a task."""
    task = TaskService.get_task_by_id(session, task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    if not task.due_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task has no due date",
        )

    updated_task = TaskService.update_task(
        session, task, due_date=task.due_date,
        reminder_minutes_before=task.reminder_minutes_before,
    )

    # Schedule via Dapr Jobs API
    try:
        from ..services.reminder_service import ReminderService
        if updated_task.reminder_at:
            await ReminderService.schedule_reminder(
                task_id=updated_task.id,
                user_id=current_user.id,
                fire_at=updated_task.reminder_at,
            )
    except Exception:
        pass

    return task_to_response(updated_task)


@router.delete("/{task_id}/recurrence", response_model=TaskResponse)
async def disable_recurrence(
    task_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Disable recurrence on a task."""
    task = TaskService.get_task_by_id(session, task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    updated_task = TaskService.update_task(
        session, task,
        recurrence_enabled=False,
        recurrence_pattern=None,
        recurrence_cron=None,
    )
    return task_to_response(updated_task)
