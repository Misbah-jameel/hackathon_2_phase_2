import httpx
import logging
from typing import Any, Dict, Optional

from ..config import settings

logger = logging.getLogger(__name__)


class DaprClient:
    """HTTP client wrapper for Dapr sidecar APIs."""

    @staticmethod
    def _base_url() -> str:
        host = getattr(settings, "dapr_host", "localhost")
        port = getattr(settings, "dapr_port", 3500)
        return f"http://{host}:{port}"

    @staticmethod
    def _pubsub_name() -> str:
        return getattr(settings, "dapr_pubsub_name", "pubsub")

    @staticmethod
    async def publish_event(topic: str, data: Dict[str, Any]) -> bool:
        """Publish an event to a Dapr pub/sub topic."""
        url = f"{DaprClient._base_url()}/v1.0/publish/{DaprClient._pubsub_name()}/{topic}"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(
                    url,
                    json=data,
                    headers={"Content-Type": "application/json"},
                )
                if response.status_code in (200, 204):
                    logger.info(f"Event published to {topic}: {data.get('event_type', 'unknown')}")
                    return True
                else:
                    logger.warning(f"Dapr publish failed ({response.status_code}): {response.text}")
                    return False
        except httpx.ConnectError:
            logger.warning(f"Dapr sidecar not available at {DaprClient._base_url()}, skipping event publish")
            return False
        except Exception as e:
            logger.error(f"Error publishing event to {topic}: {e}")
            return False

    @staticmethod
    async def get_state(store_name: str, key: str) -> Optional[Any]:
        """Get state from a Dapr state store."""
        url = f"{DaprClient._base_url()}/v1.0/state/{store_name}/{key}"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    return response.json()
                return None
        except Exception as e:
            logger.error(f"Error getting state {key}: {e}")
            return None

    @staticmethod
    async def save_state(store_name: str, key: str, value: Any) -> bool:
        """Save state to a Dapr state store."""
        url = f"{DaprClient._base_url()}/v1.0/state/{store_name}"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(
                    url,
                    json=[{"key": key, "value": value}],
                    headers={"Content-Type": "application/json"},
                )
                return response.status_code in (200, 204)
        except Exception as e:
            logger.error(f"Error saving state {key}: {e}")
            return False

    @staticmethod
    async def delete_state(store_name: str, key: str) -> bool:
        """Delete state from a Dapr state store."""
        url = f"{DaprClient._base_url()}/v1.0/state/{store_name}/{key}"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.delete(url)
                return response.status_code in (200, 204)
        except Exception as e:
            logger.error(f"Error deleting state {key}: {e}")
            return False

    @staticmethod
    async def get_secret(store_name: str, key: str) -> Optional[Dict[str, str]]:
        """Get a secret from a Dapr secret store."""
        url = f"{DaprClient._base_url()}/v1.0/secrets/{store_name}/{key}"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    return response.json()
                return None
        except Exception as e:
            logger.error(f"Error getting secret {key}: {e}")
            return None

    @staticmethod
    async def schedule_job(job_name: str, schedule: Dict[str, Any]) -> bool:
        """Schedule a job via Dapr Jobs API."""
        url = f"{DaprClient._base_url()}/v1.0-alpha1/jobs/{job_name}"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(
                    url,
                    json=schedule,
                    headers={"Content-Type": "application/json"},
                )
                if response.status_code in (200, 204):
                    logger.info(f"Job scheduled: {job_name}")
                    return True
                else:
                    logger.warning(f"Dapr job schedule failed ({response.status_code}): {response.text}")
                    return False
        except httpx.ConnectError:
            logger.warning(f"Dapr sidecar not available, skipping job schedule: {job_name}")
            return False
        except Exception as e:
            logger.error(f"Error scheduling job {job_name}: {e}")
            return False

    @staticmethod
    async def cancel_job(job_name: str) -> bool:
        """Cancel a scheduled job via Dapr Jobs API."""
        url = f"{DaprClient._base_url()}/v1.0-alpha1/jobs/{job_name}"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.delete(url)
                return response.status_code in (200, 204)
        except Exception as e:
            logger.error(f"Error cancelling job {job_name}: {e}")
            return False
