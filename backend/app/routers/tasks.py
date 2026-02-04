from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlmodel import Session

from ..database import get_session
from ..services.task_service import TaskService
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse
from ..dependencies.auth import get_current_user
from ..models.user import User


router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def task_to_response(task) -> TaskResponse:
    """Convert a Task model to TaskResponse schema."""
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        userId=task.user_id,
        createdAt=task.created_at,
        updatedAt=task.updated_at,
    )


@router.get("", response_model=List[TaskResponse])
async def get_tasks(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get all tasks for the current user."""
    tasks = TaskService.get_tasks_by_user(session, current_user.id)
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
    )
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
    )
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
    return task_to_response(toggled_task)
