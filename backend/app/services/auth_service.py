from datetime import datetime, timedelta
from typing import Optional
import bcrypt
from jose import JWTError, jwt
from sqlmodel import Session, select

from ..config import settings
from ..models.user import User


class AuthService:
    """Service for authentication operations."""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt."""
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        try:
            password_bytes = plain_password.encode('utf-8')
            hashed_bytes = hashed_password.encode('utf-8')
            return bcrypt.checkpw(password_bytes, hashed_bytes)
        except Exception:
            return False

    @staticmethod
    def create_access_token(user_id: str) -> str:
        """Create a JWT access token."""
        expire = datetime.utcnow() + timedelta(hours=settings.jwt_expiry_hours)
        to_encode = {
            "sub": user_id,
            "exp": expire,
            "iat": datetime.utcnow(),
        }
        return jwt.encode(
            to_encode,
            settings.jwt_secret,
            algorithm=settings.jwt_algorithm,
        )

    @staticmethod
    def decode_token(token: str) -> Optional[str]:
        """Decode a JWT token and return the user ID."""
        try:
            payload = jwt.decode(
                token,
                settings.jwt_secret,
                algorithms=[settings.jwt_algorithm],
            )
            return payload.get("sub")
        except JWTError:
            return None

    @staticmethod
    def get_user_by_email(session: Session, email: str) -> Optional[User]:
        """Get a user by email."""
        statement = select(User).where(User.email == email)
        return session.exec(statement).first()

    @staticmethod
    def get_user_by_id(session: Session, user_id: str) -> Optional[User]:
        """Get a user by ID."""
        return session.get(User, user_id)

    @classmethod
    def create_user(
        cls,
        session: Session,
        email: str,
        password: str,
        name: str,
    ) -> User:
        """Create a new user."""
        user = User(
            email=email,
            name=name,
            hashed_password=cls.hash_password(password),
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    @classmethod
    def authenticate_user(
        cls,
        session: Session,
        email: str,
        password: str,
    ) -> Optional[User]:
        """Authenticate a user by email and password."""
        user = cls.get_user_by_email(session, email)
        if not user:
            return None
        if not cls.verify_password(password, user.hashed_password):
            return None
        return user
