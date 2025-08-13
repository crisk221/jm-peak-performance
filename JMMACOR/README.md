# Personal Trainer Wizard App

A Next.js 14 + React + TypeScript application for building a 3-page wizard app for personal trainers.

## Features

- **Page 1**: Client intake form
- **Page 2**: Macro calculator (replicating calculator.net behavior)
- **Page 3**: Meal plan builder with PDF export

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode + exactOptionalPropertyTypes)
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Database**: Prisma with SQLite
- **State**: Zustand for wizard state management
- **PDF**: Playwright for server-side PDF generation

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up the database:
```bash
npx prisma migrate dev
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── lib/             # Utility functions
└── types/           # TypeScript type definitions
```

## Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Requirements

- Node.js 18+
- pnpm (recommended) or npm

## Macro Calculator

The macro calculator replicates calculator.net behavior:
- Mifflin-St Jeor formula by default
- Activity multipliers (1.2-1.95 range)
- Weight goal adjustments
- Preset distributions: Balanced/Low Fat/Low Carb/High Protein
- Custom macro distributions with sliders
