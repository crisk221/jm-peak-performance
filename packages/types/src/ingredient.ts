import { z } from "zod";
import { UnitBase } from "@prisma/client";

// Base Ingredient schema matching Prisma model
export const IngredientSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(255),
  unitBase: z.nativeEnum(UnitBase),
  kcal100: z.number().nonnegative().max(2000),
  protein100: z.number().nonnegative().max(200),
  carbs100: z.number().nonnegative().max(200),
  fat100: z.number().nonnegative().max(200),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create schema - required fields for ingredient creation
export const IngredientCreateSchema = z.object({
  name: z.string().min(1).max(255),
  unitBase: z.nativeEnum(UnitBase),
  kcal100: z.number().nonnegative().max(2000),
  protein100: z.number().nonnegative().max(200),
  carbs100: z.number().nonnegative().max(200),
  fat100: z.number().nonnegative().max(200),
});

// Update schema - partial create with id required
export const IngredientUpdateSchema = IngredientCreateSchema.partial().extend({
  id: z.string().cuid(),
});

// Inferred types
export type Ingredient = z.infer<typeof IngredientSchema>;
export type IngredientCreate = z.infer<typeof IngredientCreateSchema>;
export type IngredientUpdate = z.infer<typeof IngredientUpdateSchema>;
