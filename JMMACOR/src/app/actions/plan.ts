'use server';

import { PrismaClient } from '@prisma/client';
import { calcRecipeNutrition, scaleServingsForTargetKcal, macroEnergy } from '@/lib/nutrition';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// Get plan with client data
export async function getPlan(planId: string) {
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    include: {
      client: true,
      meals: {
        include: {
          recipe: true,
        },
        orderBy: {
          slot: 'asc',
        },
      },
    },
  });

  if (!plan) {
    throw new Error(`Plan not found: ${planId}`);
  }

  return {
    ...plan,
    // Parse JSON fields
    custom: plan.custom ? JSON.parse(plan.custom) : null,
    client: {
      ...plan.client,
      allergies: plan.client.allergies ? JSON.parse(plan.client.allergies) : [],
      dislikes: plan.client.dislikes ? JSON.parse(plan.client.dislikes) : [],
      includeMeals: plan.client.includeMeals ? JSON.parse(plan.client.includeMeals) : [],
    },
  };
}

// List recipes with optional filtering
export async function listRecipes({
  query,
  cuisine,
  limit = 10,
}: {
  query?: string;
  cuisine?: string;
  limit?: number;
} = {}) {
  const where: any = {};

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (cuisine) {
    where.cuisine = cuisine;
  }

  const recipes = await prisma.recipe.findMany({
    where,
    take: limit,
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return recipes;
}

// Server wrapper for recipe nutrition calculation
export async function computeRecipeNutrition(recipeId: string, servings: number) {
  return await calcRecipeNutrition(recipeId, servings);
}

// Create or update a meal
export async function upsertMeal({
  planId,
  slot,
  recipeId,
  servings,
  macros,
}: {
  planId: string;
  slot: string;
  recipeId?: string;
  servings: number;
  macros?: { kcal: number; p: number; c: number; f: number };
}) {
  // Calculate nutrition if not provided
  let nutrition = macros;
  if (!nutrition) {
    if (recipeId) {
      nutrition = await calcRecipeNutrition(recipeId, servings);
    } else {
      // Default nutrition for meals without recipes
      nutrition = { kcal: 0, p: 0, c: 0, f: 0 };
    }
  }

  // Find existing meal for this plan and slot
  const existingMeal = await prisma.meal.findFirst({
    where: {
      planId,
      slot,
    },
  });

  const mealData = {
    planId,
    slot,
    recipeId: recipeId || null,
    servings,
    kcal: nutrition.kcal,
    protein: nutrition.p,
    carbs: nutrition.c,
    fat: nutrition.f,
  };

  let meal;
  if (existingMeal) {
    meal = await prisma.meal.update({
      where: { id: existingMeal.id },
      data: mealData,
      include: {
        recipe: true,
      },
    });
  } else {
    meal = await prisma.meal.create({
      data: mealData,
      include: {
        recipe: true,
      },
    });
  }

  revalidatePath(`/wizard/plan`);
  return meal;
}

// Delete a meal
export async function deleteMeal({ mealId }: { mealId: string }) {
  await prisma.meal.delete({
    where: { id: mealId },
  });

  revalidatePath(`/wizard/plan`);
}

// Auto-populate meals for a plan based on slot targets
export async function autoPopulateMeals({
  planId,
  slots,
  slotKcalTargets,
}: {
  planId: string;
  slots: string[];
  slotKcalTargets: Record<string, number>;
}) {
  // Get available recipes
  const recipes = await listRecipes({ limit: 20 });
  
  if (recipes.length === 0) {
    throw new Error('No recipes available. Please seed some recipes first.');
  }

  // Distribute recipes across slots (simple round-robin)
  const meals = [];
  
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const targetKcal = slotKcalTargets[slot];
    const recipe = recipes[i % recipes.length]; // Cycle through available recipes
    
    // Calculate optimal servings for this slot's target calories
    const servings = await scaleServingsForTargetKcal({
      recipeId: recipe.id,
      targetKcal,
      baseServings: recipe.baseServings,
    });

    // Create the meal
    const meal = await upsertMeal({
      planId,
      slot,
      recipeId: recipe.id,
      servings,
    });
    
    meals.push(meal);
  }

  return meals;
}

// Rebalance all meals in a plan to hit target calories
export async function rebalancePlan({ planId }: { planId: string }) {
  const plan = await getPlan(planId);
  const targetKcal = plan.kcalTarget;
  
  if (plan.meals.length === 0) {
    return [];
  }

  // Calculate current total calories
  const currentTotalKcal = plan.meals.reduce((sum: number, meal: any) => sum + meal.kcal, 0);
  
  if (currentTotalKcal === 0) {
    return plan.meals;
  }

  // Calculate scale factor
  const scaleFactor = targetKcal / currentTotalKcal;
  
  // Update each meal's servings
  const updatedMeals = [];
  
  for (const meal of plan.meals) {
    const newServings = Math.max(0.25, Math.min(3.0, 
      Math.round(meal.servings * scaleFactor * 4) / 4
    ));
    
    const updatedMeal = await upsertMeal({
      planId,
      slot: meal.slot,
      ...(meal.recipeId && { recipeId: meal.recipeId }),
      servings: newServings,
    });
    
    updatedMeals.push(updatedMeal);
  }

  return updatedMeals;
}

// Get unique cuisines for filtering
export async function getCuisines() {
  const result = await prisma.recipe.findMany({
    select: {
      cuisine: true,
    },
    distinct: ['cuisine'],
    where: {
      cuisine: {
        not: null,
      },
    },
    orderBy: {
      cuisine: 'asc',
    },
  });

  return result.map((r: any) => r.cuisine).filter(Boolean);
}
