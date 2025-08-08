import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { UserSchema } from "@jmpp/types";

/**
 * User router - user-related operations
 */
export const userRouter = createTRPCRouter({
  /**
   * Get current user profile
   */
  me: protectedProcedure
    .output(
      UserSchema.pick({
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }),
    )
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    }),

  /**
   * Get user statistics
   */
  stats: protectedProcedure
    .output(
      z.object({
        totalClients: z.number(),
        totalRecipes: z.number(),
        totalMealPlans: z.number(),
      }),
    )
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      const [totalClients, totalRecipes, totalMealPlans] = await Promise.all([
        ctx.prisma.client.count({
          where: { coachId: userId },
        }),
        ctx.prisma.recipe.count({
          where: { authorId: userId },
        }),
        ctx.prisma.mealPlan.count({
          where: { coachId: userId },
        }),
      ]);

      return {
        totalClients,
        totalRecipes,
        totalMealPlans,
      };
    }),
});
