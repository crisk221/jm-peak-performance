# JM Peak Performance

A full-stack Next.js 14 + tRPC monorepo built with pnpm workspaces.

## Project Structure

```
├── apps/
│   └── web/                    # Next.js 14 app with App Router
├── packages/
│   ├── config/                 # Shared ESLint, Prettier, Tailwind configs
│   ├── types/                  # Shared TypeScript types
│   ├── db/                     # Database layer (Prisma to be added)
│   └── api/                    # tRPC API layer (to be added)
├── .github/
│   └── copilot-instructions.md
├── .editorconfig
├── .gitignore
├── .nvmrc                      # Node 20 LTS
├── package.json                # Root workspace configuration
├── pnpm-workspace.yaml         # pnpm workspace definition
└── tsconfig.base.json          # Base TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 20+ (use `.nvmrc` for exact version)
- pnpm 9+

### Installation

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your actual values if needed
   ```

3. Start the PostgreSQL database:

   ```bash
   pnpm db:up
   ```

4. Check database connection:

   ```bash
   pnpm db:check
   ```

5. Start the development server:

   ```bash
   pnpm dev
   ```

   This will start the Next.js app at `http://localhost:3000`

### Available Scripts

- `pnpm dev` - Start development server for the web app
- `pnpm build` - Build all packages and the web app
- `pnpm start` - Start the production web app
- `pnpm lint` - Run ESLint across all packages
- `pnpm lint:fix` - Fix ESLint issues across all packages
- `pnpm format` - Format code with Prettier across all packages
- `pnpm type-check` - Run TypeScript type checking across all packages
- `pnpm clean` - Clean build outputs across all packages
- `pnpm test` - Run tests across all packages

#### Database Scripts

- `pnpm db:up` - Start PostgreSQL database with Docker
- `pnpm db:down` - Stop PostgreSQL database and remove volumes
- `pnpm db:logs` - View PostgreSQL database logs
- `pnpm db:check` - Check database connection status

## Workspace Packages

### @jmpp/web

Next.js 14 application with:

- App Router
- TypeScript
- Tailwind CSS
- ESLint + Prettier

### @jmpp/config

Shared configuration package providing:

- ESLint configuration extending Next.js rules
- Prettier configuration with Tailwind plugin
- Tailwind CSS base configuration
- TypeScript configuration

### @jmpp/types

Shared TypeScript type definitions for the entire monorepo.

### @jmpp/db

Database layer package (Prisma will be added later).

### @jmpp/api

API layer package (tRPC will be added later).

## Path Aliases

The following path aliases are configured:

- `@jmpp/config` → `./packages/config/src`
- `@jmpp/types` → `./packages/types/src`
- `@jmpp/db` → `./packages/db/src`
- `@jmpp/api` → `./packages/api/src`

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier
- **Database**: PostgreSQL 16 (Docker)
- **ORM**: Prisma (to be added)
- **API**: tRPC (to be added)

## Infrastructure

### PostgreSQL Database

The project uses PostgreSQL 16 running in Docker for development:

- **Host**: localhost:5432
- **Database**: jmpp
- **User**: jmpp
- **Password**: jmpp (development only)

### Docker Services

- **PostgreSQL 16**: Persistent data with named volume `jmpp_postgres_data`
- **Health checks**: Automatic connection validation
- **Development ready**: Configured for local development

## Development Guidelines

1. Use the configured ESLint and Prettier settings
2. Follow the monorepo structure and package boundaries
3. Use workspace references for internal packages
4. Maintain type safety across all packages
5. Use the configured path aliases for imports

## Next Steps

1. Add Prisma for database management
2. Implement tRPC for type-safe API calls
3. Add authentication system
4. Implement business logic
