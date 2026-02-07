# Data Model: Phase V — Extended Entities

## Task Model (Extended)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| id | str (UUID) | auto-generated | Primary key |
| title | str | required | Task title |
| description | str | null | Task description |
| completed | bool | false | Completion status |
| user_id | str (FK→users.id) | required | Owner |
| priority | str | "none" | Enum: high, medium, low, none |
| tags | str | "" | Comma-separated tags |
| due_date | datetime | null | When task is due |
| reminder_at | datetime | null | Computed: due_date - reminder_minutes |
| reminder_minutes_before | int | 15 | Minutes before due_date to remind |
| recurrence_pattern | str | null | daily, weekly, monthly, custom |
| recurrence_cron | str | null | Cron expression (custom only) |
| recurrence_enabled | bool | false | Whether recurrence is active |
| parent_task_id | str (FK→tasks.id) | null | Parent recurring task |
| created_at | datetime | now | Creation timestamp |
| updated_at | datetime | now | Last update timestamp |

## AuditLog Model (New)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| id | str (UUID) | auto-generated | Primary key |
| event_id | str | required | Original event UUID |
| event_type | str | required | task.created, task.updated, etc. |
| user_id | str | required | Who triggered |
| task_id | str | required | Which task |
| timestamp | datetime | required | When event occurred |
| payload_snapshot | str (JSON) | required | Event payload as JSON string |
| created_at | datetime | now | When audit record was created |

## TaskEvent Schema (Pydantic, not persisted as model)

| Field | Type | Description |
|-------|------|-------------|
| event_id | str (UUID) | Unique event identifier |
| event_type | str | Event type (task.created, etc.) |
| timestamp | str (ISO-8601) | Event timestamp |
| version | int | Schema version (1) |
| user_id | str | User who triggered |
| task_id | str | Affected task |
| payload | dict | Event-specific data |
