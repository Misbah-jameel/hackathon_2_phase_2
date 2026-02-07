"""Tests for app.schemas.auth — Password validation, LoginInput, SignupInput."""

import pytest
from pydantic import ValidationError
from app.schemas.auth import LoginInput, SignupInput, UserResponse, AuthResponse
from datetime import datetime


class TestLoginInput:
    def test_valid_login(self):
        login = LoginInput(email="user@example.com", password="anything")
        assert login.email == "user@example.com"
        assert login.password == "anything"

    def test_invalid_email(self):
        with pytest.raises(ValidationError):
            LoginInput(email="not-an-email", password="pass")

    def test_missing_password(self):
        with pytest.raises(ValidationError):
            LoginInput(email="user@example.com")


class TestSignupInput:
    def test_valid_signup(self):
        signup = SignupInput(
            email="user@example.com", password="ValidPass1", name="Test"
        )
        assert signup.email == "user@example.com"
        assert signup.password == "ValidPass1"
        assert signup.name == "Test"

    def test_invalid_email(self):
        with pytest.raises(ValidationError):
            SignupInput(email="bad", password="ValidPass1", name="Test")

    def test_password_too_short(self):
        with pytest.raises(ValidationError, match="at least 8 characters"):
            SignupInput(email="u@e.com", password="Ab1", name="T")

    def test_password_no_uppercase(self):
        with pytest.raises(ValidationError, match="uppercase"):
            SignupInput(email="u@e.com", password="alllower1", name="T")

    def test_password_no_lowercase(self):
        with pytest.raises(ValidationError, match="lowercase"):
            SignupInput(email="u@e.com", password="ALLUPPER1", name="T")

    def test_password_no_digit(self):
        with pytest.raises(ValidationError, match="number"):
            SignupInput(email="u@e.com", password="NoDigitHere", name="T")

    def test_missing_name(self):
        with pytest.raises(ValidationError):
            SignupInput(email="u@e.com", password="ValidPass1")

    def test_password_exactly_8_chars(self):
        signup = SignupInput(email="u@e.com", password="Abcdefg1", name="T")
        assert signup.password == "Abcdefg1"


class TestUserResponse:
    def test_valid_user_response(self):
        now = datetime.utcnow()
        resp = UserResponse(id="abc", email="u@e.com", name="T", createdAt=now)
        assert resp.id == "abc"
        assert resp.createdAt == now


class TestAuthResponse:
    def test_valid_auth_response(self):
        now = datetime.utcnow()
        user = UserResponse(id="abc", email="u@e.com", name="T", createdAt=now)
        resp = AuthResponse(user=user, token="tok123")
        assert resp.token == "tok123"
        assert resp.user.id == "abc"
