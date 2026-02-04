from fastapi import APIRouter, Depends
from sqlmodel import Session

from ..database import get_session
from ..services.chatbot_service import ChatbotService
from ..schemas.chatbot import ChatbotRequest, ChatbotResponse
from ..dependencies.auth import get_current_user
from ..models.user import User


router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])


@router.post("", response_model=ChatbotResponse)
async def process_message(
    input: ChatbotRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Process a natural language command from the chatbot."""
    return ChatbotService.process_message(
        session=session,
        user_id=current_user.id,
        message=input.message,
    )
