from pydantic import BaseModel, EmailStr
from datetime import datetime


class LoginInput(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str


class SignupInput(BaseModel):
    """Signup request schema."""
    email: EmailStr
    password: str
    name: str


class UserResponse(BaseModel):
    """User response schema (excludes password)."""
    id: str
    email: str
    name: str
    createdAt: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Authentication response with user and token."""
    user: UserResponse
    token: str
