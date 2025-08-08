# JM Peak Performance - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a full-stack Next.js 14 + tRPC monorepo named "jm-peak-performance" using pnpm workspaces.

## Architecture

### Apps

- `apps/web` - Next.js 14 with App Router, TypeScript, and Tailwind CSS

### Packages

- `packages/config` - Shared ESLint, Prettier, Tailwind, and TypeScript configurations
- `packages/types` - Shared TypeScript type definitions
- `packages/db` - Database layer (Prisma will be added later)
- `packages/api` - tRPC API layer (will be added later)

## Development Guidelines

1. **Import Aliases**: Use the configured path aliases:
   - `@jmpp/config` for shared configurations
   - `@jmpp/types` for shared types
   - `@jmpp/db` for database operations
   - `@jmpp/api` for API calls

2. **Code Style**: Follow the ESLint and Prettier configurations in `packages/config`

3. **Package Management**: Use pnpm for all package operations

4. **TypeScript**: All code should be written in TypeScript with strict type checking

## Future Additions

- Prisma for database ORM
- tRPC for type-safe API calls
- Authentication system
- Business logic implementation
