import json
import logging
from datetime import datetime
from fastapi import APIRouter, Request
from sqlmodel import Session, select

from ..database import engine
from ..models.audit_log import AuditLog

logger = logging.getLogger(__name__)

router = APIRouter(tags=["consumers"])


@router.post("/api/events/task-events")
async def handle_task_event(request: Request):
    """Dapr subscription handler for task-events topic.
    Records all task lifecycle events to the audit log.
    """
    try:
        cloud_event = await request.json()

        # Dapr wraps events in CloudEvents envelope
        data = cloud_event.get("data", cloud_event)

        event_id = data.get("event_id", "")
        event_type = data.get("event_type", "")
        user_id = data.get("user_id", "")
        task_id = data.get("task_id", "")
        timestamp_str = data.get("timestamp", "")
        payload = data.get("payload", {})

        # Idempotency check: skip if event_id already recorded
        with Session(engine) as session:
            existing = session.exec(
                select(AuditLog).where(AuditLog.event_id == event_id)
            ).first()
            if existing:
                logger.info(f"Audit log already exists for event {event_id}, skipping")
                return {"status": "DUPLICATE"}

            # Parse timestamp
            try:
                timestamp = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
            except (ValueError, AttributeError):
                timestamp = datetime.utcnow()

            # Create audit log entry
            audit_log = AuditLog(
                event_id=event_id,
                event_type=event_type,
                user_id=user_id,
                task_id=task_id,
                timestamp=timestamp,
                payload_snapshot=json.dumps(payload),
            )
            session.add(audit_log)
            session.commit()
            logger.info(f"Audit log recorded: {event_type} for task {task_id}")

        return {"status": "SUCCESS"}

    except Exception as e:
        logger.error(f"Error processing task event: {e}")
        return {"status": "RETRY"}
