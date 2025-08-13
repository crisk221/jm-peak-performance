import { describe, it, expect } from 'vitest';
import { calcRecipePerServing, formatMacros } from '../../src/lib/nutrition';
import { recipeSchema } from '../../src/schemas/recipe';

describe('Recipe Management', () => {
  describe('calcRecipePerServing', () => {
    it('calculates nutrition correctly for 2-ingredient recipe', () => {
      const recipe = {
        baseServings: 2,
        ingredients: [
          {
            gramsPerBase: 200,
            ingredient: {
              kcalPer100g: 165,
              proteinPer100g: 23.0,
              carbsPer100g: 0.0,
              fatPer100g: 3.6,
            },
          },
          {
            gramsPerBase: 150,
            ingredient: {
              kcalPer100g: 130,
              proteinPer100g: 2.7,
              carbsPer100g: 28.0,
              fatPer100g: 0.3,
            },
          },
        ],
      };

      const result = calcRecipePerServing(recipe);

      // Chicken: 200g = 2x values (protein: 46, carbs: 0, fat: 7.2, kcal: 330)
      // Rice: 150g = 1.5x values (protein: 4.05, carbs: 42, fat: 0.45, kcal: 195)
      // Total: protein: 50.05, carbs: 42, fat: 7.65, kcal: 525
      // Per serving (2): protein: 25.025, carbs: 21, fat: 3.825, kcal: 262.5

      expect(result.p).toBeCloseTo(25.025, 2);
      expect(result.c).toBeCloseTo(21, 2);
      expect(result.f).toBeCloseTo(3.825, 2);
      expect(result.kcal).toBeCloseTo(262.5, 2);
    });

    it('handles single serving recipe', () => {
      const recipe = {
        baseServings: 1,
        ingredients: [
          {
            gramsPerBase: 50,
            ingredient: {
              kcalPer100g: 389,
              proteinPer100g: 16.9,
              carbsPer100g: 66.3,
              fatPer100g: 6.9,
            },
          },
        ],
      };

      const result = calcRecipePerServing(recipe);

      // 50g oats = 0.5x values
      expect(result.p).toBeCloseTo(8.45, 2);
      expect(result.c).toBeCloseTo(33.15, 2);
      expect(result.f).toBeCloseTo(3.45, 2);
      expect(result.kcal).toBeCloseTo(194.5, 2);
    });
  });

  describe('formatMacros', () => {
    it('rounds macros to integers', () => {
      const macros = {
        kcal: 337.45,
        p: 25.67,
        c: 42.12,
        f: 8.89,
      };

      const result = formatMacros(macros);

      expect(result.p).toBe(26);
      expect(result.c).toBe(42);
      expect(result.f).toBe(9);
      expect(result.kcal).toBe(337);
    });
  });

  describe('recipeSchema validation', () => {
    it('rejects empty ingredients array', () => {
      const invalidRecipe = {
        title: 'Test Recipe',
        baseServings: 2,
        cuisine: 'American',
        difficulty: 'Easy' as const,
        instructions: 'Cook it well',
        ingredients: [], // Empty array should fail
      };

      const result = recipeSchema.safeParse(invalidRecipe);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['ingredients']);
        expect(result.error.issues[0].message).toBe('Add at least one ingredient');
      }
    });

    it('rejects negative grams', () => {
      const invalidRecipe = {
        title: 'Test Recipe',
        baseServings: 2,
        cuisine: 'American',
        difficulty: 'Easy' as const,
        instructions: 'Cook it well',
        ingredients: [
          { ingredientId: '1', gramsPerBase: -50 }, // Negative grams should fail
        ],
      };

      const result = recipeSchema.safeParse(invalidRecipe);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['ingredients', 0, 'gramsPerBase']);
      }
    });

    it('accepts valid recipe', () => {
      const validRecipe = {
        title: 'Chicken and Rice',
        baseServings: 4,
        cuisine: 'American',
        difficulty: 'Easy' as const,
        instructions: 'Cook chicken, boil rice, serve together',
        ingredients: [
          { ingredientId: '1', gramsPerBase: 400 },
          { ingredientId: '2', gramsPerBase: 200 },
        ],
      };

      const result = recipeSchema.safeParse(validRecipe);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Chicken and Rice');
        expect(result.data.ingredients).toHaveLength(2);
      }
    });
  });
});
