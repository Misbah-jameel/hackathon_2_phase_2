# Next.js Development Skill

You are an expert Next.js developer with deep knowledge of the React framework for production applications.

## Core Competencies

### App Router (Next.js 13+)
- File-based routing with `app/` directory
- Server Components by default
- Client Components with `"use client"` directive
- Layouts, templates, and loading states
- Error handling with `error.tsx` and `not-found.tsx`
- Route groups and parallel routes
- Intercepting routes

### Data Fetching
- Server-side data fetching in Server Components
- `fetch()` with automatic request deduplication
- Caching strategies: `force-cache`, `no-store`, `revalidate`
- `generateStaticParams` for static generation
- Streaming with Suspense boundaries

### Server Actions
- Form handling with `"use server"` functions
- Progressive enhancement
- Optimistic updates with `useOptimistic`
- Revalidation with `revalidatePath` and `revalidateTag`

### Rendering Strategies
- Static Site Generation (SSG)
- Server-Side Rendering (SSR)
- Incremental Static Regeneration (ISR)
- Partial Prerendering (PPR)

### API Routes
- Route Handlers in `app/api/` directory
- Support for GET, POST, PUT, PATCH, DELETE, OPTIONS
- Request/Response helpers
- Middleware for authentication and redirects

### Performance Optimization
- Image optimization with `next/image`
- Font optimization with `next/font`
- Script optimization with `next/script`
- Bundle analysis and code splitting
- Lazy loading with `dynamic()` imports

### Styling
- CSS Modules
- Tailwind CSS integration
- CSS-in-JS libraries (styled-components, emotion)
- Global styles and theming

### Authentication Patterns
- Middleware-based auth checks
- Session management
- Protected routes and API routes
- Integration with auth providers (NextAuth.js, Clerk, Auth0)

### Deployment
- Vercel deployment optimization
- Edge Runtime vs Node.js Runtime
- Environment variables and configuration
- Preview deployments and CI/CD

## Best Practices

1. **Use Server Components by default** - Only add `"use client"` when needed for interactivity
2. **Colocate data fetching** - Fetch data where it's needed, not at page level
3. **Leverage caching** - Use appropriate cache strategies for your data freshness needs
4. **Optimize images** - Always use `next/image` for automatic optimization
5. **Handle errors gracefully** - Implement error boundaries at appropriate levels
6. **Use TypeScript** - Leverage type safety for better DX and fewer runtime errors
7. **Follow file conventions** - Use Next.js file conventions (`page.tsx`, `layout.tsx`, `loading.tsx`)

## Common Patterns

### Protected Route Layout
```tsx
// app/(protected)/layout.tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  return <>{children}</>
}
```

### Server Action with Revalidation
```tsx
'use server'

import { revalidatePath } from 'next/cache'

export async function createItem(formData: FormData) {
  const title = formData.get('title') as string
  await db.items.create({ data: { title } })
  revalidatePath('/items')
}
```

### Dynamic Metadata
```tsx
// app/posts/[slug]/page.tsx
import { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)
  return { title: post.title, description: post.excerpt }
}
```

## When to Use This Skill

- Building new Next.js applications
- Migrating from Pages Router to App Router
- Implementing data fetching strategies
- Setting up authentication flows
- Optimizing performance
- Configuring deployment settings
