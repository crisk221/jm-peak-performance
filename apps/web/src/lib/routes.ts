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
  clients: "/dashboard/clients",
  clientNew: "/dashboard/clients/new",
  recipes: "/dashboard/recipes",
  recipeNew: "/dashboard/recipes/new",
  mealPlans: "/dashboard/meal-plans",
  mealPlanNew: "/dashboard/meal-plans/new",

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
  client: (id: string) => `/dashboard/clients/${id}`,
  clientEdit: (id: string) => `/dashboard/clients/${id}/edit`,
  clientNew: () => `/dashboard/clients/new`,
  recipe: (id: string) => `/dashboard/recipes/${id}`,
  recipeEdit: (id: string) => `/dashboard/recipes/${id}/edit`,
  recipeNew: () => `/dashboard/recipes/new`,
  mealPlan: (id: string) => `/dashboard/meal-plans/${id}`,
  mealPlanNew: () => `/dashboard/meal-plans/new`,
  editClient: (id: string) => `/dashboard/clients/${id}/edit`,
  editRecipe: (id: string) => `/dashboard/recipes/${id}/edit`,
  editMealPlan: (id: string) => `/dashboard/meal-plans/${id}/edit`,
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
