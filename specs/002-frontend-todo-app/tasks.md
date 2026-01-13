# Tasks: Frontend Todo Application

**Input**: Design documents from `/specs/002-frontend-todo-app/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested - implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US7)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/` at repository root (Next.js App Router)
- Components: `frontend/components/`
- Pages: `frontend/app/`
- Library: `frontend/lib/`
- Hooks: `frontend/hooks/`
- Types: `frontend/types/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Next.js project with all dependencies and configurations

- [ ] T001 Create Next.js 14+ project with App Router in frontend/ directory
- [ ] T002 Configure TypeScript strict mode in frontend/tsconfig.json
- [ ] T003 [P] Install and configure Tailwind CSS 3.4+ in frontend/tailwind.config.ts
- [ ] T004 [P] Install core dependencies: react-hook-form, zod, framer-motion in frontend/package.json
- [ ] T005 [P] Install Radix UI primitives: @radix-ui/react-dialog, @radix-ui/react-toast in frontend/package.json
- [ ] T006 [P] Configure ESLint with accessibility plugin in frontend/.eslintrc.json
- [ ] T007 Create environment configuration in frontend/.env.example and frontend/.env.local
- [ ] T008 Configure custom Tailwind theme (golden colors, shadows, animations) in frontend/tailwind.config.ts
- [ ] T009 Setup global styles with CSS variables in frontend/app/globals.css

---

## Phase 2: Foundational (Core Infrastructure)

**Purpose**: Shared components and utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Type Definitions

- [ ] T010 Create TypeScript types from contracts in frontend/types/index.ts
- [ ] T011 [P] Create Zod validation schemas in frontend/lib/schemas.ts

### API & Auth Infrastructure

- [ ] T012 Implement API client with JWT handling in frontend/lib/api.ts
- [ ] T013 [P] Setup Better Auth client configuration in frontend/lib/auth.ts
- [ ] T014 [P] Create utility functions (cn, formatDate) in frontend/lib/utils.ts
- [ ] T015 [P] Define app constants (routes, API endpoints) in frontend/lib/constants.ts

### Base UI Components

- [ ] T016 [P] Create Button component (primary/secondary/ghost variants) in frontend/components/ui/Button.tsx
- [ ] T017 [P] Create Card component with shadow and hover effects in frontend/components/ui/Card.tsx
- [ ] T018 [P] Create Input component with validation states in frontend/components/ui/Input.tsx
- [ ] T019 [P] Create Skeleton loading component with shimmer in frontend/components/ui/Skeleton.tsx
- [ ] T020 [P] Create Modal component using Radix Dialog in frontend/components/ui/Modal.tsx
- [ ] T021 [P] Create Toast notification component using Radix Toast in frontend/components/ui/Toast.tsx

### Layout Components

- [ ] T022 Create root layout with metadata in frontend/app/layout.tsx
- [ ] T023 [P] Create Footer component with links in frontend/components/layout/Footer.tsx
- [ ] T024 Create Header component shell (auth state added in US3) in frontend/components/layout/Header.tsx

### Context Providers

- [ ] T025 Create ToastProvider context in frontend/components/providers/ToastProvider.tsx
- [ ] T026 [P] Create useToast hook in frontend/hooks/useToast.ts

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 3 - User Authentication Flow (Priority: P1)

**Goal**: Enable visitors to sign up and log in to access their personal task list securely

**Independent Test**: Complete signup → logout → login flow works end-to-end

**Note**: US3 is implemented first because US1 and US2 require authenticated users

### Implementation for User Story 3

- [ ] T027 [US3] Create AuthProvider context with Better Auth in frontend/components/providers/AuthProvider.tsx
- [ ] T028 [US3] Create useAuth hook for auth state in frontend/hooks/useAuth.ts
- [ ] T029 [P] [US3] Create auth layout for login/signup pages in frontend/app/(auth)/layout.tsx
- [ ] T030 [P] [US3] Create LoginForm component with validation in frontend/components/auth/LoginForm.tsx
- [ ] T031 [P] [US3] Create SignupForm component with validation in frontend/components/auth/SignupForm.tsx
- [ ] T032 [US3] Create login page in frontend/app/(auth)/login/page.tsx
- [ ] T033 [P] [US3] Create signup page in frontend/app/(auth)/signup/page.tsx
- [ ] T034 [US3] Create AuthGuard component for protected routes in frontend/components/auth/AuthGuard.tsx
- [ ] T035 [US3] Create dashboard layout with auth protection in frontend/app/(dashboard)/layout.tsx
- [ ] T036 [US3] Update Header with auth state (user menu, login/logout) in frontend/components/layout/Header.tsx
- [ ] T037 [US3] Implement auth API calls (login, signup, logout, getMe) in frontend/lib/api.ts

**Checkpoint**: Users can sign up, log in, log out. Protected routes redirect to login.

---

## Phase 4: User Story 1 - View and Manage Tasks (Priority: P1) 🎯 MVP

**Goal**: Registered users can view all their tasks and toggle completion/delete

**Independent Test**: Log in → see task list → toggle task → delete task

### Implementation for User Story 1

- [ ] T038 [US1] Create useTasks hook with optimistic updates in frontend/hooks/useTasks.ts
- [ ] T039 [P] [US1] Create TaskCard component with checkbox and delete in frontend/components/tasks/TaskCard.tsx
- [ ] T040 [US1] Create TaskList component with loading/empty states in frontend/components/tasks/TaskList.tsx
- [ ] T041 [US1] Create tasks dashboard page in frontend/app/(dashboard)/tasks/page.tsx
- [ ] T042 [US1] Implement task API calls (getTasks, toggleTask, deleteTask) in frontend/lib/api.ts
- [ ] T043 [US1] Add completion animation (golden tick) to TaskCard in frontend/components/tasks/TaskCard.tsx
- [ ] T044 [US1] Add delete confirmation modal integration in frontend/components/tasks/TaskCard.tsx
- [ ] T045 [US1] Add empty state with CTA for zero tasks in frontend/components/tasks/TaskList.tsx

**Checkpoint**: MVP complete - Users can view tasks, mark complete, delete tasks

---

## Phase 5: User Story 2 - Create and Edit Tasks (Priority: P1)

**Goal**: Users can create new tasks and edit existing ones via modal forms

**Independent Test**: Create new task → see it appear → edit task → see changes

### Implementation for User Story 2

- [ ] T046 [US2] Create TaskForm component with validation in frontend/components/tasks/TaskForm.tsx
- [ ] T047 [US2] Create TaskFormModal (create mode) in frontend/components/tasks/TaskFormModal.tsx
- [ ] T048 [US2] Add edit mode to TaskFormModal in frontend/components/tasks/TaskFormModal.tsx
- [ ] T049 [US2] Implement createTask API call in frontend/lib/api.ts
- [ ] T050 [US2] Implement updateTask API call in frontend/lib/api.ts
- [ ] T051 [US2] Add "Add Task" button to tasks page in frontend/app/(dashboard)/tasks/page.tsx
- [ ] T052 [US2] Add edit trigger to TaskCard in frontend/components/tasks/TaskCard.tsx
- [ ] T053 [US2] Add optimistic create/update to useTasks hook in frontend/hooks/useTasks.ts
- [ ] T054 [US2] Add success/error toast notifications for CRUD operations in frontend/components/tasks/TaskFormModal.tsx

**Checkpoint**: Full CRUD - Users can create, read, update, delete tasks

---

## Phase 6: User Story 4 - Landing Page Experience (Priority: P2)

**Goal**: Visitors see compelling value proposition and can navigate to signup

**Independent Test**: Visit landing page → see hero/features → click CTA → arrive at signup

### Implementation for User Story 4

- [ ] T055 [P] [US4] Create Hero component with headline and CTA in frontend/components/landing/Hero.tsx
- [ ] T056 [P] [US4] Create Features component with benefit highlights in frontend/components/landing/Features.tsx
- [ ] T057 [P] [US4] Create CTA component with signup button in frontend/components/landing/CTA.tsx
- [ ] T058 [US4] Create landing page composing Hero, Features, CTA in frontend/app/page.tsx
- [ ] T059 [US4] Add SEO metadata to landing page in frontend/app/page.tsx
- [ ] T060 [US4] Update Header for unauthenticated state (show login/signup) in frontend/components/layout/Header.tsx

**Checkpoint**: Landing page complete with clear value prop and conversion path

---

## Phase 7: User Story 5 - Filter and Organize Tasks (Priority: P2)

**Goal**: Users can filter tasks by status and see real-time counters

**Independent Test**: Apply filter → list updates → counters reflect current state

### Implementation for User Story 5

- [ ] T061 [US5] Create TaskFilters component (all/pending/completed) in frontend/components/tasks/TaskFilters.tsx
- [ ] T062 [US5] Create TaskCounters component (pending/completed counts) in frontend/components/tasks/TaskCounters.tsx
- [ ] T063 [US5] Add filter state to useTasks hook in frontend/hooks/useTasks.ts
- [ ] T064 [US5] Integrate TaskFilters into tasks page in frontend/app/(dashboard)/tasks/page.tsx
- [ ] T065 [US5] Integrate TaskCounters into tasks page in frontend/app/(dashboard)/tasks/page.tsx
- [ ] T066 [US5] Add filter persistence (URL params or local state) in frontend/hooks/useTasks.ts

**Checkpoint**: Filtering works - users can focus on pending or completed tasks

---

## Phase 8: User Story 6 - Responsive Multi-Device Experience (Priority: P2)

**Goal**: Application works seamlessly on mobile, tablet, and desktop

**Independent Test**: Test all pages at 320px, 768px, 1024px+ viewports

### Implementation for User Story 6

- [ ] T067 [US6] Create MobileNav component (hamburger menu) in frontend/components/layout/MobileNav.tsx
- [ ] T068 [US6] Add responsive breakpoints to Header in frontend/components/layout/Header.tsx
- [ ] T069 [US6] Add responsive styles to TaskCard (touch targets) in frontend/components/tasks/TaskCard.tsx
- [ ] T070 [US6] Add responsive styles to TaskForm (full-screen on mobile) in frontend/components/tasks/TaskForm.tsx
- [ ] T071 [US6] Add responsive styles to Modal (full-screen on mobile) in frontend/components/ui/Modal.tsx
- [ ] T072 [US6] Add responsive layout to tasks page in frontend/app/(dashboard)/tasks/page.tsx
- [ ] T073 [US6] Add responsive layout to landing page in frontend/app/page.tsx
- [ ] T074 [US6] Test and fix touch target sizes (min 44x44px) across all interactive elements

**Checkpoint**: App fully functional on all device sizes

---

## Phase 9: User Story 7 - Error Handling and Recovery (Priority: P3)

**Goal**: Users see helpful error messages and can recover from errors

**Independent Test**: Trigger 404 → see error page → navigate home

### Implementation for User Story 7

- [ ] T075 [P] [US7] Create 404 not-found page in frontend/app/not-found.tsx
- [ ] T076 [P] [US7] Create global error boundary in frontend/app/error.tsx
- [ ] T077 [US7] Add error state UI to TaskList in frontend/components/tasks/TaskList.tsx
- [ ] T078 [US7] Add retry functionality to failed operations in frontend/hooks/useTasks.ts
- [ ] T079 [US7] Add network error handling to API client in frontend/lib/api.ts
- [ ] T080 [US7] Add session expiry handling (redirect to login) in frontend/lib/api.ts

**Checkpoint**: Error states handled gracefully with recovery options

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

### Accessibility

- [ ] T081 [P] Add skip-to-main-content link in frontend/app/layout.tsx
- [ ] T082 [P] Audit and fix ARIA labels across all components
- [ ] T083 [P] Add focus trap to Modal component in frontend/components/ui/Modal.tsx
- [ ] T084 Verify keyboard navigation order across all pages

### Performance

- [ ] T085 [P] Add loading.tsx for route transitions in frontend/app/(dashboard)/loading.tsx
- [ ] T086 [P] Optimize images with next/image in landing page components
- [ ] T087 Add prefers-reduced-motion support to animations in frontend/tailwind.config.ts

### Final Polish

- [ ] T088 [P] Add favicon and app icons in frontend/app/favicon.ico
- [ ] T089 Final visual QA pass on golden theme consistency
- [ ] T090 Run Lighthouse accessibility audit and fix issues
- [ ] T091 Validate against quickstart.md test scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ──────────────────────────────────────────────►
        │
        ▼
Phase 2 (Foundational) ───────────────────────────────────────►
        │
        ▼ [GATE: Foundation complete]
        │
        ├──► Phase 3 (US3: Auth) ─────────────────────────────►
        │           │
        │           ▼ [Auth ready]
        │           │
        │           ├──► Phase 4 (US1: View Tasks) ──► MVP! ──►
        │           │           │
        │           │           ▼
        │           │           │
        │           ├──► Phase 5 (US2: Create/Edit) ──────────►
        │           │
        │           ├──► Phase 6 (US4: Landing) ──────────────►
        │           │
        │           ├──► Phase 7 (US5: Filters) ─────────────►
        │           │
        │           ├──► Phase 8 (US6: Responsive) ───────────►
        │           │
        │           └──► Phase 9 (US7: Errors) ───────────────►
        │
        └──────────────────────────────────────────────────────►
                                    │
                                    ▼
                        Phase 10 (Polish) ────────────────────►
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US3 (Auth) | Phase 2 | None (must be first) |
| US1 (View Tasks) | US3 | US4, US6, US7 |
| US2 (Create/Edit) | US1 | US4, US5, US6, US7 |
| US4 (Landing) | Phase 2 | US1, US2, US5, US6, US7 |
| US5 (Filters) | US1 | US4, US6, US7 |
| US6 (Responsive) | Phase 2 | US1, US2, US4, US5, US7 |
| US7 (Errors) | Phase 2 | US1, US2, US4, US5, US6 |

### Parallel Opportunities by Phase

**Phase 2 (Foundational)** - 11 parallel tasks:
- T016, T017, T018, T019, T020, T021 (UI components)
- T013, T014, T015 (lib utilities)
- T011, T023, T026 (schemas, footer, hook)

**Phase 3 (US3)** - 3 parallel tasks:
- T029, T030, T031, T033 (auth pages/forms)

**Phase 4 (US1)** - 1 parallel task:
- T039 (TaskCard parallel with hook)

**Phase 6 (US4)** - 3 parallel tasks:
- T055, T056, T057 (landing components)

**Phase 9 (US7)** - 2 parallel tasks:
- T075, T076 (error pages)

---

## Parallel Execution Examples

### Example 1: Foundational UI Components
```bash
# Launch all base UI components in parallel:
T016: "Create Button component in frontend/components/ui/Button.tsx"
T017: "Create Card component in frontend/components/ui/Card.tsx"
T018: "Create Input component in frontend/components/ui/Input.tsx"
T019: "Create Skeleton component in frontend/components/ui/Skeleton.tsx"
T020: "Create Modal component in frontend/components/ui/Modal.tsx"
T021: "Create Toast component in frontend/components/ui/Toast.tsx"
```

### Example 2: Landing Page Components
```bash
# Launch all landing components in parallel:
T055: "Create Hero component in frontend/components/landing/Hero.tsx"
T056: "Create Features component in frontend/components/landing/Features.tsx"
T057: "Create CTA component in frontend/components/landing/CTA.tsx"
```

### Example 3: Auth Forms
```bash
# Launch auth forms in parallel:
T030: "Create LoginForm component in frontend/components/auth/LoginForm.tsx"
T031: "Create SignupForm component in frontend/components/auth/SignupForm.tsx"
```

---

## Implementation Strategy

### MVP First (US3 + US1 Only)

1. Complete Phase 1: Setup (~9 tasks)
2. Complete Phase 2: Foundational (~17 tasks)
3. Complete Phase 3: US3 Auth (~11 tasks)
4. Complete Phase 4: US1 View Tasks (~8 tasks)
5. **STOP and VALIDATE**: Users can log in and view/manage tasks
6. Deploy MVP for feedback

**MVP Task Count**: 45 tasks

### Full Feature Set

1. MVP (above)
2. Add Phase 5: US2 Create/Edit (~9 tasks) → Full CRUD
3. Add Phase 6: US4 Landing (~6 tasks) → Marketing ready
4. Add Phase 7: US5 Filters (~6 tasks) → Power users
5. Add Phase 8: US6 Responsive (~8 tasks) → Mobile ready
6. Add Phase 9: US7 Errors (~6 tasks) → Production quality
7. Complete Phase 10: Polish (~11 tasks) → Ship ready

**Total Task Count**: 91 tasks

---

## Task Summary

| Phase | User Story | Task Count | Parallel Tasks |
|-------|------------|------------|----------------|
| 1 | Setup | 9 | 4 |
| 2 | Foundational | 17 | 11 |
| 3 | US3 (Auth) | 11 | 4 |
| 4 | US1 (View Tasks) | 8 | 1 |
| 5 | US2 (Create/Edit) | 9 | 0 |
| 6 | US4 (Landing) | 6 | 3 |
| 7 | US5 (Filters) | 6 | 0 |
| 8 | US6 (Responsive) | 8 | 0 |
| 9 | US7 (Errors) | 6 | 2 |
| 10 | Polish | 11 | 5 |
| **Total** | | **91** | **30** |

---

## Notes

- [P] tasks = different files, no dependencies within same phase
- [US#] label maps task to specific user story for traceability
- US3 (Auth) implemented before US1/US2 because tasks require authentication
- Each user story checkpoint = deployable increment
- Commit after each task or logical group
- Golden theme classes defined in T008 (tailwind.config.ts)
