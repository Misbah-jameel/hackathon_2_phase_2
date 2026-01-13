# Project History: AI-Driven Full-Stack Application

## Project Goal
Build a production-ready full-stack application with:
- Modern React UI using Next.js 14+ App Router
- Python API backend with FastAPI
- PostgreSQL database with type-safe ORM
- Secure JWT-based authentication
- Spec-driven development workflow

---

## Technical Decisions (Locked)

### Frontend
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 14+ (App Router) | Server Components, streaming, built-in optimizations |
| Rendering | Server Components default | Performance, SEO, reduced client bundle |
| Data Mutations | Server Actions | Type-safe, colocated with components |
| Styling | Tailwind CSS | Utility-first, consistent design system |
| State | React hooks + Server State | Minimal client state; server is source of truth |

### Backend
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | FastAPI | Async, auto-docs, Pydantic validation |
| ORM | SQLModel | SQLAlchemy + Pydantic unified |
| Database | PostgreSQL | ACID, JSON support, mature ecosystem |
| Auth | JWT (access + refresh) | Stateless, scalable |
| API Style | REST | Simplicity, caching, tooling support |

### Infrastructure
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Dev Database | Local PostgreSQL or Docker | Consistent with production |
| Environment | `.env.local` (frontend), `.env` (backend) | 12-factor app compliance |
| API Communication | Fetch with typed responses | Native, no extra dependencies |

---

## Constraints

### Non-Negotiable
- All database access through SQLModel (no raw SQL)
- All API endpoints require authentication except `/auth/*`
- All user input validated server-side
- No secrets in code or version control

### Architectural
- Frontend and backend are separate deployables
- Backend serves JSON only (no HTML rendering)
- Database migrations via Alembic
- Feature code organized by domain, not layer

---

## Project Structure

```
/frontend (Next.js)
├── app/                  # App Router pages and layouts
│   ├── (auth)/          # Auth-related routes
│   ├── (dashboard)/     # Protected routes
│   └── api/             # Route handlers (if needed)
├── components/          # Reusable UI components
├── lib/                 # Utilities, API client, types
└── .env.local           # Frontend environment

/backend (FastAPI)
├── app/
│   ├── api/             # Route definitions
│   ├── models/          # SQLModel definitions
│   ├── schemas/         # Pydantic request/response
│   ├── services/        # Business logic
│   └── core/            # Config, security, deps
├── alembic/             # Migrations
└── .env                 # Backend environment

/specs                   # Spec-Kit feature specs
├── <feature>/
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
```

---

## Current State
- [x] Constitution defined
- [x] Technical stack decisions locked
- [ ] Project scaffolded
- [ ] Database schema defined
- [ ] Authentication implemented
- [ ] Core features specified

---

## Next Actions
Refer to `specs/` for current feature specifications and `tasks.md` for implementation queue.

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-06 | Adopted Next.js App Router + FastAPI stack | Modern patterns, type safety, performance |
| 2026-01-06 | JWT auth with access + refresh tokens | Stateless, scalable authentication |
| 2026-01-06 | SQLModel as ORM | Unified Pydantic + SQLAlchemy for type safety |
