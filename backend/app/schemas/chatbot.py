from pydantic import BaseModel
from typing import Optional, List, Any


class ChatbotRequest(BaseModel):
    """Chatbot message request schema."""
    message: str


class ChatbotResponse(BaseModel):
    """Chatbot response schema."""
    message: str
    intent: str
    success: bool
    data: Optional[Any] = None
    suggestions: List[str] = []
