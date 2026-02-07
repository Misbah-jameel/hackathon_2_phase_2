# Feature Specification: Phase V — Advanced Features, Event-Driven Architecture & Cloud Deployment

**Feature Branch**: `004-phase-v-cloud-native`
**Created**: 2026-02-06
**Status**: Draft
**Input**: User description: "Transform the Todo Chatbot into a production-grade, event-driven microservices system with Kafka, Dapr, and publish it on a cloud Kubernetes cluster with a public URL."

---

## Scopes Overview

| Scope | Title | Description |
|-------|-------|-------------|
| A | Advanced Features | Recurring tasks, due dates, reminders, priorities, tags, search, filter, sort |
| B | Event-Driven Architecture | Kafka-based messaging for task lifecycle events |
| C | Dapr Integration | Infrastructure abstraction via Dapr building blocks |
| D | Local Validation | Full Minikube validation with Kafka + Dapr sidecars |
| E | Cloud Deployment | Managed Kubernetes with public URL |
| F | CI/CD & Observability | GitHub Actions pipeline, monitoring, health checks |

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Task Priorities, Tags & Organization (Priority: P1)

As a user, I want to assign priorities (High, Medium, Low) and tags to my tasks so I can organize and find them quickly.

**Why this priority**: Organization features are the most requested enhancement and foundational for all other advanced features. Every subsequent feature (search, filter, sort) depends on these data attributes existing.

**Independent Test**: Create a task with priority "High" and tags ["work", "urgent"], then verify the task displays with priority badge and tag chips in the UI.

**Acceptance Scenarios**:

1. **Given** a user is creating a task, **When** they select a priority level (High/Medium/Low/None), **Then** the task is saved with that priority and displays an appropriate visual indicator.
2. **Given** a user is creating or editing a task, **When** they add tags (comma-separated or chip input), **Then** the tags are stored and displayed as removable chips.
3. **Given** tasks exist with different priorities, **When** the user views the task list, **Then** each task shows its priority badge with distinct colors (Red=High, Yellow=Medium, Blue=Low).
4. **Given** a task has tags, **When** the user views the task, **Then** all tags are displayed and each tag is clickable to filter by that tag.

---

### User Story 2 — Search, Filter & Sort (Priority: P1)

As a user, I want to search my tasks by keyword, filter by status/priority/tag, and sort by different criteria so I can find exactly what I need.

**Why this priority**: With priorities and tags in place, users need the ability to leverage these attributes. Search/filter/sort are core productivity features that make the app genuinely useful.

**Independent Test**: Create 5 tasks with mixed priorities and tags, then search for a keyword, filter by "High" priority, and sort by due date — verify results match expectations.

**Acceptance Scenarios**:

1. **Given** multiple tasks exist, **When** the user types a search query, **Then** tasks are filtered in real-time to show only tasks whose title or description contains the query (case-insensitive).
2. **Given** tasks with different priorities exist, **When** the user selects a priority filter (e.g., "High"), **Then** only tasks with that priority are displayed.
3. **Given** tasks with tags exist, **When** the user clicks a tag or selects a tag filter, **Then** only tasks with that tag are displayed.
4. **Given** tasks are displayed, **When** the user selects a sort criterion (created date, priority, due date, alphabetical), **Then** tasks reorder according to the selected criterion.
5. **Given** filters are applied, **When** the user clicks "Clear Filters", **Then** all filters are removed and all tasks are shown.
6. **Given** a user applies multiple filters simultaneously (priority + tag + status), **When** viewing results, **Then** only tasks matching ALL active filters are shown (AND logic).

---

### User Story 3 — Due Dates & Scheduled Reminders (Priority: P1)

As a user, I want to set due dates on tasks and receive scheduled reminders so I never miss a deadline.

**Why this priority**: Due dates transform the app from a simple list into a time-aware productivity tool. Reminders add proactive value and demonstrate event-driven capability.

**Independent Test**: Create a task with a due date 1 minute in the future, verify the reminder fires via Dapr Jobs API, and the user sees a notification.

**Acceptance Scenarios**:

1. **Given** a user is creating or editing a task, **When** they set a due date (date + optional time), **Then** the due date is saved and displayed on the task card.
2. **Given** a task has a due date in the past, **When** the user views the task list, **Then** the task shows an "Overdue" visual indicator (red text/badge).
3. **Given** a task has a due date within 24 hours, **When** the user views the task list, **Then** the task shows a "Due Soon" indicator (orange/yellow).
4. **Given** a task has a due date, **When** the reminder time arrives, **Then** a reminder event is published via Dapr pub/sub to the `reminders` topic.
5. **Given** a reminder event is consumed, **When** the frontend receives it, **Then** a toast notification is displayed to the user.
6. **Given** a task is completed before the due date, **When** the reminder time arrives, **Then** no reminder is triggered (completed tasks skip reminders).

---

### User Story 4 — Recurring Tasks (Priority: P2)

As a user, I want to create recurring tasks (daily, weekly, monthly, custom) so routine activities are automatically tracked.

**Why this priority**: Recurring tasks demonstrate advanced event-driven processing and auto-generation via Kafka consumers. Lower priority than core features because the app is usable without them.

**Independent Test**: Create a daily recurring task, wait for the recurrence trigger, and verify a new task instance is automatically created.

**Acceptance Scenarios**:

1. **Given** a user is creating a task, **When** they enable recurrence and select a pattern (Daily/Weekly/Monthly/Custom), **Then** the task is saved with the recurrence metadata.
2. **Given** a recurring task exists with daily pattern, **When** the scheduled time arrives, **Then** a new task instance is automatically created via Kafka consumer with the same title, description, and priority.
3. **Given** a recurring task instance is completed, **When** viewing the task, **Then** only the current instance is marked complete; the recurrence pattern continues.
4. **Given** a user wants to stop recurrence, **When** they disable recurrence on the parent task, **Then** no more instances are created after the current one.
5. **Given** a recurring task with weekly pattern (e.g., every Monday), **When** Monday arrives, **Then** a new instance is created with the due date set to the next occurrence.

---

### User Story 5 — Event-Driven Task Lifecycle via Kafka + Dapr (Priority: P1)

As the system, task lifecycle events (create, update, delete, complete) MUST be published to Kafka via Dapr pub/sub, and consumers MUST process them for audit logging, reminder scheduling, and recurring task generation.

**Why this priority**: This is the architectural backbone of Phase V. All advanced features (reminders, recurring tasks, audit) depend on the event pipeline working correctly.

**Independent Test**: Create a task via API, then verify the `task-events` Kafka topic received a `task.created` event with correct schema, and the audit log consumer recorded it.

**Acceptance Scenarios**:

1. **Given** a user creates a task, **When** the API processes the request, **Then** a `task.created` event is published to the `task-events` topic via Dapr pub/sub.
2. **Given** a user updates a task, **When** the API processes the request, **Then** a `task.updated` event is published with before/after state.
3. **Given** a user completes a task, **When** the API processes the request, **Then** a `task.completed` event is published.
4. **Given** a user deletes a task, **When** the API processes the request, **Then** a `task.deleted` event is published.
5. **Given** a `task.created` event is published, **When** the audit consumer receives it, **Then** an audit log entry is recorded with timestamp, user_id, event_type, and task_id.
6. **Given** all Kafka interactions, **When** any component publishes or subscribes, **Then** it MUST go through Dapr pub/sub API — never direct Kafka client.

---

### User Story 6 — Dapr Integration for Infrastructure Abstraction (Priority: P1)

As the system architect, all infrastructure interactions (messaging, state, service calls, secrets, scheduled jobs) MUST use Dapr building blocks so the application is infrastructure-agnostic.

**Why this priority**: Dapr is a mandatory requirement. The entire architecture depends on it. Without Dapr, the event-driven features cannot function as specified.

**Independent Test**: Verify that the backend application starts with a Dapr sidecar, can publish events via Dapr pub/sub API, read state via Dapr state API, and invoke services via Dapr service invocation.

**Acceptance Scenarios**:

1. **Given** the backend application, **When** it publishes a task event, **Then** it calls `POST http://localhost:3500/v1.0/publish/pubsub/task-events` (Dapr sidecar), NOT a direct Kafka producer.
2. **Given** the backend needs to store session/cache state, **When** it saves state, **Then** it calls `POST http://localhost:3500/v1.0/state/statestore` (Dapr state API).
3. **Given** the frontend needs to call the backend, **When** using service invocation, **Then** it can optionally use Dapr service invocation: `POST http://localhost:3500/v1.0/invoke/todo-backend/method/api/tasks`.
4. **Given** a reminder needs to be scheduled, **When** the system creates a reminder, **Then** it uses Dapr Jobs API: `POST http://localhost:3500/v1.0-alpha1/jobs/<job-name>`.
5. **Given** secrets are needed (JWT_SECRET, DB credentials), **When** the application reads them, **Then** it uses Dapr Secrets API: `GET http://localhost:3500/v1.0/secrets/secretstore/<key>`.
6. **Given** Dapr components are configured, **When** switching from local (Strimzi Kafka) to cloud (Redpanda), **Then** only Dapr component YAML files change — zero application code changes.

---

### User Story 7 — Local Validation on Minikube (Priority: P1)

As a developer, I need the complete event-driven system (Backend + Frontend + Kafka + Dapr) running on local Minikube so I can validate everything before cloud deployment.

**Why this priority**: Cloud deployment without local validation is risky and expensive. Local validation catches integration issues early.

**Independent Test**: Deploy all services on Minikube with Dapr sidecars and Strimzi Kafka, perform full CRUD operations, and verify events flow through the pipeline end-to-end.

**Acceptance Scenarios**:

1. **Given** Minikube is running, **When** Strimzi Kafka operator is installed, **Then** a Kafka cluster with 1 broker is running in the `kafka` namespace.
2. **Given** Kafka is running, **When** Dapr is installed on the cluster, **Then** Dapr control plane pods are running and Dapr pub/sub component points to Strimzi Kafka.
3. **Given** Kafka + Dapr are running, **When** backend is deployed with Dapr sidecar annotation, **Then** the Dapr sidecar container runs alongside the backend container in the same pod.
4. **Given** the full stack is deployed, **When** a user creates a task via the frontend, **Then** the event is visible in the `task-events` Kafka topic (verified via Kafka CLI or consumer logs).
5. **Given** a task with a due date is created, **When** the reminder time arrives, **Then** the Dapr Jobs API triggers the reminder and a notification event is published.
6. **Given** a recurring task exists, **When** the recurrence trigger fires, **Then** a new task instance appears in the user's task list automatically.

---

### User Story 8 — Cloud Deployment with Public URL (Priority: P1)

As a stakeholder, I need the application deployed on a cloud Kubernetes cluster with a publicly accessible URL so it can be demonstrated and used by anyone.

**Why this priority**: The entire Phase V culminates in a publicly accessible deployment. This is the primary deliverable for the hackathon.

**Independent Test**: Access the public URL from any device/network, sign up, create a task with priority and tags, and verify all features work end-to-end.

**Acceptance Scenarios**:

1. **Given** a cloud Kubernetes cluster (AKS/GKE/OKE), **When** Helm charts are deployed, **Then** all pods are running with Dapr sidecars.
2. **Given** the cluster has an ingress controller, **When** the frontend service is exposed, **Then** a stable public URL (IP or domain) is accessible from any browser.
3. **Given** the public URL is accessed, **When** a user signs up and creates tasks, **Then** all features (priorities, tags, search, filter, sort, due dates) work correctly.
4. **Given** managed Kafka (Redpanda Cloud) is configured, **When** task events are published, **Then** events flow through the cloud Kafka cluster correctly.
5. **Given** the cloud deployment, **When** the database is PostgreSQL (managed), **Then** data persists across pod restarts.
6. **Given** secrets are needed in cloud, **When** the application reads them, **Then** they come from Kubernetes Secrets via Dapr Secrets API (not env vars or hardcoded).

---

### User Story 9 — CI/CD Pipeline (Priority: P2)

As a developer, I want a GitHub Actions CI/CD pipeline that automatically builds, tests, and deploys on push so the deployment stays current.

**Why this priority**: CI/CD automates the deployment process but the app can be deployed manually. Essential for professional workflow but not blocking for the demo.

**Independent Test**: Push a commit to the main branch and verify the pipeline builds Docker images, runs tests, and deploys to the cloud cluster.

**Acceptance Scenarios**:

1. **Given** a push to the `main` branch, **When** GitHub Actions triggers, **Then** the pipeline runs: lint → test → build → push images → deploy.
2. **Given** the pipeline runs tests, **When** any test fails, **Then** the pipeline stops and does NOT deploy.
3. **Given** the pipeline builds Docker images, **When** the build succeeds, **Then** images are pushed to a container registry (Docker Hub / GHCR) with appropriate tags.
4. **Given** images are pushed, **When** the deploy step runs, **Then** Helm upgrades are applied to the cloud cluster.
5. **Given** the deployment completes, **When** health checks pass, **Then** the pipeline reports success.

---

### User Story 10 — Observability & Monitoring (Priority: P2)

As a DevOps engineer, I want health checks, structured logging, and basic monitoring so I can detect and diagnose issues in production.

**Why this priority**: Observability is essential for production but the app functions without it. Provides operational confidence.

**Independent Test**: Check that all pods have passing health probes, verify structured logs are emitted, and confirm monitoring dashboards show key metrics.

**Acceptance Scenarios**:

1. **Given** all pods are running, **When** liveness probes are checked, **Then** all return healthy within timeout.
2. **Given** the backend processes a request, **When** the response is sent, **Then** a structured log entry (JSON) is emitted with request_id, method, path, status, duration_ms.
3. **Given** an error occurs, **When** the error is logged, **Then** the log includes stack trace, request context, and severity level.
4. **Given** Kafka consumers are running, **When** an event is processed, **Then** the processing time and success/failure are logged.
5. **Given** the system is deployed, **When** checking cluster health, **Then** `kubectl get pods` shows all pods running and ready.

---

### Edge Cases

- What happens when Kafka is temporarily unavailable? (Events must be retried or queued locally)
- What happens when a recurring task's parent is deleted? (Stop recurrence, orphan handling)
- What happens when a due date is set in the past? (Show as overdue immediately, no reminder)
- What happens when multiple filters return zero results? (Show empty state with "No tasks match filters")
- What happens when Dapr sidecar is not ready? (Backend should wait or fail gracefully with clear error)
- What happens when cloud Kafka (Redpanda) connection drops? (Dapr retry policy, circuit breaker)
- What happens when a user creates a task with 50+ tags? (Limit to 10 tags per task)
- What happens when a search query contains special regex characters? (Escape or use literal search)
- What happens when a recurring task generates while the user is offline? (Tasks appear on next sync)

---

## Requirements *(mandatory)*

### Functional Requirements

**Scope A — Advanced Features:**
- **FR-001**: System MUST support task priority levels: `high`, `medium`, `low`, `none` (default: `none`).
- **FR-002**: System MUST support task tags as a list of strings (max 10 tags per task, max 30 chars per tag).
- **FR-003**: System MUST support task due dates as optional ISO-8601 datetime fields.
- **FR-004**: System MUST support full-text search on task `title` and `description` fields (case-insensitive).
- **FR-005**: System MUST support filtering by: status (pending/completed), priority (high/medium/low), tag (exact match), due date range.
- **FR-006**: System MUST support sorting by: created_at, updated_at, due_date, priority, title (ascending/descending).
- **FR-007**: System MUST support recurring task patterns: `daily`, `weekly`, `monthly`, `custom` (cron expression).
- **FR-008**: System MUST automatically generate new task instances from recurring patterns via event consumers.
- **FR-009**: System MUST support scheduled reminders that fire at a configurable time before the due date (default: 15 minutes).
- **FR-010**: System MUST limit tags to 10 per task and validate tag format (alphanumeric + hyphens, 1-30 chars).

**Scope B — Event-Driven Architecture:**
- **FR-011**: System MUST publish events for all task lifecycle actions: `task.created`, `task.updated`, `task.completed`, `task.deleted`.
- **FR-012**: System MUST use three Kafka topics: `task-events`, `reminders`, `task-updates`.
- **FR-013**: All events MUST include: `event_id` (UUID), `event_type`, `timestamp` (ISO-8601), `user_id`, `task_id`, `payload`.
- **FR-014**: System MUST implement an audit log consumer that records all events from `task-events` topic.
- **FR-015**: System MUST implement a reminder consumer that processes events from `reminders` topic.
- **FR-016**: System MUST implement a recurring task consumer that generates new tasks from `task-updates` topic.
- **FR-017**: Events MUST be idempotent — reprocessing the same event MUST NOT create duplicates (use event_id for deduplication).

**Scope C — Dapr Integration:**
- **FR-018**: All Kafka publish/subscribe MUST go through Dapr Pub/Sub building block — no direct Kafka client in application code.
- **FR-019**: System MUST use Dapr State Management for caching and session state.
- **FR-020**: System MUST use Dapr Service Invocation for inter-service communication where applicable.
- **FR-021**: System MUST use Dapr Jobs API for scheduling exact-time reminders.
- **FR-022**: System MUST use Dapr Secrets Management for all sensitive configuration (JWT_SECRET, DB credentials, API keys).
- **FR-023**: Switching infrastructure (local Kafka → cloud Kafka) MUST require only Dapr component YAML changes — zero application code changes.

**Scope D — Local Validation:**
- **FR-024**: System MUST deploy Strimzi Kafka operator on Minikube with a single-broker cluster.
- **FR-025**: System MUST deploy Dapr on Minikube with control plane components.
- **FR-026**: Backend pods MUST have Dapr sidecar annotations for automatic sidecar injection.
- **FR-027**: All Kafka topics MUST be created and verified on Minikube before cloud deployment.
- **FR-028**: End-to-end event flow MUST be validated locally (create task → event published → consumer processes → audit logged).

**Scope E — Cloud Deployment:**
- **FR-029**: System MUST deploy to a managed Kubernetes service (AKS, GKE, or OKE).
- **FR-030**: System MUST use a managed PostgreSQL database (not SQLite) in cloud.
- **FR-031**: System MUST use managed Kafka (Redpanda Cloud or equivalent) in cloud.
- **FR-032**: Frontend MUST be exposed via a public URL (LoadBalancer or Ingress with stable IP/domain).
- **FR-033**: System MUST use Kubernetes Secrets for all sensitive data in cloud.
- **FR-034**: System MUST support HTTPS for the public endpoint (TLS termination at ingress).
- **FR-035**: Docker images MUST be pushed to a container registry (Docker Hub or GHCR).

**Scope F — CI/CD & Observability:**
- **FR-036**: System MUST have a GitHub Actions workflow that triggers on push to `main`.
- **FR-037**: CI pipeline MUST run: lint → test → build → push images.
- **FR-038**: CD pipeline MUST deploy to cloud cluster via Helm upgrade.
- **FR-039**: All backend logs MUST be structured JSON with: timestamp, level, request_id, message.
- **FR-040**: All pods MUST have liveness and readiness probes.
- **FR-041**: System MUST emit basic metrics: request count, error rate, event processing latency.

### Key Entities

- **Task** (extended): Existing task model + `priority` (enum), `tags` (list[str]), `due_date` (datetime|null), `reminder_at` (datetime|null), `recurrence_pattern` (str|null), `recurrence_enabled` (bool), `parent_task_id` (str|null).
- **TaskEvent**: Event envelope — `event_id`, `event_type`, `timestamp`, `user_id`, `task_id`, `payload` (JSON), `version` (int).
- **AuditLog**: Persistent audit record — `id`, `event_id`, `event_type`, `user_id`, `task_id`, `timestamp`, `payload_snapshot`.
- **ReminderJob**: Dapr job metadata — `job_name`, `task_id`, `user_id`, `fire_at` (datetime), `status` (pending/fired/cancelled).
- **RecurrenceRule**: Pattern definition — `pattern` (daily/weekly/monthly/custom), `cron_expression` (for custom), `next_occurrence` (datetime), `last_generated` (datetime).

---

## Event Schemas

### task.created
```json
{
  "event_id": "uuid-v4",
  "event_type": "task.created",
  "timestamp": "2026-02-06T12:00:00Z",
  "version": 1,
  "user_id": "user-uuid",
  "task_id": "task-uuid",
  "payload": {
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "priority": "high",
    "tags": ["shopping", "personal"],
    "due_date": "2026-02-07T18:00:00Z",
    "recurrence_pattern": null
  }
}
```

### task.updated
```json
{
  "event_id": "uuid-v4",
  "event_type": "task.updated",
  "timestamp": "2026-02-06T12:05:00Z",
  "version": 1,
  "user_id": "user-uuid",
  "task_id": "task-uuid",
  "payload": {
    "changes": {
      "priority": { "old": "medium", "new": "high" },
      "tags": { "old": ["shopping"], "new": ["shopping", "urgent"] }
    }
  }
}
```

### task.completed
```json
{
  "event_id": "uuid-v4",
  "event_type": "task.completed",
  "timestamp": "2026-02-06T14:00:00Z",
  "version": 1,
  "user_id": "user-uuid",
  "task_id": "task-uuid",
  "payload": {
    "completed_at": "2026-02-06T14:00:00Z",
    "was_overdue": false
  }
}
```

### task.deleted
```json
{
  "event_id": "uuid-v4",
  "event_type": "task.deleted",
  "timestamp": "2026-02-06T15:00:00Z",
  "version": 1,
  "user_id": "user-uuid",
  "task_id": "task-uuid",
  "payload": {
    "reason": "user_initiated"
  }
}
```

### reminder.trigger
```json
{
  "event_id": "uuid-v4",
  "event_type": "reminder.trigger",
  "timestamp": "2026-02-07T17:45:00Z",
  "version": 1,
  "user_id": "user-uuid",
  "task_id": "task-uuid",
  "payload": {
    "task_title": "Buy groceries",
    "due_date": "2026-02-07T18:00:00Z",
    "minutes_until_due": 15
  }
}
```

### recurrence.generate
```json
{
  "event_id": "uuid-v4",
  "event_type": "recurrence.generate",
  "timestamp": "2026-02-07T00:00:00Z",
  "version": 1,
  "user_id": "user-uuid",
  "task_id": "parent-task-uuid",
  "payload": {
    "pattern": "daily",
    "new_task_id": "new-task-uuid",
    "new_due_date": "2026-02-08T18:00:00Z"
  }
}
```

---

## Dapr Component Specifications

### Pub/Sub Component (Local — Strimzi Kafka)
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "kafka-cluster-kafka-bootstrap.kafka.svc.cluster.local:9092"
    - name: authType
      value: "none"
```

### Pub/Sub Component (Cloud — Redpanda)
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "<redpanda-cloud-broker-url>:9093"
    - name: authType
      value: "sasl"
    - name: saslMechanism
      value: "SCRAM-SHA-256"
    - name: saslUsername
      secretKeyRef:
        name: kafka-secrets
        key: username
    - name: saslPassword
      secretKeyRef:
        name: kafka-secrets
        key: password
```

### State Store Component
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.postgresql
  version: v1
  metadata:
    - name: connectionString
      secretKeyRef:
        name: db-secrets
        key: connection-string
```

### Secrets Component (Kubernetes)
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: secretstore
spec:
  type: secretstores.kubernetes
  version: v1
```

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 8 new task fields (priority, tags, due_date, reminder_at, recurrence_pattern, recurrence_enabled, parent_task_id, reminder_minutes_before) are persisted and returned via API.
- **SC-002**: Search returns matching tasks within 500ms for datasets up to 1000 tasks per user.
- **SC-003**: Filter + sort combinations return correct results for all supported criteria.
- **SC-004**: Task lifecycle events are published to Kafka within 200ms of API response.
- **SC-005**: Audit log consumer records 100% of published events with zero loss.
- **SC-006**: Reminders fire within 60 seconds of scheduled time via Dapr Jobs API.
- **SC-007**: Recurring tasks are auto-generated within 5 minutes of their scheduled trigger.
- **SC-008**: Zero direct Kafka client calls exist in application code — all go through Dapr APIs.
- **SC-009**: Switching Dapr component YAML from local to cloud requires zero application code changes.
- **SC-010**: The public URL loads the frontend and all features work end-to-end from any browser.
- **SC-011**: CI/CD pipeline completes (build + test + deploy) in under 10 minutes.
- **SC-012**: All pods pass liveness and readiness probes within 120 seconds of deployment.

---

## Assumptions

- Minikube is running with at least 6GB RAM and 4 CPUs (Kafka + Dapr increase resource needs).
- Docker Desktop is installed and running.
- `helm`, `kubectl`, `dapr` CLI are available on PATH.
- A cloud Kubernetes account (AKS/GKE/OKE) is available with sufficient quota.
- A container registry (Docker Hub or GHCR) is available for image hosting.
- A managed Kafka service (Redpanda Cloud free tier or equivalent) is available.
- A managed PostgreSQL service (Neon free tier or equivalent) is available for cloud deployment.
- GitHub repository has Actions enabled and necessary secrets configured.
- The Anthropic API key is optional — chatbot degrades gracefully without it.

---

## Scope Boundaries

**In Scope:**
- Task model extension (priority, tags, due_date, recurrence, reminders)
- Search, filter, sort API and UI
- Kafka event pipeline via Dapr pub/sub
- Dapr building blocks (pub/sub, state, service invocation, jobs, secrets)
- Strimzi Kafka on Minikube (local)
- Managed Kafka on cloud (Redpanda)
- Cloud Kubernetes deployment (AKS/GKE/OKE)
- PostgreSQL migration for cloud
- CI/CD pipeline (GitHub Actions)
- Structured logging
- Ingress + TLS for public URL
- Updated Helm charts for all services + Dapr
- Updated Dockerfiles if needed

**Out of Scope:**
- WebSocket real-time push (polling or Dapr subscription is sufficient)
- User notification preferences (email, SMS) — in-app only
- Task sharing or collaboration between users
- File attachments on tasks
- Subtasks or task hierarchies (beyond recurrence parent/child)
- Custom theme/branding
- Mobile native app
- Load testing or performance optimization beyond basic benchmarks
- Multi-region deployment
- Service mesh (Istio/Linkerd)
- Advanced Kafka features (exactly-once semantics, transactions)

---

## Dependencies

- Phase IV (local K8s deployment) MUST be fully functional — **DONE**
- Strimzi Kafka operator (v0.40+) for Minikube
- Dapr runtime (v1.14+) for both local and cloud
- Cloud Kubernetes account with cluster admin access
- Managed PostgreSQL (Neon or equivalent)
- Managed Kafka (Redpanda Cloud or equivalent)
- Container registry (Docker Hub or GHCR)
- GitHub Actions runners (GitHub-hosted)

---

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Minikube resource exhaustion (Kafka + Dapr + Apps) | High | High | Allocate 6GB+ RAM, use single-broker Kafka, minimal replicas |
| Dapr Jobs API instability (alpha) | Medium | Medium | Implement fallback scheduler if Jobs API fails; use latest stable Dapr |
| Cloud free-tier limits exceeded | Medium | Medium | Use smallest resource configs; monitor quotas; have paid backup plan |
| Kafka message ordering guarantees | Low | Medium | Use task_id as partition key to ensure per-task ordering |
| CI/CD pipeline flakiness | Medium | Low | Add retry logic; cache Docker layers; set reasonable timeouts |

---

## API Contract Extensions

### Task CRUD — Updated Endpoints

**POST /api/tasks** (extended request body):
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "priority": "high | medium | low | none (default: none)",
  "tags": ["string"] ,
  "due_date": "ISO-8601 datetime (optional)",
  "reminder_minutes_before": "integer (optional, default: 15)",
  "recurrence_pattern": "daily | weekly | monthly | custom (optional)",
  "recurrence_cron": "string (optional, required if pattern=custom)"
}
```

**GET /api/tasks** (extended query params):
```
?search=keyword
&priority=high,medium
&tags=work,urgent
&status=pending|completed
&due_before=ISO-8601
&due_after=ISO-8601
&sort_by=created_at|updated_at|due_date|priority|title
&sort_order=asc|desc
&page=1
&page_size=20
```

**Task Response** (extended):
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string | null",
  "completed": false,
  "priority": "high",
  "tags": ["work", "urgent"],
  "due_date": "2026-02-07T18:00:00Z",
  "reminder_at": "2026-02-07T17:45:00Z",
  "recurrence_pattern": "daily",
  "recurrence_enabled": true,
  "parent_task_id": "uuid | null",
  "is_overdue": true,
  "user_id": "uuid",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}
```

### New Endpoints

**GET /api/tasks/search?q=keyword** — Full-text search
**GET /api/events/audit?task_id=uuid** — Get audit trail for a task
**POST /api/tasks/{task_id}/reminder** — Manually schedule a reminder
**DELETE /api/tasks/{task_id}/recurrence** — Stop recurrence

### Dapr Endpoints (internal, used by backend)

**POST /v1.0/publish/pubsub/{topic}** — Publish event
**POST /v1.0/state/statestore** — Save state
**GET /v1.0/state/statestore/{key}** — Get state
**POST /v1.0-alpha1/jobs/{job-name}** — Schedule reminder job
**GET /v1.0/secrets/secretstore/{key}** — Get secret
