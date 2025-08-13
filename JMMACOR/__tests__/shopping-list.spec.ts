import { describe, it, expect, vi } from 'vitest';
import { computeShoppingList, formatAmount } from '@/lib/shopping-list';

// Mock Prisma
const mockPrisma = {
  plan: {
    findUnique: vi.fn(),
  },
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

// Mock data for testing
const mockPlanWithMeals = {
  id: 'test-plan-1',
  meals: [
    {
      id: 'meal-1',
      slot: 'Breakfast',
      servings: 2,
      recipe: {
        id: 'recipe-1',
        name: 'Oatmeal',
        ingredients: [
          {
            id: 'ri-1',
            gramsPerBase: 50, // 50g oats per serving
            ingredient: {
              name: 'Rolled Oats',
              kcalPer100g: 379,
              proteinPer100g: 13.2,
              carbsPer100g: 67.7,
              fatPer100g: 6.5,
            },
          },
          {
            id: 'ri-2',
            gramsPerBase: 20, // 20g almonds per serving
            ingredient: {
              name: 'Almonds',
              kcalPer100g: 579,
              proteinPer100g: 21.15,
              carbsPer100g: 21.55,
              fatPer100g: 49.93,
            },
          },
        ],
      },
    },
    {
      id: 'meal-2',
      slot: 'Lunch',
      servings: 1,
      recipe: {
        id: 'recipe-2',
        name: 'Salad',
        ingredients: [
          {
            id: 'ri-3',
            gramsPerBase: 30, // 30g almonds per serving (same ingredient as breakfast)
            ingredient: {
              name: 'Almonds',
              kcalPer100g: 579,
              proteinPer100g: 21.15,
              carbsPer100g: 21.55,
              fatPer100g: 49.93,
            },
          },
          {
            id: 'ri-4',
            gramsPerBase: 100, // 100g lettuce per serving
            ingredient: {
              name: 'Lettuce',
              kcalPer100g: 15,
              proteinPer100g: 1.4,
              carbsPer100g: 2.9,
              fatPer100g: 0.2,
            },
          },
        ],
      },
    },
  ],
};

describe('Shopping List Aggregation', () => {
  it('should aggregate ingredients across multiple meals correctly', async () => {
    // Setup mock
    mockPrisma.plan.findUnique.mockResolvedValue(mockPlanWithMeals);

    const result = await computeShoppingList('test-plan-1');

    // Should have 3 unique ingredients
    expect(result).toHaveLength(3);

    // Find each ingredient in the result
    const oats = result.find(item => item.ingredient === 'Rolled Oats');
    const almonds = result.find(item => item.ingredient === 'Almonds');
    const lettuce = result.find(item => item.ingredient === 'Lettuce');

    // Check oats (only from breakfast: 2 servings × 50g = 100g)
    expect(oats).toBeDefined();
    expect(oats?.totalGrams).toBe(100);
    expect(oats?.displayAmount).toBe('100g');

    // Check almonds (breakfast: 2 × 20g + lunch: 1 × 30g = 70g total)
    expect(almonds).toBeDefined();
    expect(almonds?.totalGrams).toBe(70);
    expect(almonds?.displayAmount).toBe('70g');

    // Check lettuce (only from lunch: 1 × 100g = 100g)
    expect(lettuce).toBeDefined();
    expect(lettuce?.totalGrams).toBe(100);
    expect(lettuce?.displayAmount).toBe('100g');
  });

  it('should handle empty meals gracefully', async () => {
    mockPrisma.plan.findUnique.mockResolvedValue({
      id: 'empty-plan',
      meals: [],
    });

    const result = await computeShoppingList('empty-plan');
    expect(result).toEqual([]);
  });

  it('should handle meals without recipes', async () => {
    mockPrisma.plan.findUnique.mockResolvedValue({
      id: 'no-recipe-plan',
      meals: [
        {
          id: 'meal-1',
          slot: 'Breakfast',
          servings: 1,
          recipe: null,
        },
      ],
    });

    const result = await computeShoppingList('no-recipe-plan');
    expect(result).toEqual([]);
  });
});

describe('Amount Formatting', () => {
  it('should format amounts correctly with smart units', () => {
    // Test grams (default)
    expect(formatAmount(150)).toBe('150g');
    expect(formatAmount(50)).toBe('50g');

    // Test kilograms (≥1000g)
    expect(formatAmount(1000)).toBe('1kg');
    expect(formatAmount(1500)).toBe('1.5kg');
    expect(formatAmount(2000)).toBe('2kg');

    // Test milligrams (<1g)
    expect(formatAmount(0.5)).toBe('500mg');
    expect(formatAmount(0.25)).toBe('250mg');
  });
});
