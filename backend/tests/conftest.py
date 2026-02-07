"""Shared test fixtures for the backend test suite."""

import pytest
from sqlmodel import SQLModel, Session, create_engine
from fastapi.testclient import TestClient

from app.main import app
from app.database import get_session
from app.dependencies.auth import get_current_user
from app.services.auth_service import AuthService
from app.models.user import User
from app.models.task import Task


# ---------------------------------------------------------------------------
# Database fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def engine():
    """Create an in-memory SQLite engine for the entire test session."""
    eng = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
    )
    SQLModel.metadata.create_all(eng)
    yield eng
    eng.dispose()


@pytest.fixture()
def db_session(engine):
    """Provide a transactional database session that rolls back after each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


# ---------------------------------------------------------------------------
# User fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def test_user(db_session: Session) -> User:
    """Create a test user with known credentials."""
    user = AuthService.create_user(
        db_session,
        email="test@example.com",
        password="TestPass123",
        name="Test User",
    )
    return user


@pytest.fixture()
def other_user(db_session: Session) -> User:
    """Create a second user for isolation tests."""
    user = AuthService.create_user(
        db_session,
        email="other@example.com",
        password="OtherPass123",
        name="Other User",
    )
    return user


# ---------------------------------------------------------------------------
# Task fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def sample_tasks(db_session: Session, test_user: User) -> list[Task]:
    """Create 3 sample tasks for test_user (2 pending, 1 completed)."""
    from app.services.task_service import TaskService

    t1 = TaskService.create_task(db_session, test_user.id, "Buy groceries", "Milk, eggs, bread")
    t2 = TaskService.create_task(db_session, test_user.id, "Review documents")
    t3 = TaskService.create_task(db_session, test_user.id, "Clean house")
    TaskService.update_task(db_session, t3, completed=True)
    return [t1, t2, t3]


# ---------------------------------------------------------------------------
# TestClient fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def client(db_session: Session, test_user: User) -> TestClient:
    """Authenticated TestClient with get_session and get_current_user overridden."""

    def _override_session():
        yield db_session

    def _override_current_user():
        return test_user

    app.dependency_overrides[get_session] = _override_session
    app.dependency_overrides[get_current_user] = _override_current_user

    with TestClient(app) as tc:
        yield tc

    app.dependency_overrides.clear()


@pytest.fixture()
def unauth_client(db_session: Session) -> TestClient:
    """Unauthenticated TestClient (only get_session overridden)."""

    def _override_session():
        yield db_session

    app.dependency_overrides[get_session] = _override_session
    # Explicitly remove auth override if present
    app.dependency_overrides.pop(get_current_user, None)

    with TestClient(app, raise_server_exceptions=False) as tc:
        yield tc

    app.dependency_overrides.clear()
