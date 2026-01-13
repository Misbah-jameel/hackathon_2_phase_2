# Quickstart: Frontend Todo Application

**Feature**: 002-frontend-todo-app
**Date**: 2026-01-06
**Purpose**: Get developers up and running quickly

## Prerequisites

- Node.js 20+ installed
- npm or pnpm package manager
- Backend API running (see backend setup)
- Git for version control

## Quick Setup

```bash
# 1. Clone and navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Configure environment
# Edit .env.local with your values:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_APP_URL=http://localhost:3000

# 5. Start development server
npm run dev

# 6. Open browser
# http://localhost:3000
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | - | Backend API base URL |
| `NEXT_PUBLIC_APP_URL` | Yes | - | Frontend app URL |
| `BETTER_AUTH_SECRET` | Yes | - | Auth session secret |

**.env.local example**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
```

## Project Structure Overview

```
frontend/
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Public auth pages (login, signup)
│   ├── (dashboard)/    # Protected pages (tasks)
│   └── page.tsx        # Landing page
├── components/         # React components
│   ├── ui/            # Base UI (Button, Card, etc.)
│   ├── tasks/         # Task-specific components
│   ├── auth/          # Auth forms
│   └── layout/        # Header, Footer
├── lib/               # Utilities and API client
├── hooks/             # Custom React hooks
└── types/             # TypeScript definitions
```

## Key Commands

```bash
# Development
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation

# Testing
npm run test         # Run unit tests
npm run test:watch   # Watch mode
npm run test:e2e     # Playwright E2E tests

# Code Quality
npm run format       # Prettier formatting
npm run lint:fix     # Auto-fix lint issues
```

## Development Workflow

### 1. Creating a New Component

```bash
# Create component file
touch components/ui/NewComponent.tsx
```

```tsx
// components/ui/NewComponent.tsx
'use client'; // Add if component needs interactivity

interface NewComponentProps {
  title: string;
  onClick?: () => void;
}

export function NewComponent({ title, onClick }: NewComponentProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-card p-4"
      onClick={onClick}
    >
      {title}
    </div>
  );
}
```

### 2. Adding a New Page

```bash
# Create page directory and file
mkdir -p app/(dashboard)/new-page
touch app/(dashboard)/new-page/page.tsx
```

```tsx
// app/(dashboard)/new-page/page.tsx
export default function NewPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">New Page</h1>
    </div>
  );
}
```

### 3. Using the API Client

```tsx
// In a client component
'use client';

import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import type { Task } from '@/types';

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      const result = await api.getTasks();
      if (result.data) {
        setTasks(result.data);
      }
      setLoading(false);
    }
    fetchTasks();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
}
```

## Design System Quick Reference

### Colors (Tailwind Classes)

```
Primary Golden:    bg-golden, text-golden, border-golden
Golden Hover:      hover:bg-golden-light
Text Primary:      text-gray-primary (#1F2937)
Text Secondary:    text-gray-secondary (#6B7280)
Borders:           border-gray-border (#E5E7EB)
Success:           text-green-500, bg-green-500
Error:             text-red-500, bg-red-500
```

### Common Component Classes

```tsx
// Primary Button
<button className="bg-golden hover:bg-golden-light text-gray-primary font-semibold px-6 py-3 rounded-lg shadow-card hover:shadow-golden-glow transition-all duration-200">
  Click Me
</button>

// Secondary Button
<button className="bg-white border-2 border-golden text-golden hover:bg-golden hover:text-white px-6 py-3 rounded-lg transition-all duration-200">
  Secondary
</button>

// Card
<div className="bg-white rounded-xl shadow-card hover:shadow-card-hover p-4 transition-all duration-200">
  Content
</div>

// Input
<input className="w-full px-4 py-3 border border-gray-border rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent outline-none transition-all" />
```

### Responsive Breakpoints

```tsx
// Mobile first approach
<div className="
  w-full           // Mobile: full width
  md:w-1/2         // Tablet: half width
  lg:w-1/3         // Desktop: third width
">
```

## Troubleshooting

### Common Issues

**1. API Connection Failed**
```
Error: Unable to connect to server
```
- Verify backend is running on NEXT_PUBLIC_API_URL
- Check CORS settings in backend
- Ensure no firewall blocking

**2. Authentication Issues**
```
Error: Please log in to continue
```
- Check BETTER_AUTH_SECRET is set
- Clear cookies and try again
- Verify token is being sent in requests

**3. Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**4. Type Errors**
```bash
# Regenerate types
npm run type-check
```

## Next Steps

1. Read [spec.md](./spec.md) for full feature requirements
2. Review [data-model.md](./data-model.md) for entity details
3. Check [contracts/](./contracts/) for API interface
4. Run `/sp.tasks` to generate implementation tasks

## Support

- Feature spec: `specs/002-frontend-todo-app/spec.md`
- Plan document: `specs/002-frontend-todo-app/plan.md`
- Constitution: `.specify/memory/constitution.md`
