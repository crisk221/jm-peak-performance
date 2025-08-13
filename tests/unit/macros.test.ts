import { describe, it, expect } from 'vitest';
import { calculateMacros, formatMacros, isWithinTolerance, optimizeServings, type MacroTargets } from '../../packages/api/src/utils/macros';
import type { MealPlanDay } from '../../packages/types/src/mealPlan';

describe('Macro Utilities', () => {
  describe('calculateMacros', () => {
    it('should calculate total macros for meal plan items', () => {
      const items: MealPlanDay['items'] = [
        {
          recipeId: 'r1',
          servings: 2,
          recipe: {
            id: 'r1',
            title: 'High Protein Breakfast',
            kcalPerServing: 300,
            proteinPerServing: 25,
            carbsPerServing: 15,
            fatPerServing: 12,
          }
        },
        {
          recipeId: 'r2',
          servings: 1.5,
          recipe: {
            id: 'r2',
            title: 'Balanced Lunch',
            kcalPerServing: 400,
            proteinPerServing: 30,
            carbsPerServing: 35,
            fatPerServing: 15,
          }
        }
      ];

      const result = calculateMacros(items);

      expect(result.kcal).toBe(1200); // (300 * 2) + (400 * 1.5)
      expect(result.protein).toBe(95); // (25 * 2) + (30 * 1.5)
      expect(result.carbs).toBe(82.5); // (15 * 2) + (35 * 1.5)
      expect(result.fat).toBe(46.5); // (12 * 2) + (15 * 1.5)
    });

    it('should handle empty items array', () => {
      const result = calculateMacros([]);
      
      expect(result.kcal).toBe(0);
      expect(result.protein).toBe(0);
      expect(result.carbs).toBe(0);
      expect(result.fat).toBe(0);
    });
  });

  describe('formatMacros', () => {
    it('should format macro values correctly', () => {
      const macros = {
        kcal: 1234.6,
        protein: 98.3,
        carbs: 145.7,
        fat: 56.2
      };

      const result = formatMacros(macros);
      
      expect(result).toBe('1235 kcal, 98g protein, 146g carbs, 56g fat');
    });

    it('should handle zero values', () => {
      const macros = {
        kcal: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      };

      const result = formatMacros(macros);
      
      expect(result).toBe('0 kcal, 0g protein, 0g carbs, 0g fat');
    });
  });

  describe('isWithinTolerance', () => {
    const target: MacroTargets = {
      kcal: 2000,
      protein: 150,
      carbs: 200,
      fat: 80
    };

    it('should return true when all macros are within tolerance', () => {
      const current = {
        kcal: 1950, // 2.5% off
        protein: 145, // 3.3% off
        carbs: 190, // 5% off
        fat: 84 // 5% off
      };

      expect(isWithinTolerance(current, target, 10)).toBe(true);
      expect(isWithinTolerance(current, target, 5)).toBe(true);
      expect(isWithinTolerance(current, target, 2)).toBe(false);
    });

    it('should return false when any macro exceeds tolerance', () => {
      const current = {
        kcal: 1800, // 10% off
        protein: 150,
        carbs: 200,
        fat: 80
      };

      expect(isWithinTolerance(current, target, 5)).toBe(false);
      expect(isWithinTolerance(current, target, 15)).toBe(true);
    });
  });

  describe('optimizeServings', () => {
    const target: MacroTargets = {
      kcal: 600,
      protein: 45,
      carbs: 60,
      fat: 20
    };

    const createMockItem = (
      id: string,
      kcal: number,
      protein: number,
      carbs: number,
      fat: number,
      servings: number = 1
    ): MealPlanDay['items'][0] => ({
      recipeId: id,
      servings,
      recipe: {
        id,
        title: `Recipe ${id}`,
        kcalPerServing: kcal,
        proteinPerServing: protein,
        carbsPerServing: carbs,
        fatPerServing: fat,
      }
    });

    it('should optimize servings to meet target macros within tolerance', () => {
      // Use recipes that require adjustment to meet target
      const items = [
        createMockItem('1', 200, 20, 20, 8, 1), // Balanced protein 
        createMockItem('2', 180, 8, 30, 6, 1),  // Higher carb
      ];

      // Target that requires optimization: 450 kcal (current is 380)
      const target: MacroTargets = {
        kcal: 450,
        protein: 32,
        carbs: 56,
        fat: 16
      };

      const initialMacros = calculateMacros(items);
      const result = optimizeServings(items, target, 15); // 15% tolerance
      const finalMacros = calculateMacros(result);
      
      // Should be within 15% tolerance 
      expect(isWithinTolerance(finalMacros, target, 15)).toBe(true);
      
      // Should have adjusted servings (not all 1.0)
      const hasAdjustedServings = result.some(item => item.servings !== 1);
      expect(hasAdjustedServings).toBe(true);
    });

    it('should stop at iteration cap to prevent infinite loops', () => {
      const items = [
        createMockItem('1', 50, 5, 5, 2, 1), // Low macro recipe
      ];

      const highTarget: MacroTargets = {
        kcal: 2000,
        protein: 200,
        carbs: 250,
        fat: 80
      };

      const result = optimizeServings(items, highTarget, 1); // Very strict tolerance
      
      // Should not crash and should return some result
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      
      // Should cap servings reasonably (not exceed 20)
      expect(result[0].servings).toBeLessThanOrEqual(20);
    });

    it('should handle recipes with zero macros gracefully', () => {
      const items = [
        createMockItem('1', 0, 0, 0, 0, 1),
        createMockItem('2', 300, 25, 30, 10, 1)
      ];

      const result = optimizeServings(items, target, 10);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
    });

    it('should round servings to nearest 0.25', () => {
      const items = [
        createMockItem('1', 300, 25, 30, 10, 1)
      ];

      const result = optimizeServings(items, target, 5);
      
      // Check that servings are rounded to 0.25 increments
      result.forEach(item => {
        const rounded = Math.round(item.servings * 4) / 4;
        expect(item.servings).toBe(rounded);
      });
    });
  });
});
