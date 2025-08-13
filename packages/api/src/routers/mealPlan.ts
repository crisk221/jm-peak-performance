import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@jmpp/db";
import {
  MealPlanGenerateInputSchema,
  MealPlanSaveInputSchema,
  MealPlanListInputSchema,
  MealPlanGetByIdInputSchema,
  MealPlanDeleteInputSchema,
  type MealPlanDraft,
  type MealPlanDay,
} from "@jmpp/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const mealPlanRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(MealPlanGenerateInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { clientId, days, mealsPerDay, tolerancePct } = input;
      const coachId = ctx.session.user.id;

      // Get client with preferences and macro targets
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          coachId,
        },
      });

      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      // Get available recipes that match client preferences
      const recipes = await prisma.recipe.findMany({
        where: {
          authorId: coachId,
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          utensils: {
            include: {
              utensil: true,
            },
          },
        },
      });

      // Filter recipes based on client preferences
      const filteredRecipes = recipes.filter((recipe: any) => {
        // Check dietary restrictions (recipe tags should not contain restricted items)
        if (client.preferences.dietaryRestrictions.length > 0) {
          const recipeTags = recipe.tags.map((rt: any) => rt.tag.name.toLowerCase());
          const hasRestrictedTag = client.preferences.dietaryRestrictions.some((restriction: string) =>
            recipeTags.some((tag: string) => tag.includes(restriction.toLowerCase()))
          );
          if (hasRestrictedTag) return false;
        }

        // Check allergies (similar to dietary restrictions)
        if (client.preferences.allergies.length > 0) {
          const recipeTags = recipe.tags.map((rt: any) => rt.tag.name.toLowerCase());
          const hasAllergen = client.preferences.allergies.some((allergy: string) =>
            recipeTags.some((tag: string) => tag.includes(allergy.toLowerCase())) ||
            recipe.title.toLowerCase().includes(allergy.toLowerCase())
          );
          if (hasAllergen) return false;
        }

        // Check disliked foods (check recipe title and tags)
        if (client.preferences.disliked.length > 0) {
          const recipeTags = recipe.tags.map((rt: any) => rt.tag.name.toLowerCase());
          const hasDisliked = client.preferences.disliked.some((disliked: string) =>
            recipe.title.toLowerCase().includes(disliked.toLowerCase()) ||
            recipeTags.some((tag: string) => tag.includes(disliked.toLowerCase()))
          );
          if (hasDisliked) return false;
        }

        // Check hardware availability (recipe utensils should be subset of available hardware)
        if (client.preferences.hardware.length > 0) {
          const recipeUtensils = recipe.utensils.map((ru: any) => ru.utensil.name.toLowerCase());
          const availableHardware = client.preferences.hardware.map((hw: string) => hw.toLowerCase());
          const hasRequiredHardware = recipeUtensils.every((utensil: string) =>
            availableHardware.some((hw: string) => hw.includes(utensil) || utensil.includes(hw))
          );
          if (!hasRequiredHardware) return false;
        }

        return true;
      });

      if (filteredRecipes.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No suitable recipes found for this client's preferences",
        });
      }

      // Generate meal plan draft
      const targetMacros = {
        kcal: client.kcalTarget,
        protein: client.proteinTarget,
        carbs: client.carbsTarget,
        fat: client.fatTarget,
      };

      const planDays: MealPlanDay[] = [];
      let lastUsedRecipeId: string | null = null;

      for (let day = 0; day < days; day++) {
        const dayItems: MealPlanDay['items'] = [];

        for (let meal = 0; meal < mealsPerDay; meal++) {
          // Pick a recipe, preferring ones not used in the previous meal
          const availableRecipes = filteredRecipes.filter((r: any) => r.id !== lastUsedRecipeId);
          const selectedRecipes = availableRecipes.length > 0 ? availableRecipes : filteredRecipes;
          const randomRecipe = selectedRecipes[Math.floor(Math.random() * selectedRecipes.length)];

          dayItems.push({
            recipeId: randomRecipe.id,
            recipe: {
              id: randomRecipe.id,
              title: randomRecipe.title,
              kcalPerServing: randomRecipe.kcalPerServing,
              proteinPerServing: randomRecipe.proteinPerServing,
              carbsPerServing: randomRecipe.carbsPerServing,
              fatPerServing: randomRecipe.fatPerServing,
            },
            servings: 1.0, // Start with 1 serving
          });

          lastUsedRecipeId = randomRecipe.id;
        }

        // Calculate initial totals for the day
        const initialTotals = dayItems.reduce(
          (acc, item) => ({
            kcal: acc.kcal + (item.recipe?.kcalPerServing || 0) * item.servings,
            protein: acc.protein + (item.recipe?.proteinPerServing || 0) * item.servings,
            carbs: acc.carbs + (item.recipe?.carbsPerServing || 0) * item.servings,
            fat: acc.fat + (item.recipe?.fatPerServing || 0) * item.servings,
          }),
          { kcal: 0, protein: 0, carbs: 0, fat: 0 }
        );

        // Optimize servings to get closer to target macros
        const optimizedItems = optimizeServings(dayItems, targetMacros, tolerancePct);

        // Recalculate totals after optimization
        const finalTotals = optimizedItems.reduce(
          (acc, item) => ({
            kcal: acc.kcal + (item.recipe?.kcalPerServing || 0) * item.servings,
            protein: acc.protein + (item.recipe?.proteinPerServing || 0) * item.servings,
            carbs: acc.carbs + (item.recipe?.carbsPerServing || 0) * item.servings,
            fat: acc.fat + (item.recipe?.fatPerServing || 0) * item.servings,
          }),
          { kcal: 0, protein: 0, carbs: 0, fat: 0 }
        );

        planDays.push({
          totalMacros: finalTotals,
          items: optimizedItems,
        });
      }

      const draft: MealPlanDraft = {
        days: planDays,
        targetMacros,
        tolerancePct,
      };

      return draft;
    }),

  save: protectedProcedure
    .input(MealPlanSaveInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { clientId, startDate, daysDraft } = input;
      const coachId = ctx.session.user.id;

      // Verify client belongs to coach
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          coachId,
        },
      });

      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      // Calculate overall plan macros (average per day)
      const totalMacros = daysDraft.reduce(
        (acc, day) => ({
          kcal: acc.kcal + day.totalMacros.kcal,
          protein: acc.protein + day.totalMacros.protein,
          carbs: acc.carbs + day.totalMacros.carbs,
          fat: acc.fat + day.totalMacros.fat,
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0 }
      );

      const avgMacros = {
        kcal: Math.round(totalMacros.kcal / daysDraft.length),
        protein: Math.round(totalMacros.protein / daysDraft.length),
        carbs: Math.round(totalMacros.carbs / daysDraft.length),
        fat: Math.round(totalMacros.fat / daysDraft.length),
      };

      // Create meal plan and items in a transaction
      const mealPlan = await prisma.$transaction(async (tx: any) => {
        const plan = await tx.mealPlan.create({
          data: {
            clientId,
            coachId,
            startDate: new Date(startDate),
            days: daysDraft.length,
            kcal: avgMacros.kcal,
            protein: avgMacros.protein,
            carbs: avgMacros.carbs,
            fat: avgMacros.fat,
          },
        });

        // Create meal plan items
        const items = [];
        for (let dayIndex = 0; dayIndex < daysDraft.length; dayIndex++) {
          const day = daysDraft[dayIndex];
          for (let mealIndex = 0; mealIndex < day.items.length; mealIndex++) {
            const item = day.items[mealIndex];
            items.push({
              mealPlanId: plan.id,
              dayNumber: dayIndex + 1,
              mealNumber: mealIndex + 1,
              recipeId: item.recipeId,
              servings: item.servings,
            });
          }
        }

        await tx.mealPlanItem.createMany({
          data: items,
        });

        return plan;
      });

      return mealPlan;
    }),

  list: protectedProcedure
    .input(MealPlanListInputSchema)
    .query(async ({ input, ctx }) => {
      const { search } = input;
      const coachId = ctx.session.user.id;

      const mealPlans = await prisma.mealPlan.findMany({
        where: {
          coachId,
          ...(search && {
            client: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          }),
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return mealPlans;
    }),

  getById: protectedProcedure
    .input(MealPlanGetByIdInputSchema)
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const coachId = ctx.session.user.id;

      const mealPlan = await prisma.mealPlan.findFirst({
        where: {
          id,
          coachId,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              kcalTarget: true,
              proteinTarget: true,
              carbsTarget: true,
              fatTarget: true,
            },
          },
          items: {
            include: {
              recipe: {
                select: {
                  id: true,
                  title: true,
                  kcalPerServing: true,
                  proteinPerServing: true,
                  carbsPerServing: true,
                  fatPerServing: true,
                },
              },
            },
            orderBy: [
              { dayNumber: "asc" },
              { mealNumber: "asc" },
            ],
          },
        },
      });

      if (!mealPlan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meal plan not found",
        });
      }

      return mealPlan;
    }),

  delete: protectedProcedure
    .input(MealPlanDeleteInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const coachId = ctx.session.user.id;

      const mealPlan = await prisma.mealPlan.findFirst({
        where: {
          id,
          coachId,
        },
      });

      if (!mealPlan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meal plan not found",
        });
      }

      await prisma.mealPlan.delete({
        where: { id },
      });

      return { success: true };
    }),
});

// Simple greedy optimization function
function optimizeServings(
  items: MealPlanDay['items'],
  targetMacros: { kcal: number; protein: number; carbs: number; fat: number },
  tolerancePct: number
): MealPlanDay['items'] {
  const optimizedItems = [...items];
  const maxIterations = 50; // Prevent infinite loops
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const currentTotals = optimizedItems.reduce(
      (acc, item) => ({
        kcal: acc.kcal + (item.recipe?.kcalPerServing || 0) * item.servings,
        protein: acc.protein + (item.recipe?.proteinPerServing || 0) * item.servings,
        carbs: acc.carbs + (item.recipe?.carbsPerServing || 0) * item.servings,
        fat: acc.fat + (item.recipe?.fatPerServing || 0) * item.servings,
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Check if we're within tolerance
    const kcalDiff = Math.abs(currentTotals.kcal - targetMacros.kcal) / targetMacros.kcal;
    const proteinDiff = Math.abs(currentTotals.protein - targetMacros.protein) / targetMacros.protein;
    const carbsDiff = Math.abs(currentTotals.carbs - targetMacros.carbs) / targetMacros.carbs;
    const fatDiff = Math.abs(currentTotals.fat - targetMacros.fat) / targetMacros.fat;
    
    const toleranceDecimal = tolerancePct / 100;
    if (kcalDiff <= toleranceDecimal && proteinDiff <= toleranceDecimal && 
        carbsDiff <= toleranceDecimal && fatDiff <= toleranceDecimal) {
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
