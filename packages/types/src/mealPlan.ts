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
