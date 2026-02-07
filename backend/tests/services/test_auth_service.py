"""Tests for app.services.auth_service — password hashing, JWT, user CRUD, auth."""

import pytest
from unittest.mock import patch
from datetime import datetime, timedelta
from jose import jwt as jose_jwt
from sqlmodel import Session

from app.services.auth_service import AuthService
from app.models.user import User
from app.config import settings


class TestHashPassword:
    def test_returns_bcrypt_hash(self):
        hashed = AuthService.hash_password("MyPassword1")
        assert hashed.startswith("$2b$")

    def test_different_hashes_for_same_password(self):
        h1 = AuthService.hash_password("Same1")
        h2 = AuthService.hash_password("Same1")
        assert h1 != h2  # different salts


class TestVerifyPassword:
    def test_correct_password(self):
        hashed = AuthService.hash_password("Correct1")
        assert AuthService.verify_password("Correct1", hashed) is True

    def test_incorrect_password(self):
        hashed = AuthService.hash_password("Correct1")
        assert AuthService.verify_password("Wrong1", hashed) is False

    def test_invalid_hash(self):
        assert AuthService.verify_password("anything", "not-a-hash") is False


class TestJWT:
    def test_create_and_decode_roundtrip(self):
        token = AuthService.create_access_token("user-123")
        user_id = AuthService.decode_token(token)
        assert user_id == "user-123"

    def test_decode_invalid_token(self):
        assert AuthService.decode_token("invalid.token.here") is None

    def test_decode_expired_token(self):
        payload = {
            "sub": "user-123",
            "exp": datetime.utcnow() - timedelta(hours=1),
            "iat": datetime.utcnow() - timedelta(hours=2),
        }
        token = jose_jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
        assert AuthService.decode_token(token) is None

    def test_token_contains_sub_claim(self):
        token = AuthService.create_access_token("user-abc")
        payload = jose_jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        assert payload["sub"] == "user-abc"
        assert "exp" in payload
        assert "iat" in payload


class TestGetUserByEmail:
    def test_user_found(self, db_session: Session, test_user: User):
        found = AuthService.get_user_by_email(db_session, "test@example.com")
        assert found is not None
        assert found.id == test_user.id

    def test_user_not_found(self, db_session: Session):
        found = AuthService.get_user_by_email(db_session, "nobody@example.com")
        assert found is None


class TestGetUserById:
    def test_user_found(self, db_session: Session, test_user: User):
        found = AuthService.get_user_by_id(db_session, test_user.id)
        assert found is not None
        assert found.email == "test@example.com"

    def test_user_not_found(self, db_session: Session):
        found = AuthService.get_user_by_id(db_session, "nonexistent-id")
        assert found is None


class TestCreateUser:
    def test_creates_user(self, db_session: Session):
        user = AuthService.create_user(
            db_session, email="new@example.com", password="NewPass1", name="New User"
        )
        assert user.email == "new@example.com"
        assert user.name == "New User"
        assert user.hashed_password.startswith("$2b$")
        assert user.id is not None

    def test_password_is_hashed(self, db_session: Session):
        user = AuthService.create_user(
            db_session, email="hash@example.com", password="PlainPass1", name="H"
        )
        assert user.hashed_password != "PlainPass1"


class TestAuthenticateUser:
    def test_success(self, db_session: Session, test_user: User):
        result = AuthService.authenticate_user(
            db_session, "test@example.com", "TestPass123"
        )
        assert result is not None
        assert result.id == test_user.id

    def test_wrong_password(self, db_session: Session, test_user: User):
        result = AuthService.authenticate_user(
            db_session, "test@example.com", "WrongPass1"
        )
        assert result is None

    def test_nonexistent_email(self, db_session: Session):
        result = AuthService.authenticate_user(
            db_session, "ghost@example.com", "AnyPass1"
        )
        assert result is None
