import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Basic macro energy calculation (4 kcal/g for protein and carbs, 9 kcal/g for fat)
export function macroEnergy({ p, c, f }: { p: number; c: number; f: number }): number {
  return p * 4 + c * 4 + f * 9;
}

// Sum multiple macro objects together
export function sumMacros(...items: Array<{ p: number; c: number; f: number }>): { p: number; c: number; f: number } {
  return items.reduce(
    (total, item) => ({
      p: total.p + item.p,
      c: total.c + item.c,
      f: total.f + item.f,
    }),
    { p: 0, c: 0, f: 0 }
  );
}

// Calculate recipe nutrition for given servings
export async function calcRecipeNutrition(recipeId: string, servings: number): Promise<{
  kcal: number;
  p: number;
  c: number;
  f: number;
}> {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  if (!recipe) {
    throw new Error(`Recipe not found: ${recipeId}`);
  }

  // Calculate total macros from all ingredients
  let totalP = 0;
  let totalC = 0;
  let totalF = 0;

  for (const recipeIngredient of recipe.ingredients) {
    const ingredient = recipeIngredient.ingredient;
    
    // Scale ingredient amount by servings ratio
    const gramsUsed = recipeIngredient.gramsPerBase * (servings / recipe.baseServings);
    
    // Calculate macros for this amount (ingredient values are per 100g)
    const factor = gramsUsed / 100;
    totalP += ingredient.proteinPer100g * factor;
    totalC += ingredient.carbsPer100g * factor;
    totalF += ingredient.fatPer100g * factor;
  }

  const macros = { p: totalP, c: totalC, f: totalF };
  const kcal = macroEnergy(macros);

  return {
    kcal: Math.round(kcal),
    p: Math.round(totalP * 10) / 10, // Round to 1 decimal
    c: Math.round(totalC * 10) / 10,
    f: Math.round(totalF * 10) / 10,
  };
}

// Find optimal servings to hit target kcal
export async function scaleServingsForTargetKcal({
  recipeId,
  targetKcal,
  baseServings,
}: {
  recipeId: string;
  targetKcal: number;
  baseServings: number;
}): Promise<number> {
  // First, get nutrition for 1 serving to find kcal per serving
  const baseNutrition = await calcRecipeNutrition(recipeId, 1);
  const kcalPerServing = baseNutrition.kcal;

  if (kcalPerServing <= 0) {
    return 1; // Fallback if no calories
  }

  // Simple proportional scaling
  let targetServings = targetKcal / kcalPerServing;

  // Clamp to reasonable range
  targetServings = Math.max(0.25, Math.min(3.0, targetServings));

  // Round to nearest 0.25 for practical serving sizes
  return Math.round(targetServings * 4) / 4;
}

// Calculate macro percentages from gram amounts
export function macroPercentages(macros: { p: number; c: number; f: number }): {
  pctP: number;
  pctC: number;
  pctF: number;
} {
  const totalKcal = macroEnergy(macros);
  
  if (totalKcal === 0) {
    return { pctP: 0, pctC: 0, pctF: 0 };
  }

  return {
    pctP: Math.round((macros.p * 4 / totalKcal) * 100),
    pctC: Math.round((macros.c * 4 / totalKcal) * 100),
    pctF: Math.round((macros.f * 9 / totalKcal) * 100),
  };
}

// Check if macros are within tolerance
export function isWithinTolerance(
  current: { kcal: number; p: number; c: number; f: number },
  target: { kcal: number; p: number; c: number; f: number },
  kcalTolerance = 0.05, // 5%
  macroTolerance = 0.08  // 8%
): {
  kcal: boolean;
  protein: boolean;
  carbs: boolean;
  fat: boolean;
  overall: boolean;
} {
  const kcalOk = Math.abs(current.kcal - target.kcal) <= target.kcal * kcalTolerance;
  const pOk = Math.abs(current.p - target.p) <= target.p * macroTolerance;
  const cOk = Math.abs(current.c - target.c) <= target.c * macroTolerance;
  const fOk = Math.abs(current.f - target.f) <= target.f * macroTolerance;

  return {
    kcal: kcalOk,
    protein: pOk,
    carbs: cOk,
    fat: fOk,
    overall: kcalOk && pOk && cOk && fOk,
  };
}

// Scale all servings by a common factor to hit target calories
export function rebalanceServings(
  meals: Array<{ servings: number; kcal: number }>,
  targetKcal: number
): Array<{ servings: number }> {
  const currentTotalKcal = meals.reduce((sum, meal) => sum + meal.kcal, 0);
  
  if (currentTotalKcal === 0) {
    return meals.map(() => ({ servings: 1 }));
  }

  const scaleFactor = targetKcal / currentTotalKcal;
  
  return meals.map(meal => ({
    servings: Math.max(0.25, Math.min(3.0, Math.round(meal.servings * scaleFactor * 4) / 4))
  }));
}

// Calculate recipe nutrition per serving from recipe data
export function calcRecipePerServing(recipe: { 
  baseServings: number; 
  ingredients: Array<{ 
    gramsPerBase: number; 
    ingredient: { 
      kcalPer100g: number; 
      proteinPer100g: number; 
      carbsPer100g: number; 
      fatPer100g: number; 
    }
  }> 
}): { kcal: number, p: number, c: number, f: number } {
  const totalKcal = recipe.ingredients.reduce((sum, ri) => 
    sum + (ri.gramsPerBase * ri.ingredient.kcalPer100g / 100), 0);
  const totalProtein = recipe.ingredients.reduce((sum, ri) => 
    sum + (ri.gramsPerBase * ri.ingredient.proteinPer100g / 100), 0);
  const totalCarbs = recipe.ingredients.reduce((sum, ri) => 
    sum + (ri.gramsPerBase * ri.ingredient.carbsPer100g / 100), 0);
  const totalFat = recipe.ingredients.reduce((sum, ri) => 
    sum + (ri.gramsPerBase * ri.ingredient.fatPer100g / 100), 0);

  return {
    kcal: totalKcal / recipe.baseServings,
    p: totalProtein / recipe.baseServings,
    c: totalCarbs / recipe.baseServings,
    f: totalFat / recipe.baseServings
  };
}

// Format macros for UI display (rounded integers)
export function formatMacros({ kcal, p, c, f }: { kcal: number, p: number, c: number, f: number }) {
  return {
    kcal: Math.round(kcal),
    p: Math.round(p),
    c: Math.round(c),
    f: Math.round(f)
  };
}
