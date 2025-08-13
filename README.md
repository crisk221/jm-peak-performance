# JM Peak Performance

A comprehensive meal planning and nutrition coaching platform built for fitness professionals. This system enables coaches to manage clients, create recipes, and generate optimized meal plans with PDF export capabilities.

## 🎯 Frozen Scope Overview

This application implements a complete nutrition coaching workflow:

### Core Features (Implemented)
- **Client Management**: Full CRUD operations for managing coaching clients with nutrition targets
- **Recipe Management**: Create, edit, and manage recipes with macro calculations and PDF export
- **Meal Plan Generator**: AI-powered meal plan optimization using greedy algorithms to meet client targets
- **PDF Export System**: Server-side PDF generation for both recipes and multi-day meal plans
- **Authentication**: Secure credential-based authentication with session management

### Known Limitations
- **No Client Portal**: Clients cannot log in to view their own meal plans (coach-only system)
- **Greedy Algorithm**: Meal plan optimization uses a simple greedy approach, not advanced ML
- **Basic Recipe Database**: Limited ingredient database, no external nutrition API integration
- **No Mobile App**: Web-only interface optimized for desktop use

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20.0.0 or higher
- **pnpm** 9.0.0 or higher  
- **Docker** for PostgreSQL database
- **Git** for version control

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd jm-peak-performance
   pnpm install
   ```

2. **Set up the database**
   ```bash
   # Start PostgreSQL in Docker
   pnpm db:up
   
   # Run database migrations
   pnpm db:migrate
   
   # Seed with sample data
   pnpm db:seed
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Use seeded coach account: `coach@example.com` / `password123`

## 📜 Available Scripts

### Development
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server

### Database
- `pnpm db:up` - Start PostgreSQL container
- `pnpm db:down` - Stop and remove database
- `pnpm db:migrate` - Run Prisma migrations
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:generate` - Generate Prisma client

### Testing
- `pnpm test` - Run unit tests with Vitest
- `pnpm test:e2e` - Run end-to-end tests with Playwright

### Code Quality
- `pnpm lint` - Run ESLint across all packages
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **React Hook Form** - Form management
- **TanStack Query** - Server state management

### Backend
- **tRPC** - End-to-end type-safe APIs
- **Prisma** - Database ORM and migrations
- **PostgreSQL** - Primary database
- **Zod** - Runtime type validation
- **Auth.js** - Authentication framework

### PDF Generation
- **Playwright** - Headless browser for PDF rendering
- **Server-only routes** - PDF generation isolated from client bundle

### Testing
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **@testing-library** - Testing utilities

## 🏛️ Architecture

### Workspace Structure
```
jm-peak-performance/
├── apps/
│   └── web/                 # Next.js application
├── packages/
│   ├── api/                 # tRPC routers and business logic
│   ├── db/                  # Prisma schema and migrations  
│   ├── types/               # Shared TypeScript types
│   └── config/              # Shared configuration
├── tests/
│   ├── unit/                # Vitest unit tests
│   └── e2e/                 # Playwright e2e tests
└── scripts/                 # Development utilities
```

### API Organization
- **Routers**: Located in `packages/api/src/routers/`
  - `client.ts` - Client management operations
  - `recipe.ts` - Recipe CRUD and search
  - `mealPlan.ts` - Meal plan generation and optimization
  - `health.ts` - System health checks
  - `user.ts` - Authentication and user management

### PDF Generation Architecture
- **Server-only routes**: PDF generation happens in Next.js API routes
- **Dynamic imports**: Playwright is dynamically imported to avoid client bundling
- **Separate export**: PDF services exported via `@jmpp/api/pdf` module
- **Route handlers**: Located at `/api/exports/{resource}/{id}/route.ts`

## 🌍 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | `postgresql://jmpp:jmpp@localhost:5432/jmpp` |
| `NEXTAUTH_SECRET` | Auth.js secret key | ✅ | - |
| `NEXTAUTH_URL` | Application base URL | ✅ | `http://localhost:3000` |
| `AUTH_EMAIL_SERVER_HOST` | SMTP server (future use) | ✅ | `smtp.example.com` |
| `AUTH_EMAIL_SERVER_PORT` | SMTP port | ✅ | `587` |
| `AUTH_EMAIL_SERVER_USER` | SMTP username | ✅ | - |
| `AUTH_EMAIL_SERVER_PASS` | SMTP password | ✅ | - |
| `NODE_ENV` | Environment mode | ✅ | `development` |

### Minimum Requirements
- Database connection (`DATABASE_URL`)
- Authentication secret (`NEXTAUTH_SECRET`) 
- Application URL (`NEXTAUTH_URL`)
- Email server configuration (for future features)

## 🧪 Testing Strategy

### Unit Tests
- **Macro calculations**: Test nutrition computation utilities
- **Optimization algorithm**: Verify meal plan optimization logic
- **Validation schemas**: Test Zod schema validation
- **Run**: `pnpm test`

### E2E Tests  
- **Authentication flow**: Sign-up → sign-in → dashboard access
- **Client management**: Create → edit → delete workflow
- **Recipe operations**: CRUD operations + PDF export
- **Meal plan generation**: Full workflow including PDF export
- **Health endpoints**: API availability checks
- **Run**: `pnpm test:e2e`

### Test Configuration
- **Headless by default**: Set `PWDEBUG=1` for visual debugging
- **Parallel execution**: Tests run in parallel for speed
- **Database isolation**: Each test creates isolated test data
- **PDF verification**: Downloads are tested for proper file naming

## 🔧 Development Workflow

### Local Development
1. Start database: `pnpm db:up`
2. Run migrations: `pnpm db:migrate` 
3. Seed data: `pnpm db:seed`
4. Import ingredients: `pnpm ingredients:import`
5. Start dev server: `pnpm dev`
6. Run tests: `pnpm test` and `pnpm test:e2e`

### Ingredient Management
**Import Ingredients from Excel**
```bash
# Place your Excel file at data/ingredients/JMPP_CUSTOM_INGREDIENT_DB.xlsx
# Excel should have columns: name, unitBase, kcal100, protein100, carbs100, fat100
# Optional columns: category, alias (comma-separated)
pnpm ingredients:import
```

**Excel Format Requirements**
- **name**: Ingredient name (required)
- **unitBase**: GRAM, ML, or UNIT (defaults to GRAM)
- **kcal100**: Calories per 100 units (required)
- **protein100**: Protein grams per 100 units (required)
- **carbs100**: Carbohydrate grams per 100 units (required)
- **fat100**: Fat grams per 100 units (required)
- **category**: Optional category classification
- **alias**: Optional comma-separated aliases for searching

The import script will:
- Upsert ingredients by name (updates existing, creates new)
- Validate all macro values are present and non-negative
- Skip rows with missing required data
- Provide detailed import summary with error reporting

### Code Quality
- **Pre-commit hooks**: Husky runs linting and formatting
- **Type safety**: Strict TypeScript configuration
- **API contracts**: tRPC ensures end-to-end type safety
- **Database safety**: Prisma provides type-safe database access

## 📈 Meal Plan Optimization

The meal plan generator uses a greedy optimization algorithm:

### Algorithm Features
- **Macro targeting**: Optimizes for calories, protein, carbs, and fat
- **Tolerance-based**: Configurable percentage tolerance (e.g., ±10%)
- **Serving adjustments**: Increments servings in 0.25 steps
- **Iteration capping**: Prevents infinite loops (50 iteration max)
- **Multi-day support**: Generates consistent daily nutrition targets

### Optimization Process
1. **Calculate current macros** from initial recipe servings
2. **Compare to targets** and identify largest macro deficit/surplus  
3. **Select best recipe** that can address the largest macro gap
4. **Adjust servings** in small increments (0.25 serving steps)
5. **Repeat until within tolerance** or iteration limit reached

## 📝 Known Issues & Future Enhancements

### Current Limitations
- **Algorithm simplicity**: Greedy approach may not find optimal solutions
- **Recipe constraints**: Limited ingredient database and nutrition data
- **Client access**: No client-facing portal for meal plan viewing
- **Mobile optimization**: Interface designed primarily for desktop use

### Planned Improvements
- **Advanced optimization**: Implement genetic algorithm or ML-based optimization
- **External APIs**: Integration with comprehensive nutrition databases
- **Client portal**: Allow clients to view and interact with their meal plans
- **Mobile app**: Native mobile application for better user experience
- **Grocery integration**: Shopping list generation with store integration

## 🤝 Contributing

1. **Fork the repository** and create a feature branch
2. **Follow the existing patterns** for code organization and naming
3. **Add tests** for new functionality (unit + e2e as appropriate)
4. **Run quality checks**: `pnpm lint`, `pnpm type-check`, `pnpm test`
5. **Submit a pull request** with clear description of changes

## 📄 License

This project is proprietary software developed for JM Peak Performance. All rights reserved.

---

**Built with ❤️ for nutrition coaching excellence**
