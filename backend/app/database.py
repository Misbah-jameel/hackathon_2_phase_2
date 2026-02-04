from sqlmodel import SQLModel, create_engine, Session
from typing import Generator
from .config import settings


# Create database engine with appropriate settings
# SQLite requires check_same_thread=False for FastAPI
connect_args = {"check_same_thread": False} if settings.is_sqlite else {}

engine = create_engine(
    settings.database_url,
    echo=False,  # Set to True for SQL debugging
    connect_args=connect_args,
)


def init_db() -> None:
    """Initialize database tables."""
    # Import models to ensure they are registered with SQLModel
    from .models import User, Task  # noqa: F401
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Dependency that provides a database session."""
    with Session(engine) as session:
        yield session
