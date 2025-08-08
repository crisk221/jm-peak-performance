import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import {
  ClientSchema,
  ClientCreateSchema,
  ClientUpdateSchema,
} from "@jmpp/types";

/**
 * Client router - client management operations for coaches
 */
export const clientRouter = createTRPCRouter({
  /**
   * Get all clients for the current coach
   */
  list: protectedProcedure
    .output(z.array(ClientSchema))
    .query(async ({ ctx }) => {
      const coachId = ctx.session.user.id;

      return await ctx.prisma.client.findMany({
        where: { coachId },
        orderBy: { createdAt: "desc" },
      });
    }),

  /**
   * Get a specific client by ID
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
    .input(ClientCreateSchema)
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
    .input(
      z.object({
        id: z.string(),
        data: ClientUpdateSchema,
      }),
    )
    .output(ClientSchema)
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

      return await ctx.prisma.client.update({
        where: { id: input.id },
        data: input.data,
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
