# @jmpp/api

The tRPC API layer for JM Peak Performance - provides type-safe API endpoints with end-to-end type safety.

## Features

- **Type-safe API calls** with tRPC
- **Authentication** using Auth.js with JWT strategy
- **Database integration** with Prisma
- **Input validation** using Zod schemas from `@jmpp/types`
- **Automatic serialization** with superjson

## Architecture

```
src/
├── context.ts       # tRPC context with Prisma client and session
├── auth.ts          # Auth.js configuration
├── trpc.ts          # tRPC initialization and procedures
├── index.ts         # Main router export
└── routers/         # API route handlers
    ├── health.ts    # Health check endpoints
    ├── user.ts      # User management
    ├── client.ts    # Client management
    └── recipe.ts    # Recipe management
```

## Available Routers

### Health Router (`health`)

- `check()` - Basic health check
- `database()` - Database connectivity check

### User Router (`user`)

- `me()` - Get current user profile
- `stats()` - Get user statistics (clients, recipes, meal plans)

### Client Router (`client`)

- `list()` - Get all clients for current coach
- `getById(id)` - Get specific client
- `create(data)` - Create new client
- `update(id, data)` - Update existing client
- `delete(id)` - Delete client

### Recipe Router (`recipe`)

- `list(options)` - Get recipes with pagination and search
- `getById(id)` - Get specific recipe with ingredients/utensils/tags
- `create(data)` - Create new recipe
- `update(id, data)` - Update existing recipe
- `delete(id)` - Delete recipe

## Usage

### Server-side (Next.js API routes)

```typescript
import { appRouter, type AppRouter } from "@jmpp/api";
import { createTRPCContext } from "@jmpp/api/context";

// In your API route handler
const ctx = await createTRPCContext({ req, res });
const caller = appRouter.createCaller(ctx);

// Call procedures
const user = await caller.user.me();
const clients = await caller.client.list();
```

### Client-side (React/Next.js)

```typescript
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@jmpp/api';

const trpc = createTRPCReact<AppRouter>();

// In your component
function Dashboard() {
  const { data: user } = trpc.user.me.useQuery();
  const { data: stats } = trpc.user.stats.useQuery();

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>Clients: {stats?.totalClients}</p>
    </div>
  );
}
```

## Authentication

All protected procedures require authentication via Auth.js session. The session must include:

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
  };
}
```

## Error Handling

tRPC procedures throw `TRPCError` with appropriate error codes:

- `UNAUTHORIZED` - Missing or invalid session
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Invalid input
- `INTERNAL_SERVER_ERROR` - Server errors

## Development

The API package is part of the pnpm workspace and depends on:

- `@jmpp/types` - Shared Zod schemas
- `@jmpp/db` - Prisma database client
- `@trpc/server` - tRPC server
- `@auth/core` - Auth.js core
- `superjson` - Serialization
