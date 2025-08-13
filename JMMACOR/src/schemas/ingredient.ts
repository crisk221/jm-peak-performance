import { z } from "zod";

export const ingredientSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120, "Name must be less than 120 characters"),
  kcalPer100g: z.number().min(0, "Calories cannot be negative"),
  proteinPer100g: z.number().min(0, "Protein cannot be negative"),
  carbsPer100g: z.number().min(0, "Carbs cannot be negative"),
  fatPer100g: z.number().min(0, "Fat cannot be negative"),
  allergens: z.array(z.string().trim()).default([]),
});

export type IngredientFormData = z.infer<typeof ingredientSchema>;
