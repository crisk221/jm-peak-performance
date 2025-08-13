import { z } from "zod";

// Base MealPlan schema matching Prisma model
export const MealPlanSchema = z.object({
  id: z.string().cuid(),
  clientId: z.string().cuid(),
  coachId: z.string().cuid(),
  startDate: z.date(),
  days: z.number().int().min(1).max(365), // Max 1 year
  kcal: z.number().int().nonnegative().max(10000),
  protein: z.number().int().nonnegative().max(1000),
  carbs: z.number().int().nonnegative().max(2000),
  fat: z.number().int().nonnegative().max(1000),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create schema - required fields for meal plan creation
export const MealPlanCreateSchema = z.object({
  clientId: z.string().cuid(),
  coachId: z.string().cuid(),
  startDate: z.date(),
  days: z.number().int().min(1).max(365),
  kcal: z.number().int().nonnegative().max(10000),
  protein: z.number().int().nonnegative().max(1000),
  carbs: z.number().int().nonnegative().max(2000),
  fat: z.number().int().nonnegative().max(1000),
});

// Update schema - partial create with id required
export const MealPlanUpdateSchema = MealPlanCreateSchema.partial().extend({
  id: z.string().cuid(),
});

// Inferred types
export type MealPlan = z.infer<typeof MealPlanSchema>;
export type MealPlanCreate = z.infer<typeof MealPlanCreateSchema>;
export type MealPlanUpdate = z.infer<typeof MealPlanUpdateSchema>;

// Meal Plan Generation Input Schema
export const MealPlanGenerateInputSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  days: z.number().int().min(1).max(30, "Days must be between 1 and 30"),
  mealsPerDay: z.number().int().min(1).max(10, "Meals per day must be between 1 and 10"),
  tolerancePct: z.number().min(0).max(50).optional().default(5),
});

export type MealPlanGenerateInput = z.infer<typeof MealPlanGenerateInputSchema>;

// Meal Plan Save Input Schema
export const MealPlanSaveInputSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  startDate: z.string().min(1, "Start date is required"),
  daysDraft: z.array(z.object({
    totalMacros: z.object({
      kcal: z.number().min(0),
      protein: z.number().min(0),
      carbs: z.number().min(0),
      fat: z.number().min(0),
    }),
    items: z.array(z.object({
      recipeId: z.string().min(1),
      servings: z.number().min(0.25).max(20),
    })),
  })),
});

export type MealPlanSaveInput = z.infer<typeof MealPlanSaveInputSchema>;

// Meal Plan List Input Schema
export const MealPlanListInputSchema = z.object({
  search: z.string().optional(),
});

export type MealPlanListInput = z.infer<typeof MealPlanListInputSchema>;

// Get by ID Schema
export const MealPlanGetByIdInputSchema = z.object({
  id: z.string().min(1, "Meal plan ID is required"),
});

export type MealPlanGetByIdInput = z.infer<typeof MealPlanGetByIdInputSchema>;

// Delete Schema
export const MealPlanDeleteInputSchema = z.object({
  id: z.string().min(1, "Meal plan ID is required"),
});

export type MealPlanDeleteInput = z.infer<typeof MealPlanDeleteInputSchema>;

// Generated Draft Types
export type MealPlanDay = {
  totalMacros: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  items: Array<{
    recipeId: string;
    recipe?: {
      id: string;
      title: string;
      kcalPerServing: number;
      proteinPerServing: number;
      carbsPerServing: number;
      fatPerServing: number;
    };
    servings: number;
  }>;
};

export type MealPlanDraft = {
  days: MealPlanDay[];
  targetMacros: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tolerancePct: number;
};

// Full Meal Plan Type with Relations
export type MealPlanWithItems = {
  id: string;
  clientId: string;
  coachId: string;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
  client: {
    id: string;
    name: string;
    kcalTarget: number;
    proteinTarget: number;
    carbsTarget: number;
    fatTarget: number;
  };
  items: Array<{
    id: string;
    dayNumber: number;
    mealNumber: number;
    recipeId: string;
    servings: number;
    recipe: {
      id: string;
      title: string;
      kcalPerServing: number;
      proteinPerServing: number;
      carbsPerServing: number;
      fatPerServing: number;
    };
  }>;
};
