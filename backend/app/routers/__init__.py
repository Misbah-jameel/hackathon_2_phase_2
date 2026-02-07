from .auth import router as auth_router
from .tasks import router as tasks_router
from .chatbot import router as chatbot_router
from .events import router as events_router
from .subscriptions import router as subscriptions_router

__all__ = [
    "auth_router",
    "tasks_router",
    "chatbot_router",
    "events_router",
    "subscriptions_router",
]
