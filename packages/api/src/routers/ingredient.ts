import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";

/**
 * Ingredient router - ingredient search and listing operations
 */
export const ingredientRouter = createTRPCRouter({
  /**
   * List ingredients with optional search
   */
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).optional().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, limit } = input;

      const where = search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                category: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                aliases: {
                  array_contains: [search],
                },
              },
            ],
          }
        : {};

      return await ctx.prisma.ingredient.findMany({
        where,
        select: {
          id: true,
          name: true,
          unitBase: true,
          category: true,
        },
        orderBy: {
          name: "asc",
        },
        take: limit,
      });
    }),
});
