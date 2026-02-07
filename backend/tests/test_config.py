"""Tests for app.config — Settings properties and security validation."""

import warnings
import pytest
from app.config import Settings, INSECURE_SECRETS


class TestCorsOriginsList:
    def test_single_origin(self):
        s = Settings(cors_origins="http://localhost:3000", _env_file=None)
        assert s.cors_origins_list == ["http://localhost:3000"]

    def test_multiple_origins(self):
        s = Settings(cors_origins="http://a.com, http://b.com , http://c.com", _env_file=None)
        assert s.cors_origins_list == ["http://a.com", "http://b.com", "http://c.com"]

    def test_empty_string(self):
        s = Settings(cors_origins="", _env_file=None)
        assert s.cors_origins_list == [""]


class TestIsSqlite:
    def test_sqlite_url(self):
        s = Settings(database_url="sqlite:///./test.db", _env_file=None)
        assert s.is_sqlite is True

    def test_postgres_url(self):
        s = Settings(database_url="postgresql://user:pass@host/db", _env_file=None)
        assert s.is_sqlite is False


class TestIsJwtSecretSecure:
    def test_short_secret(self):
        s = Settings(jwt_secret="short", _env_file=None)
        assert s.is_jwt_secret_secure is False

    def test_known_insecure_secret(self):
        for secret in INSECURE_SECRETS:
            # Pad to 32+ chars if needed so length check passes
            padded = secret.ljust(32, "x")
            s = Settings(jwt_secret=padded, _env_file=None)
            # Only the original secrets (unpadded) are in the set,
            # so test with actual set members
        s = Settings(
            jwt_secret="development-secret-key-change-in-production",
            _env_file=None,
        )
        assert s.is_jwt_secret_secure is False

    def test_empty_secret(self):
        s = Settings(jwt_secret="", _env_file=None)
        assert s.is_jwt_secret_secure is False

    def test_secure_secret(self):
        s = Settings(
            jwt_secret="a-very-strong-random-secret-that-is-at-least-32-chars!",
            _env_file=None,
        )
        assert s.is_jwt_secret_secure is True


class TestHasAnthropicKey:
    def test_no_key(self):
        s = Settings(anthropic_api_key=None, _env_file=None)
        assert s.has_anthropic_key is False

    def test_empty_key(self):
        s = Settings(anthropic_api_key="", _env_file=None)
        assert s.has_anthropic_key is False

    def test_whitespace_key(self):
        s = Settings(anthropic_api_key="   ", _env_file=None)
        assert s.has_anthropic_key is False

    def test_valid_key(self):
        s = Settings(anthropic_api_key="sk-ant-test-key", _env_file=None)
        assert s.has_anthropic_key is True


class TestValidateSecurity:
    def test_insecure_secret_warns(self):
        s = Settings(jwt_secret="short", _env_file=None)
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            s.validate_security()
            assert len(w) == 1
            assert "SECURITY WARNING" in str(w[0].message)

    def test_secure_secret_no_warning(self):
        s = Settings(
            jwt_secret="a-very-strong-random-secret-that-is-at-least-32-chars!",
            _env_file=None,
        )
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            s.validate_security()
            assert len(w) == 0
