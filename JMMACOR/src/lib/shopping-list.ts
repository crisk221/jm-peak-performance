import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ShoppingListItem {
  ingredient: string;
  totalGrams: number;
  displayAmount: string;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

export async function computeShoppingList(planId: string): Promise<ShoppingListItem[]> {
  // Get all meals for this plan with their recipes and ingredients
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    include: {
      meals: {
        include: {
          recipe: {
            include: {
              ingredients: {
                include: {
                  ingredient: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!plan) {
    throw new Error(`Plan not found: ${planId}`);
  }

  // Aggregate ingredients across all meals
  const ingredientTotals = new Map<string, {
    totalGrams: number;
    ingredient: any;
  }>();

  for (const meal of plan.meals) {
    if (!meal.recipe) continue;

    const servingRatio = meal.servings / meal.recipe.baseServings;

    for (const recipeIngredient of meal.recipe.ingredients) {
      const ingredientId = recipeIngredient.ingredient.id;
      const scaledGrams = recipeIngredient.gramsPerBase * servingRatio;

      if (ingredientTotals.has(ingredientId)) {
        ingredientTotals.get(ingredientId)!.totalGrams += scaledGrams;
      } else {
        ingredientTotals.set(ingredientId, {
          totalGrams: scaledGrams,
          ingredient: recipeIngredient.ingredient,
        });
      }
    }
  }

  // Convert to shopping list format with smart display units
  const shoppingList: ShoppingListItem[] = [];

  for (const [ingredientId, data] of ingredientTotals) {
    const totalGrams = Math.round(data.totalGrams * 10) / 10; // Round to 1 decimal
    
    shoppingList.push({
      ingredient: data.ingredient.name,
      totalGrams,
      displayAmount: formatAmount(totalGrams),
      kcalPer100g: data.ingredient.kcalPer100g,
      proteinPer100g: data.ingredient.proteinPer100g,
      carbsPer100g: data.ingredient.carbsPer100g,
      fatPer100g: data.ingredient.fatPer100g,
    });
  }

  // Sort alphabetically by ingredient name
  return shoppingList.sort((a, b) => a.ingredient.localeCompare(b.ingredient));
}

export function formatAmount(grams: number): string {
  if (grams >= 1000) {
    const kg = Math.round(grams / 100) / 10; // Round to 1 decimal place
    return `${kg} kg`;
  } else if (grams < 1) {
    // For very small amounts, show in mg
    const mg = Math.round(grams * 1000);
    return `${mg} mg`;
  } else {
    // Round to nearest gram for display
    const roundedGrams = Math.round(grams);
    return `${roundedGrams} g`;
  }
}

// Calculate total nutrition for shopping list (optional utility)
export function calculateShoppingListNutrition(items: ShoppingListItem[]): {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  return items.reduce(
    (totals, item) => {
      const factor = item.totalGrams / 100; // Convert to per-100g factor
      return {
        kcal: totals.kcal + (item.kcalPer100g * factor),
        protein: totals.protein + (item.proteinPer100g * factor),
        carbs: totals.carbs + (item.carbsPer100g * factor),
        fat: totals.fat + (item.fatPer100g * factor),
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
