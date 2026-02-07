from fastapi import APIRouter
from typing import List, Dict

router = APIRouter(tags=["dapr"])


@router.get("/dapr/subscribe")
async def subscribe() -> List[Dict]:
    """Dapr subscription endpoint.
    Tells the Dapr sidecar which topics to subscribe to and where to route events.
    """
    return [
        {
            "pubsubname": "pubsub",
            "topic": "task-events",
            "route": "/api/events/task-events",
        },
        {
            "pubsubname": "pubsub",
            "topic": "reminders",
            "route": "/api/events/reminders",
        },
        {
            "pubsubname": "pubsub",
            "topic": "task-updates",
            "route": "/api/events/task-updates",
        },
    ]
