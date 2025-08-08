import { z } from "zod";

// Base MealPlanItem schema matching Prisma model
export const MealPlanItemSchema = z.object({
  id: z.string().cuid(),
  mealPlanId: z.string().cuid(),
  recipeId: z.string().cuid(),
  dayIndex: z.number().int().min(0).max(364), // 0-indexed, max 365 days
  mealIndex: z.number().int().min(0).max(10), // 0-indexed, flexible meal slots
  servings: z.number().nonnegative().max(100),
  notes: z.string().max(500).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create schema - required fields for meal plan item creation
export const MealPlanItemCreateSchema = z.object({
  mealPlanId: z.string().cuid(),
  recipeId: z.string().cuid(),
  dayIndex: z.number().int().min(0).max(364),
  mealIndex: z.number().int().min(0).max(10),
  servings: z.number().nonnegative().max(100),
  notes: z.string().max(500).optional(),
});

// Update schema - partial create with id required
export const MealPlanItemUpdateSchema =
  MealPlanItemCreateSchema.partial().extend({
    id: z.string().cuid(),
  });

// Inferred types
export type MealPlanItem = z.infer<typeof MealPlanItemSchema>;
export type MealPlanItemCreate = z.infer<typeof MealPlanItemCreateSchema>;
export type MealPlanItemUpdate = z.infer<typeof MealPlanItemUpdateSchema>;
