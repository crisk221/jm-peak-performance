<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Personal Trainer Wizard App

This is a Next.js 14 + React + TypeScript application for building a 3-page wizard app for personal trainers.

## Tech Stack
- Next.js 14 with App Router
- TypeScript with strict mode and exactOptionalPropertyTypes enabled
- Tailwind CSS + shadcn/ui for styling
- React Hook Form + Zod for form validation
- Prisma with SQLite for database
- Zustand for wizard state management
- Playwright for server-side PDF generation

## Project Structure
- **Page 1**: Client intake form
- **Page 2**: Macro calculator (replicating calculator.net behavior)  
- **Page 3**: Meal plan builder with PDF export

## Key Requirements
- Replicate calculator.net macro calculator behavior closely (Mifflin-St Jeor by default)
- Activity multipliers and weekly goal adjustments
- Preset options: Balanced / Low Fat / Low Carb / High Protein / Create Your Own
- Functional identity with calculator.net outputs (±1-2% tolerance)
- Database models for Ingredient, Recipe, RecipeIngredient (UI hidden until later)

## Coding Guidelines
- Use TypeScript strict mode
- Follow shadcn/ui component patterns
- Implement proper form validation with Zod schemas
- Use Zustand for cross-page state persistence
- Maintain calculator.net formula accuracy
