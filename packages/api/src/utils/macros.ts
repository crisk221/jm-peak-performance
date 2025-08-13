import type { MealPlanDay } from "@jmpp/types";

export interface MacroTargets {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MacroTotals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Calculate total macros for a list of meal plan items
 */
export function calculateMacros(items: MealPlanDay['items']): MacroTotals {
  return items.reduce(
    (acc, item) => ({
      kcal: acc.kcal + (item.recipe?.kcalPerServing || 0) * item.servings,
      protein: acc.protein + (item.recipe?.proteinPerServing || 0) * item.servings,
      carbs: acc.carbs + (item.recipe?.carbsPerServing || 0) * item.servings,
      fat: acc.fat + (item.recipe?.fatPerServing || 0) * item.servings,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/**
 * Check if macros are within tolerance
 */
export function isWithinTolerance(
  current: MacroTotals,
  target: MacroTargets,
  tolerancePct: number
): boolean {
  const toleranceDecimal = tolerancePct / 100;
  
  const kcalDiff = Math.abs(current.kcal - target.kcal) / target.kcal;
  const proteinDiff = Math.abs(current.protein - target.protein) / target.protein;
  const carbsDiff = Math.abs(current.carbs - target.carbs) / target.carbs;
  const fatDiff = Math.abs(current.fat - target.fat) / target.fat;
  
  return kcalDiff <= toleranceDecimal && proteinDiff <= toleranceDecimal && 
         carbsDiff <= toleranceDecimal && fatDiff <= toleranceDecimal;
}

/**
 * Format macro values for display
 */
export function formatMacros(macros: MacroTotals): string {
  return `${Math.round(macros.kcal)} kcal, ${Math.round(macros.protein)}g protein, ${Math.round(macros.carbs)}g carbs, ${Math.round(macros.fat)}g fat`;
}

/**
 * Simple greedy optimization function for meal plan servings
 */
export function optimizeServings(
  items: MealPlanDay['items'],
  targetMacros: MacroTargets,
  tolerancePct: number
): MealPlanDay['items'] {
  const optimizedItems = [...items];
  const maxIterations = 50; // Prevent infinite loops
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const currentTotals = calculateMacros(optimizedItems);

    // Check if we're within tolerance
    if (isWithinTolerance(currentTotals, targetMacros, tolerancePct)) {
      break;
    }

    // Find the macro that's most off and adjust the serving that can help most
    const macroDeltas = {
      kcal: targetMacros.kcal - currentTotals.kcal,
      protein: targetMacros.protein - currentTotals.protein,
      carbs: targetMacros.carbs - currentTotals.carbs,
      fat: targetMacros.fat - currentTotals.fat,
    };

    // Find the largest absolute delta
    const largestDelta = Object.entries(macroDeltas).reduce((max, [macro, delta]) => 
      Math.abs(delta) > Math.abs(max.delta) ? { macro, delta } : max,
      { macro: 'kcal', delta: macroDeltas.kcal }
    );

    // Find the recipe that can best help with this macro
    let bestItemIndex = 0;
    let bestContribution = 0;
    
    optimizedItems.forEach((item, index) => {
      if (!item.recipe) return;
      
      const contribution = largestDelta.macro === 'kcal' ? item.recipe.kcalPerServing :
                          largestDelta.macro === 'protein' ? item.recipe.proteinPerServing :
                          largestDelta.macro === 'carbs' ? item.recipe.carbsPerServing :
                          item.recipe.fatPerServing;
      
      if (Math.abs(contribution) > Math.abs(bestContribution)) {
        bestItemIndex = index;
        bestContribution = contribution;
      }
    });

    // Adjust serving size
    const step = 0.25;
    if (largestDelta.delta > 0 && optimizedItems[bestItemIndex].servings < 20) {
      optimizedItems[bestItemIndex].servings += step;
    } else if (largestDelta.delta < 0 && optimizedItems[bestItemIndex].servings > step) {
      optimizedItems[bestItemIndex].servings -= step;
    }

    // Round to nearest 0.25
    optimizedItems[bestItemIndex].servings = Math.round(optimizedItems[bestItemIndex].servings * 4) / 4;
  }

  return optimizedItems;
}
