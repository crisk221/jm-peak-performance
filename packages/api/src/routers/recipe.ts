import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { RecipeSchema, RecipeCreateSchema } from "@jmpp/types";

/**
 * Recipe router - recipe management operations
 */
export const recipeRouter = createTRPCRouter({
  /**
   * Get paginated recipes for the current coach
   */
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().min(1).optional().default(1),
        pageSize: z.number().min(1).max(100).optional().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { search, page, pageSize } = input;
      const skip = (page - 1) * pageSize;

      const where = {
        authorId: userId,
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const [recipes, total] = await Promise.all([
        ctx.prisma.recipe.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            mealType: true,
            difficulty: true,
            servings: true,
            timeMinutes: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        ctx.prisma.recipe.count({ where }),
      ]);

      return {
        recipes,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  /**
   * Get a specific recipe by ID with full details
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const recipe = await ctx.prisma.recipe.findFirst({
        where: {
          id: input.id,
          authorId: userId, // Ensure user can only access their own recipes
        },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
            orderBy: { createdAt: "asc" },
          },
          utensils: {
            include: {
              utensil: true,
            },
            orderBy: { utensil: { name: "asc" } },
          },
          tags: {
            include: {
              tag: true,
            },
            orderBy: { tag: { name: "asc" } },
          },
        },
      });

      if (!recipe) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recipe not found",
        });
      }

      return recipe;
    }),

  /**
   * Create a new recipe with ingredients, utensils, and tags
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().max(1000).optional(),
        instructions: z.string().min(1),
        servings: z.number().int().min(1).max(100),
        timeMinutes: z.number().int().min(1).max(1440),
        mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
        ingredients: z
          .array(
            z.object({
              ingredientId: z.string().cuid(),
              quantity: z.number().nonnegative(),
              unit: z.enum([
                "GRAMS",
                "KILOGRAMS",
                "MILLILITERS",
                "LITERS",
                "CUPS",
                "TABLESPOONS",
                "TEASPOONS",
                "PIECES",
              ]),
              note: z.string().max(255).optional(),
            }),
          )
          .optional()
          .default([]),
        utensilIds: z.array(z.string().cuid()).optional().default([]),
        tagIds: z.array(z.string().cuid()).optional().default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { ingredients, utensilIds, tagIds, ...recipeData } = input;

      // Generate slug from title
      const slug = recipeData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      return await ctx.prisma.recipe.create({
        data: {
          ...recipeData,
          slug,
          authorId: userId,
          ingredients: {
            create: ingredients.map((ingredient) => ({
              ingredientId: ingredient.ingredientId,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              note: ingredient.note,
            })),
          },
          utensils: {
            create: utensilIds.map((utensilId) => ({
              utensilId,
            })),
          },
          tags: {
            create: tagIds.map((tagId) => ({
              tagId,
            })),
          },
        },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
          utensils: {
            include: {
              utensil: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    }),

  /**
   * Update an existing recipe
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().max(1000).optional(),
        instructions: z.string().min(1).optional(),
        servings: z.number().int().min(1).max(100).optional(),
        timeMinutes: z.number().int().min(1).max(1440).optional(),
        mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]).optional(),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
        ingredients: z
          .array(
            z.object({
              ingredientId: z.string().cuid(),
              quantity: z.number().nonnegative(),
              unit: z.enum([
                "GRAMS",
                "KILOGRAMS",
                "MILLILITERS",
                "LITERS",
                "CUPS",
                "TABLESPOONS",
                "TEASPOONS",
                "PIECES",
              ]),
              note: z.string().max(255).optional(),
            }),
          )
          .optional(),
        utensilIds: z.array(z.string().cuid()).optional(),
        tagIds: z.array(z.string().cuid()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ingredients, utensilIds, tagIds, ...updateData } = input;

      // First verify the recipe belongs to this user
      const existingRecipe = await ctx.prisma.recipe.findFirst({
        where: {
          id,
          authorId: userId,
        },
      });

      if (!existingRecipe) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recipe not found",
        });
      }

      // Generate new slug if title is being updated
      const slug = updateData.title
        ? updateData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
        : undefined;

      return await ctx.prisma.$transaction(async (tx: typeof ctx.prisma) => {
        // Update the recipe
        const recipe = await tx.recipe.update({
          where: { id },
          data: {
            ...updateData,
            ...(slug && { slug }),
          },
        });

        // Update ingredients if provided
        if (ingredients !== undefined) {
          await tx.recipeIngredient.deleteMany({
            where: { recipeId: id },
          });
          await tx.recipeIngredient.createMany({
            data: ingredients.map((ingredient) => ({
              recipeId: id,
              ingredientId: ingredient.ingredientId,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              note: ingredient.note,
            })),
          });
        }

        // Update utensils if provided
        if (utensilIds !== undefined) {
          await tx.recipeUtensil.deleteMany({
            where: { recipeId: id },
          });
          await tx.recipeUtensil.createMany({
            data: utensilIds.map((utensilId) => ({
              recipeId: id,
              utensilId,
            })),
          });
        }

        // Update tags if provided
        if (tagIds !== undefined) {
          await tx.recipeTag.deleteMany({
            where: { recipeId: id },
          });
          await tx.recipeTag.createMany({
            data: tagIds.map((tagId) => ({
              recipeId: id,
              tagId,
            })),
          });
        }

        // Return updated recipe with relations
        return await tx.recipe.findUniqueOrThrow({
          where: { id },
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
            utensils: {
              include: {
                utensil: true,
              },
            },
            tags: {
              include: {
                tag: true,
              },
            },
          },
        });
      });
    }),

  /**
   * Delete a recipe
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // First verify the recipe belongs to this user
      const existingRecipe = await ctx.prisma.recipe.findFirst({
        where: {
          id: input.id,
          authorId: userId,
        },
      });

      if (!existingRecipe) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recipe not found",
        });
      }

      await ctx.prisma.recipe.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Helper endpoints for form data
  ingredients: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.ingredient.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        unitBase: true,
      },
    });
  }),

  utensils: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.utensil.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });
  }),

  tags: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });
  }),
});
