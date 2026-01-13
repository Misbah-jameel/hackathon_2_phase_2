# Research: Frontend Todo Application

**Feature**: 002-frontend-todo-app
**Date**: 2026-01-06
**Purpose**: Resolve technical unknowns and establish best practices before implementation

## Research Topics

### 1. Better Auth + Next.js Integration

**Question**: How to integrate Better Auth with Next.js App Router for JWT-based authentication?

**Decision**: Use Better Auth client SDK with custom JWT handling

**Rationale**:
- Better Auth provides built-in Next.js adapter
- JWT tokens stored in httpOnly cookies for security
- Session management handled automatically
- Supports Server Components via `auth()` helper

**Alternatives Considered**:
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Better Auth SDK | Native integration, secure defaults | Learning curve | ✅ Selected |
| NextAuth.js | Mature, well-documented | Different auth paradigm | Rejected |
| Manual JWT | Full control | Security risks, more code | Rejected |

**Implementation Pattern**:
```typescript
// lib/auth.ts
import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Middleware for protected routes
export { auth } from 'better-auth/next';
```

---

### 2. Optimistic UI Updates Pattern

**Question**: How to implement optimistic updates with proper error rollback?

**Decision**: Custom hook pattern with local state + API sync

**Rationale**:
- Provides immediate feedback (perceived <100ms response)
- Graceful rollback on API failure
- No external library dependency
- Works well with React 18 concurrent features

**Alternatives Considered**:
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Custom hook | Simple, no deps | Manual implementation | ✅ Selected |
| TanStack Query | Powerful caching | Overkill for simple CRUD | Rejected |
| SWR | Lightweight | Less optimistic control | Rejected |
| Zustand | Global state | Unnecessary complexity | Rejected |

**Implementation Pattern**:
```typescript
// hooks/useTasks.ts
function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);

  const toggleTask = async (id: string) => {
    // 1. Optimistic update
    setOptimisticTasks(prev =>
      prev.map(t => t.id === id ? {...t, completed: !t.completed} : t)
    );

    try {
      // 2. API call
      await api.toggleTask(id);
      // 3. Sync real state
      setTasks(optimisticTasks);
    } catch (error) {
      // 4. Rollback on failure
      setOptimisticTasks(tasks);
      toast.error('Failed to update task');
    }
  };

  return { tasks: optimisticTasks, toggleTask };
}
```

---

### 3. Animation Library Selection

**Question**: CSS-only animations vs JavaScript animation library?

**Decision**: CSS animations with Tailwind + Framer Motion for complex sequences

**Rationale**:
- CSS handles 90% of animations (hover, transitions)
- Framer Motion for modal enter/exit, list reordering
- Better performance than JS-only solutions
- Respects `prefers-reduced-motion`

**Alternatives Considered**:
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| CSS + Framer Motion | Best of both | Two solutions | ✅ Selected |
| CSS only | Simplest, performant | Limited sequences | Partial |
| GSAP | Powerful | Large bundle, overkill | Rejected |
| React Spring | Physics-based | Complex API | Rejected |

**Animation Inventory**:
| Animation | Technique | Duration |
|-----------|-----------|----------|
| Button hover glow | CSS `box-shadow` transition | 200ms |
| Card hover lift | CSS `transform` + `shadow` | 200ms |
| Task completion | Framer Motion + CSS | 300ms |
| Modal enter/exit | Framer Motion | 200ms |
| Shimmer loading | CSS `@keyframes` | 2000ms |
| Toast slide | CSS `transform` | 300ms |

---

### 4. Form Validation Approach

**Question**: How to handle form validation for signup/login/task forms?

**Decision**: React Hook Form + Zod schemas

**Rationale**:
- Type-safe validation with Zod
- Minimal re-renders with React Hook Form
- Shared schemas between client and API types
- Built-in accessibility support

**Alternatives Considered**:
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| React Hook Form + Zod | Type-safe, performant | Two libraries | ✅ Selected |
| Formik + Yup | Mature | More re-renders | Rejected |
| Native HTML5 | Zero deps | Limited validation | Rejected |
| Custom hooks | Full control | Reinventing wheel | Rejected |

**Schema Example**:
```typescript
// lib/schemas.ts
import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'Title required').max(200, 'Title too long'),
  description: z.string().max(1000).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password too short'),
});
```

---

### 5. Responsive Design Breakpoints

**Question**: What breakpoints to use for responsive design?

**Decision**: Tailwind defaults with mobile-first approach

**Rationale**:
- Tailwind breakpoints are industry standard
- Mobile-first aligns with spec requirement (320px min)
- Consistent with design system patterns

**Breakpoints**:
| Name | Min Width | Target Devices |
|------|-----------|----------------|
| Default | 0px | Mobile phones |
| `sm` | 640px | Large phones, small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops, small desktops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

**Layout Adaptations**:
| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Header | Hamburger menu | Full nav | Full nav + user |
| Task list | Single column | Single column | Single column |
| Task card | Full width | Full width | Full width |
| Modal | Full screen | Centered 80% | Centered 500px |
| Footer | Stacked | Inline | Inline |

---

### 6. Accessibility Implementation

**Question**: How to ensure WCAG AA compliance?

**Decision**: Built-in patterns + eslint-plugin-jsx-a11y + manual testing

**Rationale**:
- Semantic HTML first
- ARIA only when semantic HTML insufficient
- Automated linting catches common issues
- Manual keyboard + screen reader testing

**Checklist**:
- [x] All interactive elements keyboard accessible
- [x] Focus visible on all focusable elements
- [x] Color contrast 4.5:1 minimum
- [x] Form labels properly associated
- [x] Error messages announced to screen readers
- [x] Skip link for main content
- [x] Reduced motion support

**Key Patterns**:
```tsx
// Modal accessibility
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Create Task</h2>
  {/* Focus trap inside modal */}
</div>

// Toast accessibility
<div role="alert" aria-live="polite">
  Task created successfully
</div>

// Task checkbox
<input
  type="checkbox"
  id={`task-${id}`}
  aria-label={`Mark "${title}" as ${completed ? 'incomplete' : 'complete'}`}
/>
```

---

## Dependency Summary

| Package | Version | Purpose |
|---------|---------|---------|
| next | ^14.0.0 | Framework |
| react | ^18.2.0 | UI library |
| typescript | ^5.3.0 | Type safety |
| tailwindcss | ^3.4.0 | Styling |
| better-auth | latest | Authentication |
| framer-motion | ^11.0.0 | Animations |
| react-hook-form | ^7.49.0 | Form handling |
| zod | ^3.22.0 | Validation |
| @radix-ui/react-dialog | latest | Accessible modal |
| @radix-ui/react-toast | latest | Accessible toasts |

## Research Complete

All technical unknowns resolved. Ready for Phase 1: Data Model & Contracts.
