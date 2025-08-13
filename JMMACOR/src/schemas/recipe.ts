import { z } from "zod";

export const recipeIngredientRow = z.object({
  ingredientId: z.string().min(1),
  gramsPerBase: z.number().min(1).max(5000),
});

export const recipeSchema = z.object({
  title: z.string().min(2).max(120),
  cuisine: z.string().max(60).optional().or(z.literal("")),
  difficulty: z.enum(["Easy","Medium","Hard","Fast","Long"]).optional(),
  utensils: z.array(z.string().min(1)).max(20).default([]),
  baseServings: z.number().min(0.5).max(20),
  instructions: z.string().min(5),
  ingredients: z.array(recipeIngredientRow).min(1, "Add at least one ingredient"),
});

export type RecipeFormData = z.infer<typeof recipeSchema>;
