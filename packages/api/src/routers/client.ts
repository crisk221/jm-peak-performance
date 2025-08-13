import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import {
  ClientSchema,
  ClientCreateInputSchema,
  ClientUpdateInputSchema,
  ClientListInputSchema,
} from "@jmpp/types";

/**
 * Client router - client management operations for coaches
 */
export const clientRouter = createTRPCRouter({
  /**
   * Get all clients for the current coach with optional search
   */
  list: protectedProcedure
    .input(ClientListInputSchema)
    .output(z.array(ClientSchema))
    .query(async ({ ctx, input }) => {
      const coachId = ctx.session.user.id;

      const where = {
        coachId,
        ...(input.search && {
          name: {
            contains: input.search,
            mode: "insensitive" as const,
          },
        }),
      };

      return await ctx.prisma.client.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: input.limit,
        ...(input.cursor && {
          skip: 1,
          cursor: { id: input.cursor },
        }),
      });
    }),

  /**
   * Get a specific client by ID with full details
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(ClientSchema)
    .query(async ({ ctx, input }) => {
      const coachId = ctx.session.user.id;

      const client = await ctx.prisma.client.findFirst({
        where: {
          id: input.id,
          coachId, // Ensure coach can only access their own clients
        },
      });

      if (!client) {
        throw new Error("Client not found");
      }

      return client;
    }),

  /**
   * Create a new client
   */
  create: protectedProcedure
    .input(ClientCreateInputSchema)
    .output(ClientSchema)
    .mutation(async ({ ctx, input }) => {
      const coachId = ctx.session.user.id;

      return await ctx.prisma.client.create({
        data: {
          ...input,
          coachId,
        },
      });
    }),

  /**
   * Update an existing client
   */
  update: protectedProcedure
    .input(ClientUpdateInputSchema)
    .output(ClientSchema)
    .mutation(async ({ ctx, input }) => {
      const coachId = ctx.session.user.id;
      const { id, ...data } = input;

      // First verify the client belongs to this coach
      const existingClient = await ctx.prisma.client.findFirst({
        where: {
          id,
          coachId,
        },
      });

      if (!existingClient) {
        throw new Error("Client not found");
      }

      return await ctx.prisma.client.update({
        where: { id },
        data,
      });
    }),

  /**
   * Delete a client
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const coachId = ctx.session.user.id;

      // First verify the client belongs to this coach
      const existingClient = await ctx.prisma.client.findFirst({
        where: {
          id: input.id,
          coachId,
        },
      });

      if (!existingClient) {
        throw new Error("Client not found");
      }

      await ctx.prisma.client.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
