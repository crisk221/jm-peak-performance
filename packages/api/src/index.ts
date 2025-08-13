// Force environment validation on import
import "./env";

import { createTRPCRouter } from "./trpc";
import { healthRouter } from "./routers/health";
import { userRouter } from "./routers/user";
import { clientRouter } from "./routers/client";
import { recipeRouter } from "./routers/recipe";
import { mealPlanRouter } from "./routers/mealPlan";
import { ingredientRouter } from "./routers/ingredient";

// Export context creation for Next.js API routes
export { createContext as createTRPCContext } from "./context";

// PDF service is exported separately to avoid bundling Playwright with tRPC
// Import from '@jmpp/api/pdf' instead
// export { renderRecipePdf } from './services/pdf';

/**
 * Main tRPC app router - combines all subrouters
 */
export const appRouter = createTRPCRouter({
  health: healthRouter,
  user: userRouter,
  client: clientRouter,
  recipe: recipeRouter,
  mealPlan: mealPlanRouter,
  ingredient: ingredientRouter,
});

/**
 * Type definition for tRPC router
 * This will be used on the client for end-to-end type safety
 */
export type AppRouter = typeof appRouter;
