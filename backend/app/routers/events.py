from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from sqlmodel import Session, select

from ..database import get_session
from ..models.audit_log import AuditLog
from ..schemas.events import AuditLogResponse
from ..dependencies.auth import get_current_user
from ..models.user import User

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("/audit", response_model=List[AuditLogResponse])
async def get_audit_trail(
    task_id: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get audit trail for a task or user."""
    statement = select(AuditLog).where(AuditLog.user_id == current_user.id)

    if task_id:
        statement = statement.where(AuditLog.task_id == task_id)
    if event_type:
        statement = statement.where(AuditLog.event_type == event_type)

    statement = statement.order_by(AuditLog.timestamp.desc()).limit(limit)
    logs = list(session.exec(statement).all())

    return [
        AuditLogResponse(
            id=log.id,
            eventId=log.event_id,
            eventType=log.event_type,
            userId=log.user_id,
            taskId=log.task_id,
            timestamp=log.timestamp,
            payloadSnapshot=log.payload_snapshot,
            createdAt=log.created_at,
        )
        for log in logs
    ]
