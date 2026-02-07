import logging
from fastapi import APIRouter, Request
from sqlmodel import Session

from ..database import engine
from ..models.task import Task

logger = logging.getLogger(__name__)

router = APIRouter(tags=["consumers"])


@router.post("/api/events/reminders")
async def handle_reminder(request: Request):
    """Dapr subscription handler for reminders topic.
    Processes reminder triggers and publishes notifications.
    """
    try:
        cloud_event = await request.json()
        data = cloud_event.get("data", cloud_event)

        task_id = data.get("task_id", "")
        user_id = data.get("user_id", "")

        # Check if task is still pending (not completed)
        with Session(engine) as session:
            task = session.get(Task, task_id)
            if not task:
                logger.info(f"Task {task_id} not found, skipping reminder")
                return {"status": "DROP"}

            if task.completed:
                logger.info(f"Task {task_id} already completed, skipping reminder")
                return {"status": "DROP"}

            # Publish notification event
            from ..services.event_service import EventService
            await EventService.publish_reminder_trigger(user_id, task)
            logger.info(f"Reminder triggered for task {task_id}: {task.title}")

        return {"status": "SUCCESS"}

    except Exception as e:
        logger.error(f"Error processing reminder: {e}")
        return {"status": "RETRY"}
