# Implementation Plan: Phase V — Advanced Features, Event-Driven Architecture & Cloud Deployment

**Branch**: `004-phase-v-cloud-native` | **Date**: 2026-02-06 | **Spec**: `specs/004-phase-v-cloud-native/spec.md`
**Input**: Feature specification from `specs/004-phase-v-cloud-native/spec.md`

## Summary

Phase V transforms the existing two-tier Todo Chatbot (Next.js frontend + FastAPI backend on Minikube) into a production-grade, event-driven microservices system. The plan extends the Task model with priorities, tags, due dates, recurrence, and reminders; introduces Kafka for event streaming via Dapr building blocks; validates locally on Minikube with Strimzi; deploys to cloud Kubernetes with a public URL; and adds CI/CD with GitHub Actions.

## Technical Context

**Language/Version**: Python 3.12 (backend), TypeScript 5.3 / Node 18 (frontend)
**Primary Dependencies**: FastAPI 0.109+, SQLModel 0.0.14+, Next.js 14.2, Dapr SDK (Python) 1.14+, Strimzi Kafka 0.40+
**Storage**: SQLite (local dev) → PostgreSQL (cloud via Neon/managed), Dapr State Store
**Messaging**: Apache Kafka via Dapr Pub/Sub (Strimzi local, Redpanda Cloud production)
**Testing**: pytest (backend), manual E2E validation
**Target Platform**: Kubernetes (Minikube local, AKS/GKE/OKE cloud)
**Project Type**: Web application (frontend + backend + event consumers)
**Performance Goals**: <500ms search, <200ms event publish, <60s reminder accuracy
**Constraints**: All infra access via Dapr APIs only, zero direct Kafka clients
**Scale/Scope**: Single-user to small team, 1000 tasks per user max

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| No hardcoded secrets | ✅ PASS | Dapr Secrets API for all sensitive config |
| SQLModel for DB access | ✅ PASS | Extended models via SQLModel |
| TypeScript strict mode | ✅ PASS | Frontend unchanged |
| Python type hints | ✅ PASS | All new backend code typed |
| CORS restricted | ✅ PASS | Configured per environment |
| Input validation | ✅ PASS | Pydantic schemas for all endpoints |
| Error handling | ✅ PASS | HTTPException with structured errors |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        KUBERNETES CLUSTER                        │
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │   Frontend Pod    │    │         Backend Pod               │   │
│  │  ┌─────────────┐ │    │  ┌─────────────┐ ┌────────────┐ │   │
│  │  │  Next.js     │ │    │  │  FastAPI     │ │ Dapr       │ │   │
│  │  │  App         │─┼────┼─▶│  App         │ │ Sidecar    │ │   │
│  │  │  Port 3000   │ │    │  │  Port 8000   │ │ Port 3500  │ │   │
│  │  └─────────────┘ │    │  └──────┬───────┘ └─────┬──────┘ │   │
│  └──────────────────┘    │         │               │         │   │
│                           └─────────┼───────────────┼─────────┘   │
│                                     │               │             │
│                      ┌──────────────▼───────────────▼──────────┐ │
│                      │           DAPR CONTROL PLANE             │ │
│                      │  ┌─────────┐ ┌────────┐ ┌───────────┐  │ │
│                      │  │ Pub/Sub │ │ State  │ │ Secrets   │  │ │
│                      │  │ (Kafka) │ │ Store  │ │ (K8s)     │  │ │
│                      │  └────┬────┘ └───┬────┘ └───────────┘  │ │
│                      │       │          │                      │ │
│                      │  ┌────▼────┐ ┌───▼────────┐            │ │
│                      │  │ Jobs   │ │ Service    │            │ │
│                      │  │ API    │ │ Invocation │            │ │
│                      │  └────────┘ └────────────┘            │ │
│                      └─────────────────────────────────────────┘ │
│                                     │                             │
│                      ┌──────────────▼──────────────┐             │
│                      │       KAFKA CLUSTER          │             │
│                      │  ┌───────────────────────┐  │             │
│                      │  │ task-events           │  │             │
│                      │  │ reminders             │  │             │
│                      │  │ task-updates          │  │             │
│                      │  └───────────────────────┘  │             │
│                      └─────────────────────────────┘             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              EVENT CONSUMERS (Backend Process)            │   │
│  │  ┌──────────────┐ ┌────────────┐ ┌───────────────────┐  │   │
│  │  │ Audit Log    │ │ Reminder   │ │ Recurring Task    │  │   │
│  │  │ Consumer     │ │ Consumer   │ │ Consumer          │  │   │
│  │  │ (task-events)│ │ (reminders)│ │ (task-updates)    │  │   │
│  │  └──────────────┘ └────────────┘ └───────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────┐                                           │
│  │  PostgreSQL       │  (Cloud: Neon managed / Local: SQLite)    │
│  └──────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

### Documentation (this feature)

```text
specs/004-phase-v-cloud-native/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── data-model.md        # Extended data models
├── contracts/           # API and event contracts
└── tasks.md             # Task breakdown (next step)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── main.py                    # FastAPI app (add Dapr subscription routes)
│   ├── config.py                  # Extended settings (Dapr config)
│   ├── database.py                # Database init (unchanged for local)
│   ├── models/
│   │   ├── task.py                # EXTENDED: priority, tags, due_date, recurrence fields
│   │   ├── user.py                # Unchanged
│   │   └── audit_log.py           # NEW: Audit log model
│   ├── schemas/
│   │   ├── task.py                # EXTENDED: new fields in create/update/response
│   │   ├── events.py              # NEW: Event envelope schemas
│   │   └── filters.py             # NEW: Search/filter/sort query schemas
│   ├── services/
│   │   ├── task_service.py        # EXTENDED: search, filter, sort, recurrence logic
│   │   ├── event_service.py       # NEW: Dapr pub/sub event publishing
│   │   ├── reminder_service.py    # NEW: Dapr Jobs API for reminders
│   │   └── dapr_client.py         # NEW: Dapr HTTP client wrapper
│   ├── consumers/
│   │   ├── __init__.py            # NEW
│   │   ├── audit_consumer.py      # NEW: Audit log subscriber
│   │   ├── reminder_consumer.py   # NEW: Reminder trigger subscriber
│   │   └── recurrence_consumer.py # NEW: Recurring task generator subscriber
│   ├── routers/
│   │   ├── tasks.py               # EXTENDED: search/filter/sort params, new endpoints
│   │   ├── events.py              # NEW: Audit trail endpoints
│   │   └── subscriptions.py       # NEW: Dapr subscription endpoint
│   └── dependencies/
│       └── auth.py                # Unchanged
├── dapr/
│   ├── components/
│   │   ├── pubsub-kafka-local.yaml    # Strimzi Kafka pub/sub
│   │   ├── pubsub-kafka-cloud.yaml    # Redpanda Cloud pub/sub
│   │   ├── statestore-local.yaml      # Local state store
│   │   ├── statestore-cloud.yaml      # Cloud PostgreSQL state store
│   │   └── secretstore-k8s.yaml       # Kubernetes secrets store
│   └── config.yaml                     # Dapr configuration
├── tests/                             # Extended tests
├── Dockerfile                         # Updated for Dapr compatibility
└── requirements.txt                   # Extended dependencies

frontend/
├── app/                               # Existing structure
├── components/
│   └── tasks/
│       ├── TaskCard.tsx               # EXTENDED: priority badge, tags, due date
│       ├── TaskForm.tsx               # EXTENDED: priority, tags, due date, recurrence
│       ├── TaskFilters.tsx            # EXTENDED: priority, tag, date filters + search
│       ├── TaskList.tsx               # EXTENDED: sort controls
│       └── ReminderToast.tsx          # NEW: Reminder notification component
├── hooks/
│   └── useTasks.ts                    # EXTENDED: search, filter, sort state
├── types/
│   └── index.ts                       # EXTENDED: Task type + new fields
└── lib/
    └── api.ts                         # EXTENDED: new query params

helm/
├── backend/
│   ├── values.yaml                    # UPDATED: Dapr annotations, env vars
│   ├── templates/
│   │   ├── deployment.yaml            # UPDATED: Dapr sidecar annotations
│   │   ├── configmap.yaml             # UPDATED: Dapr + Kafka config
│   │   └── dapr-components.yaml       # NEW: Dapr component manifests
│   └── values-cloud.yaml             # NEW: Cloud-specific overrides
├── frontend/
│   └── values.yaml                    # Minor updates
├── kafka/
│   ├── strimzi-operator.yaml          # NEW: Strimzi operator install
│   └── kafka-cluster.yaml             # NEW: Single-broker Kafka cluster
└── dapr/
    └── dapr-system.yaml               # NEW: Dapr install configuration

.github/
└── workflows/
    └── ci-cd.yaml                     # NEW: GitHub Actions pipeline

k8s/
├── cloud/
│   ├── namespace.yaml                 # NEW: Cloud namespace
│   ├── secrets.yaml                   # NEW: Secret templates
│   └── ingress.yaml                   # NEW: Ingress for public URL
└── local/
    └── namespace.yaml                 # NEW: Local namespaces
```

**Structure Decision**: Extend the existing `backend/` + `frontend/` + `helm/` structure. New `backend/dapr/` directory for Dapr component configs. New `backend/app/consumers/` package for event consumers. New `.github/workflows/` for CI/CD. New `k8s/` for cloud-specific manifests.

---

## Phase 0: Research & Validation

### 0.1 Dapr Compatibility
- Dapr 1.14+ supports Jobs API (alpha → beta in 1.14)
- Python Dapr SDK or direct HTTP calls to sidecar at `localhost:3500`
- Decision: **Use direct HTTP calls** via `httpx` to Dapr sidecar (simpler, no extra SDK dependency, full control)

### 0.2 Strimzi on Minikube
- Strimzi Operator 0.40+ supports single-broker clusters
- Resource requirement: ~1.5GB RAM for Kafka + ZooKeeper (KRaft mode preferred)
- Decision: **Use KRaft mode** (no ZooKeeper) to reduce resource usage

### 0.3 Cloud Provider Selection
- AKS (Azure): Free tier with $200 credit, good Dapr support (CNCF project)
- GKE (Google): Free tier with $300 credit, Autopilot mode
- OKE (Oracle): Always-free ARM instances
- Decision: **Document all three**, user selects based on available account. Default instructions for AKS (best Dapr ecosystem).

### 0.4 Managed Kafka Selection
- Redpanda Cloud: Serverless tier (free), Kafka-compatible
- Confluent Cloud: Free tier available
- Decision: **Redpanda Cloud** (recommended in spec, free serverless tier)

---

## Phase 1: Data Model & API Design

### 1.1 Extended Task Model

```python
class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    title: str
    description: Optional[str] = None
    completed: bool = Field(default=False)
    user_id: str = Field(foreign_key="users.id", index=True)

    # Phase V: Advanced fields
    priority: str = Field(default="none")          # high, medium, low, none
    tags: str = Field(default="")                   # Comma-separated (SQLite-safe)
    due_date: Optional[datetime] = None
    reminder_at: Optional[datetime] = None
    reminder_minutes_before: int = Field(default=15)
    recurrence_pattern: Optional[str] = None        # daily, weekly, monthly, custom
    recurrence_cron: Optional[str] = None           # Cron expr for custom
    recurrence_enabled: bool = Field(default=False)
    parent_task_id: Optional[str] = Field(default=None, foreign_key="tasks.id")

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Design Decision — Tags Storage**: Store tags as comma-separated string in the DB column. This works with both SQLite and PostgreSQL without requiring JSON columns or join tables. Parse to `List[str]` in the Pydantic schema layer.

### 1.2 Audit Log Model

```python
class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    event_id: str = Field(index=True)
    event_type: str = Field(index=True)
    user_id: str = Field(index=True)
    task_id: str = Field(index=True)
    timestamp: datetime
    payload_snapshot: str  # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### 1.3 API Extensions

**Task Create/Update schemas** add: `priority`, `tags`, `due_date`, `reminder_minutes_before`, `recurrence_pattern`, `recurrence_cron`.

**Task Response schema** adds: `priority`, `tags` (as list), `due_date`, `reminder_at`, `recurrence_pattern`, `recurrence_enabled`, `parent_task_id`, `is_overdue` (computed).

**GET /api/tasks** query params: `search`, `priority`, `tags`, `status`, `due_before`, `due_after`, `sort_by`, `sort_order`, `page`, `page_size`.

**New endpoints**: `GET /api/tasks/search`, `GET /api/events/audit`, `POST /api/tasks/{id}/reminder`, `DELETE /api/tasks/{id}/recurrence`.

---

## Phase 2: Event-Driven Architecture Design

### 2.1 Event Flow

```
User Action → FastAPI Router → TaskService (DB write)
                                    │
                                    ▼
                            EventService.publish()
                                    │
                                    ▼ (HTTP POST to Dapr sidecar)
                            Dapr Pub/Sub → Kafka Topic
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            Audit Consumer  Reminder Consumer  Recurrence Consumer
            (task-events)   (reminders)        (task-updates)
                    │               │               │
                    ▼               ▼               ▼
            Write AuditLog  Schedule Dapr Job  Create new Task
```

### 2.2 Kafka Topics

| Topic | Publisher | Consumer | Purpose |
|-------|-----------|----------|---------|
| `task-events` | Backend (on CRUD) | Audit Consumer | Log all task lifecycle events |
| `reminders` | Backend (on due_date set) | Reminder Consumer | Trigger notification at scheduled time |
| `task-updates` | Backend (on task.completed for recurring) | Recurrence Consumer | Generate next task instance |

### 2.3 Dapr Subscription Endpoint

The backend exposes a `GET /dapr/subscribe` endpoint that tells the Dapr sidecar which topics to subscribe to and which routes to deliver events to:

```python
@router.get("/dapr/subscribe")
def subscribe():
    return [
        {"pubsubname": "pubsub", "topic": "task-events", "route": "/api/events/task-events"},
        {"pubsubname": "pubsub", "topic": "reminders", "route": "/api/events/reminders"},
        {"pubsubname": "pubsub", "topic": "task-updates", "route": "/api/events/task-updates"},
    ]
```

### 2.4 Event Publishing via Dapr

All event publishing goes through Dapr sidecar HTTP API:

```python
class EventService:
    DAPR_URL = "http://localhost:3500/v1.0/publish/pubsub"

    @staticmethod
    async def publish(topic: str, event: TaskEvent):
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{EventService.DAPR_URL}/{topic}",
                json=event.dict(),
                headers={"Content-Type": "application/json"}
            )
```

---

## Phase 3: Dapr Integration Design

### 3.1 Building Blocks Used

| Building Block | Component Type | Local | Cloud |
|----------------|---------------|-------|-------|
| Pub/Sub | `pubsub.kafka` | Strimzi Kafka | Redpanda Cloud |
| State Management | `state.postgresql` | In-memory / SQLite state | Neon PostgreSQL |
| Service Invocation | Built-in | Dapr DNS | Dapr DNS |
| Jobs API | Built-in | Dapr Scheduler | Dapr Scheduler |
| Secrets | `secretstores.kubernetes` | K8s Secrets | K8s Secrets |

### 3.2 Dapr Sidecar Configuration

Backend deployment annotations:
```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-id: "todo-backend"
  dapr.io/app-port: "8000"
  dapr.io/app-protocol: "http"
  dapr.io/enable-api-logging: "true"
```

### 3.3 Infrastructure Abstraction Guarantee

**Key design principle**: The FastAPI application code ONLY interacts with `http://localhost:3500` (Dapr sidecar). It never imports Kafka libraries, never connects directly to PostgreSQL state store, never reads Kubernetes secrets directly. All infrastructure is behind Dapr APIs.

This means:
- Switching from Strimzi to Redpanda = change `pubsub-kafka.yaml` component file only
- Switching from SQLite state to PostgreSQL state = change `statestore.yaml` component file only
- Zero application code changes when switching infrastructure

---

## Phase 4: Kubernetes Strategy

### 4.1 Local (Minikube)

```
Namespace: default
├── todo-backend (Deployment + Dapr sidecar)
├── todo-frontend (Deployment)
├── todo-backend-svc (Service, NodePort)
└── todo-frontend-svc (Service, NodePort)

Namespace: kafka
├── strimzi-cluster-operator (Deployment)
└── kafka-cluster (Kafka CR → broker pod)

Namespace: dapr-system
├── dapr-operator
├── dapr-sentry
├── dapr-placement
└── dapr-scheduler
```

**Resource Budget (Minikube)**:
- Kafka broker: 1GB RAM, 500m CPU
- Dapr control plane: 512MB RAM, 250m CPU
- Backend + sidecar: 512MB RAM, 500m CPU
- Frontend: 512MB RAM, 500m CPU
- **Total**: ~3GB RAM, 1.75 CPU → Minikube needs 6GB RAM, 4 CPUs

### 4.2 Cloud

```
Namespace: todo-app
├── todo-backend (Deployment + Dapr sidecar)
├── todo-frontend (Deployment)
├── todo-backend-svc (Service, ClusterIP)
├── todo-frontend-svc (Service, ClusterIP)
└── todo-ingress (Ingress, public URL)

Namespace: dapr-system
├── Dapr control plane (installed via Helm)

External Services:
├── Redpanda Cloud (managed Kafka)
├── Neon PostgreSQL (managed DB)
└── Container Registry (Docker Hub / GHCR)
```

### 4.3 Ingress Strategy

Cloud deployment uses nginx-ingress or cloud-native ingress:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todo-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: todo-frontend
                port:
                  number: 3000
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: todo-backend
                port:
                  number: 8000
```

---

## Phase 5: Security & Configuration

### 5.1 Secrets Management

| Secret | Local (Minikube) | Cloud |
|--------|-----------------|-------|
| JWT_SECRET | K8s Secret → Dapr | K8s Secret → Dapr |
| DATABASE_URL | ConfigMap (SQLite) | K8s Secret → Dapr |
| ANTHROPIC_API_KEY | K8s Secret → Dapr | K8s Secret → Dapr |
| KAFKA_SASL_PASSWORD | N/A (no auth local) | K8s Secret → Dapr |
| BETTER_AUTH_SECRET | K8s Secret | K8s Secret |

### 5.2 Configuration Management

Environment-specific Helm values:
- `values.yaml` — defaults (local dev)
- `values-cloud.yaml` — cloud overrides (image registry, Dapr cloud components, resource limits)

---

## Phase 6: CI/CD Pipeline Design

```
┌─────────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Push to     │────▶│  Lint &  │────▶│  Test    │────▶│  Build & │────▶│  Deploy  │
│  main        │     │  Check   │     │  (pytest)│     │  Push    │     │  (Helm)  │
└─────────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
```

**GitHub Actions Workflow**:
1. **Trigger**: Push to `main` branch
2. **Lint**: Python linting (ruff), TypeScript check (tsc)
3. **Test**: pytest for backend
4. **Build**: Docker build for backend + frontend
5. **Push**: Push images to Docker Hub / GHCR
6. **Deploy**: `helm upgrade --install` to cloud cluster via kubeconfig secret

---

## Phase 7: Observability Design

### 7.1 Structured Logging

All backend logs in JSON format:
```python
import logging
import json

class JSONFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "request_id": getattr(record, "request_id", None),
        })
```

### 7.2 Health Probes

| Service | Liveness | Readiness |
|---------|----------|-----------|
| Backend | `GET /health` | `GET /health` (+ DB check) |
| Frontend | `GET /` | TCP port 3000 |
| Kafka | Strimzi operator handles | Strimzi operator handles |
| Dapr | Dapr sidecar handles | Dapr sidecar handles |

---

## Implementation Phases (Execution Order)

| Phase | Scope | Description | Dependencies |
|-------|-------|-------------|--------------|
| **P1** | A | Extend Task model + DB schema | None |
| **P2** | A | Backend API: search, filter, sort | P1 |
| **P3** | A | Frontend UI: priorities, tags, due dates, filters | P2 |
| **P4** | B+C | Event service + Dapr pub/sub integration | P2 |
| **P5** | B+C | Event consumers (audit, reminder, recurrence) | P4 |
| **P6** | C | Dapr components (state, secrets, jobs) | P4 |
| **P7** | D | Minikube validation (Strimzi + Dapr + full stack) | P5, P6 |
| **P8** | E | Cloud K8s deployment + public URL | P7 |
| **P9** | F | CI/CD pipeline + observability | P8 |
| **P10** | All | Final validation + documentation | P9 |

---

## Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| Minikube OOM with Kafka+Dapr | KRaft mode (no ZK), single broker, 6GB RAM allocation, reduce resource requests |
| Dapr Jobs API alpha instability | Use simple cron-based fallback; test on latest Dapr 1.14+ |
| Cloud quota limits | Start with smallest node sizes; monitor quota usage; document scale-up steps |
| Event ordering issues | Use `task_id` as Kafka partition key for per-task ordering guarantee |
| Frontend breaking changes | Extend types (additive only), maintain backward-compatible API responses |

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Kafka messaging system | Required by spec for event-driven architecture | Direct DB polling loses real-time capability and doesn't demonstrate event-driven patterns |
| Dapr sidecar layer | Required by spec for infrastructure abstraction | Direct Kafka/DB access couples application to infrastructure |
| Multiple Kafka topics | Clean separation of concerns for different event types | Single topic with type filtering becomes unwieldy and hard to scale |
| Consumer processes in same backend | Simplicity — consumers are Dapr subscription endpoints in FastAPI | Separate microservices adds deployment complexity with minimal benefit at this scale |

---

## Decisions Requiring ADR

1. **Tags storage as comma-separated string** — Trades query flexibility for SQLite/PostgreSQL portability
2. **Consumers as FastAPI endpoints (not separate services)** — Trades microservice purity for deployment simplicity
3. **Direct Dapr HTTP calls vs Python SDK** — Trades type safety for fewer dependencies
