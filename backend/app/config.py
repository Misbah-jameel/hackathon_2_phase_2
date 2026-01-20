from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database - SQLite by default for easy local development
    # For production, use: postgresql://user:pass@host/db
    database_url: str = "sqlite:///./todoapp.db"

    # JWT
    jwt_secret: str = "development-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiry_hours: int = 24

    # CORS
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
