'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { ingredientSchema, type IngredientFormData } from '@/schemas/ingredient';

const prisma = new PrismaClient();

export interface IngredientInput {
  name: string;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  allergens: string[];
}

export async function listIngredients(searchTerm?: string, page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;
  
  const where = searchTerm
    ? {
        name: {
          contains: searchTerm,
        },
      }
    : {};

  const [ingredients, total] = await Promise.all([
    prisma.ingredient.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: offset,
      take: limit,
    }),
    prisma.ingredient.count({ where }),
  ]);

  // Parse allergens from JSON strings
  const parsedIngredients = ingredients.map(ingredient => ({
    ...ingredient,
    allergens: ingredient.allergens ? JSON.parse(ingredient.allergens) : [],
  }));

  return {
    ingredients: parsedIngredients,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getIngredient(id: string) {
  const ingredient = await prisma.ingredient.findUnique({
    where: { id },
  });

  if (!ingredient) {
    throw new Error('Ingredient not found');
  }

  return {
    ...ingredient,
    allergens: ingredient.allergens ? JSON.parse(ingredient.allergens) : [],
  };
}

export async function createIngredient(data: IngredientFormData) {
  const validatedData = ingredientSchema.parse(data);

  // Check for duplicate name (case insensitive)
  const existingIngredient = await prisma.ingredient.findFirst({
    where: {
      name: {
        equals: validatedData.name,
      },
    },
  });

  if (existingIngredient) {
    throw new Error('An ingredient with this name already exists');
  }

  const ingredient = await prisma.ingredient.create({
    data: {
      ...validatedData,
      allergens: JSON.stringify(validatedData.allergens),
    },
  });

  revalidatePath('/dashboard/ingredients');
  return {
    ...ingredient,
    allergens: validatedData.allergens,
  };
}

export async function updateIngredient(id: string, data: IngredientFormData) {
  const validatedData = ingredientSchema.parse(data);

  // Check for duplicate name (case insensitive), excluding current ingredient
  const existingIngredient = await prisma.ingredient.findFirst({
    where: {
      name: {
        equals: validatedData.name,
      },
      id: {
        not: id,
      },
    },
  });

  if (existingIngredient) {
    throw new Error('An ingredient with this name already exists');
  }

  const ingredient = await prisma.ingredient.update({
    where: { id },
    data: {
      ...validatedData,
      allergens: JSON.stringify(validatedData.allergens),
    },
  });

  revalidatePath('/dashboard/ingredients');
  revalidatePath(`/dashboard/ingredients/${id}`);
  return {
    ...ingredient,
    allergens: validatedData.allergens,
  };
}

export async function deleteIngredient(id: string) {
  // Check if ingredient is referenced in any recipes
  const recipeCount = await prisma.recipeIngredient.count({
    where: { ingredientId: id },
  });

  if (recipeCount > 0) {
    throw new Error(`Cannot delete ingredient as it is used in ${recipeCount} recipe(s)`);
  }

  await prisma.ingredient.delete({
    where: { id },
  });

  revalidatePath('/dashboard/ingredients');
}

// Alias for recipe components
export const searchIngredients = listIngredients;
