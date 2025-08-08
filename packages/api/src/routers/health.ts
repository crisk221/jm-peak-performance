import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "../trpc";

/**
 * Health router - simple health check endpoint
 */
export const healthRouter = createTRPCRouter({
  /**
   * Basic health check
   */
  check: publicProcedure
    .output(
      z.object({
        status: z.literal("ok"),
        timestamp: z.string(),
        version: z.string(),
      }),
    )
    .query(() => {
      return {
        status: "ok" as const,
        timestamp: new Date().toISOString(),
        version: "0.0.1",
      };
    }),

  /**
   * Database health check
   */
  database: publicProcedure
    .output(
      z.object({
        status: z.enum(["ok", "error"]),
        latency: z.number().optional(),
        error: z.string().optional(),
      }),
    )
    .query(async ({ ctx }) => {
      try {
        const start = Date.now();
        await ctx.prisma.$queryRaw`SELECT 1`;
        const latency = Date.now() - start;

        return {
          status: "ok" as const,
          latency,
        };
      } catch (error) {
        return {
          status: "error" as const,
          error:
            error instanceof Error ? error.message : "Unknown database error",
        };
      }
    }),
});
