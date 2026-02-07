"""Tests for app.routers.tasks — CRUD + toggle + 404 + unauth."""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user import User
from app.models.task import Task


class TestListTasks:
    def test_empty(self, client: TestClient):
        response = client.get("/api/tasks")
        assert response.status_code == 200
        assert response.json() == []

    def test_with_data(self, client: TestClient, sample_tasks):
        response = client.get("/api/tasks")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

    def test_unauthenticated(self, unauth_client: TestClient):
        response = unauth_client.get("/api/tasks")
        assert response.status_code in (401, 403)


class TestCreateTask:
    def test_success(self, client: TestClient):
        response = client.post("/api/tasks", json={
            "title": "New task",
            "description": "A description",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New task"
        assert data["completed"] is False

    def test_missing_title(self, client: TestClient):
        response = client.post("/api/tasks", json={"description": "no title"})
        assert response.status_code == 422

    def test_unauthenticated(self, unauth_client: TestClient):
        response = unauth_client.post("/api/tasks", json={"title": "Nope"})
        assert response.status_code in (401, 403)


class TestGetTaskById:
    def test_success(self, client: TestClient, sample_tasks):
        task_id = sample_tasks[0].id
        response = client.get(f"/api/tasks/{task_id}")
        assert response.status_code == 200
        assert response.json()["title"] == "Buy groceries"

    def test_not_found(self, client: TestClient):
        response = client.get("/api/tasks/nonexistent-id")
        assert response.status_code == 404


class TestUpdateTask:
    def test_update_title(self, client: TestClient, sample_tasks):
        task_id = sample_tasks[0].id
        response = client.patch(f"/api/tasks/{task_id}", json={"title": "Updated"})
        assert response.status_code == 200
        assert response.json()["title"] == "Updated"

    def test_update_completed(self, client: TestClient, sample_tasks):
        task_id = sample_tasks[0].id
        response = client.patch(f"/api/tasks/{task_id}", json={"completed": True})
        assert response.status_code == 200
        assert response.json()["completed"] is True

    def test_not_found(self, client: TestClient):
        response = client.patch("/api/tasks/nonexistent-id", json={"title": "X"})
        assert response.status_code == 404


class TestDeleteTask:
    def test_success(self, client: TestClient, sample_tasks):
        task_id = sample_tasks[0].id
        response = client.delete(f"/api/tasks/{task_id}")
        assert response.status_code == 204

        # Verify deletion
        get_response = client.get(f"/api/tasks/{task_id}")
        assert get_response.status_code == 404

    def test_not_found(self, client: TestClient):
        response = client.delete("/api/tasks/nonexistent-id")
        assert response.status_code == 404


class TestToggleTask:
    def test_toggle_to_completed(self, client: TestClient, sample_tasks):
        task_id = sample_tasks[0].id  # pending task
        response = client.patch(f"/api/tasks/{task_id}/toggle")
        assert response.status_code == 200
        assert response.json()["completed"] is True

    def test_toggle_to_pending(self, client: TestClient, sample_tasks):
        task_id = sample_tasks[2].id  # completed task
        response = client.patch(f"/api/tasks/{task_id}/toggle")
        assert response.status_code == 200
        assert response.json()["completed"] is False

    def test_not_found(self, client: TestClient):
        response = client.patch("/api/tasks/nonexistent-id/toggle")
        assert response.status_code == 404
