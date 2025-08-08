import { z } from "zod";
import { MealType, Difficulty, IngredientUnit } from "@prisma/client";

// Base Recipe schema matching Prisma model
export const RecipeSchema = z.object({
  id: z.string().cuid(),
  authorId: z.string().cuid(),
  title: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(1000).nullable(),
  instructions: z.string().min(1),
  servings: z.number().int().min(1).max(100),
  timeMinutes: z.number().int().min(1).max(1440), // Max 24 hours
  mealType: z.nativeEnum(MealType),
  difficulty: z.nativeEnum(Difficulty),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create schema - required fields for recipe creation
export const RecipeCreateSchema = z.object({
  authorId: z.string().cuid(),
  title: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(1000).optional(),
  instructions: z.string().min(1),
  servings: z.number().int().min(1).max(100),
  timeMinutes: z.number().int().min(1).max(1440),
  mealType: z.nativeEnum(MealType),
  difficulty: z.nativeEnum(Difficulty),
});

// Update schema - partial create with id required
export const RecipeUpdateSchema = RecipeCreateSchema.partial().extend({
  id: z.string().cuid(),
});

// Recipe Ingredient schema for nested operations
export const RecipeIngredientSchema = z.object({
  id: z.string().cuid(),
  recipeId: z.string().cuid(),
  ingredientId: z.string().cuid(),
  quantity: z.number().nonnegative().max(10000),
  unit: z.nativeEnum(IngredientUnit),
  note: z.string().max(255).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RecipeIngredientCreateSchema = z.object({
  recipeId: z.string().cuid(),
  ingredientId: z.string().cuid(),
  quantity: z.number().nonnegative().max(10000),
  unit: z.nativeEnum(IngredientUnit),
  note: z.string().max(255).optional(),
});

export const RecipeIngredientUpdateSchema =
  RecipeIngredientCreateSchema.partial().extend({
    id: z.string().cuid(),
  });

// Recipe Utensil schema for nested operations
export const RecipeUtensilSchema = z.object({
  id: z.string().cuid(),
  recipeId: z.string().cuid(),
  utensilId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RecipeUtensilCreateSchema = z.object({
  recipeId: z.string().cuid(),
  utensilId: z.string().cuid(),
});

// Recipe Tag schema for nested operations
export const RecipeTagSchema = z.object({
  id: z.string().cuid(),
  recipeId: z.string().cuid(),
  tagId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RecipeTagCreateSchema = z.object({
  recipeId: z.string().cuid(),
  tagId: z.string().cuid(),
});

// Inferred types
export type Recipe = z.infer<typeof RecipeSchema>;
export type RecipeCreate = z.infer<typeof RecipeCreateSchema>;
export type RecipeUpdate = z.infer<typeof RecipeUpdateSchema>;
export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;
export type RecipeIngredientCreate = z.infer<
  typeof RecipeIngredientCreateSchema
>;
export type RecipeIngredientUpdate = z.infer<
  typeof RecipeIngredientUpdateSchema
>;
export type RecipeUtensil = z.infer<typeof RecipeUtensilSchema>;
export type RecipeUtensilCreate = z.infer<typeof RecipeUtensilCreateSchema>;
export type RecipeTag = z.infer<typeof RecipeTagSchema>;
export type RecipeTagCreate = z.infer<typeof RecipeTagCreateSchema>;
