from .audit_consumer import router as audit_consumer_router
from .reminder_consumer import router as reminder_consumer_router
from .recurrence_consumer import router as recurrence_consumer_router

__all__ = [
    "audit_consumer_router",
    "reminder_consumer_router",
    "recurrence_consumer_router",
]
