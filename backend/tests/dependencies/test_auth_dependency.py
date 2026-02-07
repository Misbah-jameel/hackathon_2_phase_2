"""Tests for app.dependencies.auth — get_current_user dependency."""

import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlmodel import Session

from app.dependencies.auth import get_current_user
from app.services.auth_service import AuthService
from app.models.user import User


@pytest.mark.anyio
class TestGetCurrentUser:
    async def test_valid_token(self, db_session: Session, test_user: User):
        token = AuthService.create_access_token(test_user.id)
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        user = await get_current_user(credentials=credentials, session=db_session)
        assert user.id == test_user.id

    async def test_invalid_token(self, db_session: Session):
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="invalid-token"
        )
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=credentials, session=db_session)
        assert exc_info.value.status_code == 401

    async def test_user_not_found(self, db_session: Session):
        """Token is valid but user has been deleted."""
        token = AuthService.create_access_token("deleted-user-id")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=credentials, session=db_session)
        assert exc_info.value.status_code == 401
        assert "User not found" in exc_info.value.detail

    async def test_expired_token(self, db_session: Session, test_user: User):
        from datetime import datetime, timedelta
        from jose import jwt as jose_jwt
        from app.config import settings

        payload = {
            "sub": test_user.id,
            "exp": datetime.utcnow() - timedelta(hours=1),
            "iat": datetime.utcnow() - timedelta(hours=2),
        }
        token = jose_jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials=credentials, session=db_session)
        assert exc_info.value.status_code == 401
