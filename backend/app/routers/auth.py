from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from ..database import get_session
from ..services.auth_service import AuthService
from ..schemas.auth import LoginInput, SignupInput, AuthResponse, UserResponse
from ..dependencies.auth import get_current_user
from ..models.user import User


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse)
async def signup(
    input: SignupInput,
    session: Session = Depends(get_session),
):
    """Register a new user."""
    # Check if email already exists
    existing_user = AuthService.get_user_by_email(session, input.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user
    user = AuthService.create_user(
        session,
        email=input.email,
        password=input.password,
        name=input.name,
    )

    # Generate token
    token = AuthService.create_access_token(user.id)

    return AuthResponse(
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            createdAt=user.created_at,
        ),
        token=token,
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    input: LoginInput,
    session: Session = Depends(get_session),
):
    """Authenticate a user and return a token."""
    user = AuthService.authenticate_user(session, input.email, input.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = AuthService.create_access_token(user.id)

    return AuthResponse(
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            createdAt=user.created_at,
        ),
        token=token,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    current_user: User = Depends(get_current_user),
):
    """Logout the current user (client should discard token)."""
    # JWT tokens are stateless, so logout is handled client-side
    # This endpoint exists for API consistency
    return None


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """Get the current authenticated user."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        createdAt=current_user.created_at,
    )
