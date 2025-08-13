'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export async function listRecipes({ 
  q = '', 
  cuisine = '', 
  page = 1, 
  pageSize = 20 
}: {
  q?: string;
  cuisine?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const skip = (page - 1) * pageSize;
  
  const where = {
    AND: [
      q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { cuisine: { contains: q, mode: 'insensitive' as const } }
        ]
      } : {},
      cuisine ? { cuisine: { equals: cuisine, mode: 'insensitive' as const } } : {}
    ]
  };

  const [items, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.recipe.count({ where })
  ]);

  // Calculate nutrition per serving for each recipe
  const itemsWithNutrition = items.map(recipe => {
    const totalKcal = recipe.ingredients.reduce((sum, ri) => 
      sum + (ri.gramsPerBase * ri.ingredient.kcalPer100g / 100), 0);
    const totalProtein = recipe.ingredients.reduce((sum, ri) => 
      sum + (ri.gramsPerBase * ri.ingredient.proteinPer100g / 100), 0);
    const totalCarbs = recipe.ingredients.reduce((sum, ri) => 
      sum + (ri.gramsPerBase * ri.ingredient.carbsPer100g / 100), 0);
    const totalFat = recipe.ingredients.reduce((sum, ri) => 
      sum + (ri.gramsPerBase * ri.ingredient.fatPer100g / 100), 0);

    return {
      ...recipe,
      kcalPerServing: Math.round(totalKcal / recipe.baseServings),
      proteinPerServing: Math.round(totalProtein / recipe.baseServings),
      carbsPerServing: Math.round(totalCarbs / recipe.baseServings),
      fatPerServing: Math.round(totalFat / recipe.baseServings)
    };
  });

  return { items: itemsWithNutrition, total };
}

export async function getRecipe(id: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: {
        include: {
          ingredient: true
        }
      }
    }
  });

  if (!recipe) {
    throw new Error('Recipe not found');
  }

  return recipe;
}

export async function createRecipe(input: {
  title: string;
  cuisine?: string;
  difficulty?: string;
  utensils: string[];
  baseServings: number;
  instructions: string;
  ingredients: Array<{ ingredientId: string; gramsPerBase: number }>;
}) {
  const result = await prisma.$transaction(async (tx) => {
    // Create recipe
    const recipe = await tx.recipe.create({
      data: {
        name: input.title,
        cuisine: input.cuisine || null,
        difficulty: input.difficulty || null,
        utensils: JSON.stringify(input.utensils),
        baseServings: input.baseServings,
        instructions: input.instructions
      }
    });

    // Create recipe ingredients
    const ingredientRows = input.ingredients.map(ing => ({
      recipeId: recipe.id,
      ingredientId: ing.ingredientId,
      gramsPerBase: Math.max(1, Math.min(5000, ing.gramsPerBase)) // Clamp between 1-5000
    }));

    await tx.recipeIngredient.createMany({
      data: ingredientRows
    });

    return recipe;
  });

  revalidatePath('/dashboard/recipes');
  redirect('/dashboard/recipes');
}

export async function updateRecipe(id: string, input: {
  title: string;
  cuisine?: string;
  difficulty?: string;
  utensils: string[];
  baseServings: number;
  instructions: string;
  ingredients: Array<{ ingredientId: string; gramsPerBase: number }>;
}) {
  await prisma.$transaction(async (tx) => {
    // Update recipe
    await tx.recipe.update({
      where: { id },
      data: {
        name: input.title,
        cuisine: input.cuisine || null,
        difficulty: input.difficulty || null,
        utensils: JSON.stringify(input.utensils),
        baseServings: input.baseServings,
        instructions: input.instructions
      }
    });

    // Delete existing ingredients
    await tx.recipeIngredient.deleteMany({
      where: { recipeId: id }
    });

    // Create new ingredients
    const ingredientRows = input.ingredients.map(ing => ({
      recipeId: id,
      ingredientId: ing.ingredientId,
      gramsPerBase: Math.max(1, Math.min(5000, ing.gramsPerBase)) // Clamp between 1-5000
    }));

    await tx.recipeIngredient.createMany({
      data: ingredientRows
    });
  });

  revalidatePath('/dashboard/recipes');
  revalidatePath(`/dashboard/recipes/${id}`);
  redirect('/dashboard/recipes');
}

export async function deleteRecipe(id: string) {
  await prisma.$transaction(async (tx) => {
    // Delete recipe ingredients first
    await tx.recipeIngredient.deleteMany({
      where: { recipeId: id }
    });

    // Delete recipe
    await tx.recipe.delete({
      where: { id }
    });
  });

  revalidatePath('/dashboard/recipes');
}

export async function duplicateRecipe(id: string) {
  const originalRecipe = await getRecipe(id);
  
  const duplicatedInput = {
    title: `${originalRecipe.name} (copy)`,
    cuisine: originalRecipe.cuisine || '',
    difficulty: originalRecipe.difficulty || '',
    utensils: originalRecipe.utensils ? JSON.parse(originalRecipe.utensils) : [],
    baseServings: originalRecipe.baseServings,
    instructions: originalRecipe.instructions,
    ingredients: originalRecipe.ingredients.map(ri => ({
      ingredientId: ri.ingredientId,
      gramsPerBase: ri.gramsPerBase
    }))
  };

  await createRecipe(duplicatedInput);
}
