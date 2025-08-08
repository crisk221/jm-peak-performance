// Database client and schema definitions
export { prisma } from "./client";

// Re-export Prisma types
export type {
  User,
  Client,
  Ingredient,
  Utensil,
  Tag,
  Recipe,
  RecipeIngredient,
  RecipeUtensil,
  RecipeTag,
  MealPlan,
  MealPlanItem,
  UserRole,
  Sex,
  Goal,
  UnitBase,
  IngredientUnit,
  MealType,
  Difficulty,
} from "@prisma/client";
