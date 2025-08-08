/**
 * Typed route constants to avoid magic strings
 * Add new routes here as the app grows
 */
export const routes = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  dashboard: "/dashboard",

  // Feature routes (to be implemented)
  clients: "/clients",
  recipes: "/recipes",
  mealPlans: "/meal-plans",

  // Debug routes
  debugHealth: "/debug/health",

  // Auth callbacks
  authCallback: "/api/auth/callback",
  authSignOut: "/api/auth/signout",
} as const;

/**
 * Helper functions for dynamic routes
 */
export const dynamicRoutes = {
  client: (id: string) => `/clients/${id}`,
  recipe: (id: string) => `/recipes/${id}`,
  mealPlan: (id: string) => `/meal-plans/${id}`,
  editClient: (id: string) => `/clients/${id}/edit`,
  editRecipe: (id: string) => `/recipes/${id}/edit`,
  editMealPlan: (id: string) => `/meal-plans/${id}/edit`,
} as const;

/**
 * Type for all available routes
 */
export type Route = (typeof routes)[keyof typeof routes];

/**
 * Check if current path matches a route
 */
export function isActiveRoute(currentPath: string, route: Route): boolean {
  return currentPath === route;
}

/**
 * Get the base path from a dynamic route
 */
export function getBasePath(path: string): string {
  return path.split("/").slice(0, 2).join("/");
}
