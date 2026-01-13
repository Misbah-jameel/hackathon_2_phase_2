# Implementation Plan: Frontend Todo Application

**Branch**: `002-frontend-todo-app` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-frontend-todo-app/spec.md`

## Summary

Build a modern, polished multi-user Todo web application frontend using Next.js 14+ App Router with a white + golden (#FFD700) premium theme. The application provides task management (CRUD), user authentication via Better Auth/JWT, responsive design across all devices, and accessibility compliance. Technical approach uses Server Components by default with Client Components for interactivity, Tailwind CSS for styling, and optimistic UI updates for instant feedback.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 20+
**Primary Dependencies**: Next.js 14+, React 18+, Tailwind CSS 3.4+, Better Auth (JWT)
**Storage**: N/A (frontend only - backend API provides persistence)
**Testing**: Jest + React Testing Library, Playwright (E2E)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
**Project Type**: Web application (frontend)
**Performance Goals**: <3s page load on 3G, <1s perceived task operations, 60fps animations
**Constraints**: 320px minimum width, WCAG AA accessibility, optimistic updates with rollback
**Scale/Scope**: Up to 100 tasks per user, single-page feel with App Router

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| **Verification First** | ✅ PASS | Plan reads spec before designing; API contracts defined before implementation |
| **TypeScript Strict Mode** | ✅ PASS | Technical context specifies TypeScript 5.x strict mode |
| **Error Boundaries & Loading States** | ✅ PASS | FR-041, FR-042 require loading/empty states; error.tsx planned |
| **No Hardcoded Secrets** | ✅ PASS | JWT tokens from Better Auth; env variables for config |
| **Input Validation** | ✅ PASS | FR-017 requires form validation; client-side + server-side |
| **No `any` Type** | ✅ PASS | Strict TypeScript enforced; types defined in contracts |
| **No Invented APIs** | ✅ PASS | API contracts derived from spec; matches backend |
| **Response Format** | ✅ PASS | Plan follows Task Understanding → Approach → Changes → Verification |

**Gate Status**: ✅ ALL GATES PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/002-frontend-todo-app/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── api-client.ts    # TypeScript API client interface
│   └── types.ts         # Shared type definitions
└── tasks.md             # Phase 2 output (via /sp.tasks)
```

### Source Code (repository root)

```text
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (public)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected route group
│   │   ├── tasks/
│   │   │   ├── page.tsx          # Task list/dashboard
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Task detail (optional)
│   │   └── layout.tsx
│   ├── error.tsx                 # Global error boundary
│   ├── not-found.tsx             # 404 page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles + Tailwind
├── components/
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── Skeleton.tsx
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   ├── tasks/                    # Task-specific components
│   │   ├── TaskCard.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskFilters.tsx
│   │   └── TaskCounters.tsx
│   ├── auth/                     # Auth components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── AuthGuard.tsx
│   └── landing/                  # Landing page components
│       ├── Hero.tsx
│       ├── Features.tsx
│       └── CTA.tsx
├── lib/
│   ├── api.ts                    # API client (all backend calls)
│   ├── auth.ts                   # Better Auth client setup
│   ├── utils.ts                  # Utility functions
│   └── constants.ts              # App constants
├── hooks/
│   ├── useTasks.ts               # Task data hook
│   ├── useAuth.ts                # Auth state hook
│   └── useToast.ts               # Toast notification hook
├── types/
│   └── index.ts                  # TypeScript type definitions
├── public/
│   └── images/                   # Static assets
├── tailwind.config.ts            # Tailwind configuration
├── next.config.js                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json

tests/
├── e2e/                          # Playwright E2E tests
│   ├── auth.spec.ts
│   ├── tasks.spec.ts
│   └── landing.spec.ts
├── components/                   # Component unit tests
│   ├── TaskCard.test.tsx
│   ├── TaskForm.test.tsx
│   └── Button.test.tsx
└── hooks/                        # Hook tests
    └── useTasks.test.ts
```

**Structure Decision**: Web application (frontend only) using Next.js App Router with route groups for auth and protected dashboard. Components organized by domain (ui, layout, tasks, auth, landing).

## Component Architecture

### Component Hierarchy

```
App (Root Layout)
├── Header (client - auth state)
│   ├── Logo
│   ├── Navigation
│   └── UserMenu / AuthButtons
├── Main Content
│   ├── Landing Page (server)
│   │   ├── Hero
│   │   ├── Features
│   │   └── CTA
│   ├── Auth Pages (server + client forms)
│   │   ├── LoginForm (client)
│   │   └── SignupForm (client)
│   └── Dashboard (server + client interactions)
│       ├── TaskCounters (client - real-time)
│       ├── TaskFilters (client)
│       ├── TaskList (server + client)
│       │   └── TaskCard (client - interactions)
│       └── TaskForm Modal (client)
└── Footer (server)
```

### Server vs Client Components

| Component | Type | Reason |
|-----------|------|--------|
| Landing Page | Server | Static content, SEO |
| Hero, Features, CTA | Server | No interactivity |
| Header | Client | Auth state, user menu |
| Footer | Server | Static links |
| LoginForm, SignupForm | Client | Form state, validation |
| TaskList container | Server | Initial data fetch |
| TaskCard | Client | Click handlers, animations |
| TaskForm | Client | Form state, submission |
| TaskFilters | Client | Filter state |
| TaskCounters | Client | Real-time updates |
| Modal, Toast | Client | Portal, state |
| Button, Input | Client | Event handlers |
| Card, Skeleton | Server/Client | Depends on usage |

## Styling Architecture

### Tailwind Configuration

```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        golden: {
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          dark: '#E6C200',
          glow: 'rgba(255, 215, 0, 0.4)',
        },
        gray: {
          primary: '#1F2937',
          secondary: '#6B7280',
          border: '#E5E7EB',
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'golden-glow': '0 0 20px rgba(255, 215, 0, 0.4)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'check': 'check 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
    },
  },
}
```

### CSS Class Patterns

| Element | Classes |
|---------|---------|
| Primary Button | `bg-golden hover:bg-golden-light text-gray-primary font-semibold px-6 py-3 rounded-lg shadow-card hover:shadow-golden-glow transition-all duration-200` |
| Secondary Button | `bg-white border-2 border-golden text-golden hover:bg-golden hover:text-white px-6 py-3 rounded-lg transition-all duration-200` |
| Task Card | `bg-white rounded-xl shadow-card hover:shadow-card-hover p-4 transition-all duration-200` |
| Completed Task | `opacity-60 line-through` |
| Input Field | `w-full px-4 py-3 border border-gray-border rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent outline-none transition-all` |
| Modal Overlay | `fixed inset-0 bg-black/50 flex items-center justify-center z-50` |

## State Management

### Data Flow

```
Better Auth (JWT) → lib/auth.ts → useAuth hook → Components
                                      ↓
Backend API ← lib/api.ts ← useTasks hook ← Task Components
                  ↓
            Error/Loading States → Toast Notifications
```

### Optimistic Updates Pattern

```typescript
// Pattern for task completion toggle
1. User clicks checkbox
2. UI immediately updates (optimistic)
3. API call fires in background
4. On success: no action needed
5. On failure: revert UI, show error toast
```

## API Integration Points

All API calls through `/lib/api.ts`:

| Action | Method | Endpoint | Auth |
|--------|--------|----------|------|
| List Tasks | GET | /api/tasks | JWT |
| Create Task | POST | /api/tasks | JWT |
| Update Task | PATCH | /api/tasks/{id} | JWT |
| Delete Task | DELETE | /api/tasks/{id} | JWT |
| Toggle Complete | PATCH | /api/tasks/{id}/toggle | JWT |
| Login | POST | /api/auth/login | No |
| Signup | POST | /api/auth/signup | No |
| Logout | POST | /api/auth/logout | JWT |
| Get User | GET | /api/auth/me | JWT |

## Complexity Tracking

> No violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Better Auth integration complexity | Medium | Research auth patterns; fallback to manual JWT handling |
| Animation performance on low-end devices | Low | Use CSS animations; add reduced-motion support |
| Large task lists (100+) | Medium | Virtual scrolling if needed; pagination fallback |
| Optimistic update race conditions | Low | Queue requests; debounce rapid toggles |

## Next Steps

1. ✅ Phase 0: Research (research.md) - Auth patterns, animation libraries
2. ✅ Phase 1: Data model and contracts
3. ⏳ Phase 2: Task generation via `/sp.tasks`
