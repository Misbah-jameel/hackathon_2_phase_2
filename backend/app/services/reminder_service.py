import logging
from datetime import datetime

from .dapr_client import DaprClient

logger = logging.getLogger(__name__)


class ReminderService:
    """Service for scheduling reminders via Dapr Jobs API."""

    @staticmethod
    async def schedule_reminder(
        task_id: str,
        user_id: str,
        fire_at: datetime,
    ) -> bool:
        """Schedule a reminder for a task at the specified time."""
        job_name = f"reminder-{task_id}"

        schedule = {
            "data": {
                "task_id": task_id,
                "user_id": user_id,
                "fire_at": fire_at.isoformat(),
            },
            "schedule": fire_at.isoformat(),
        }

        result = await DaprClient.schedule_job(job_name, schedule)
        if result:
            logger.info(f"Reminder scheduled for task {task_id} at {fire_at}")
        return result

    @staticmethod
    async def cancel_reminder(task_id: str) -> bool:
        """Cancel a scheduled reminder for a task."""
        job_name = f"reminder-{task_id}"
        result = await DaprClient.cancel_job(job_name)
        if result:
            logger.info(f"Reminder cancelled for task {task_id}")
        return result
