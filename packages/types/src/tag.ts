import { z } from "zod";

// Base Tag schema matching Prisma model
export const TagSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create schema - required fields for tag creation
export const TagCreateSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

// Update schema - partial create with id required
export const TagUpdateSchema = TagCreateSchema.partial().extend({
  id: z.string().cuid(),
});

// Inferred types
export type Tag = z.infer<typeof TagSchema>;
export type TagCreate = z.infer<typeof TagCreateSchema>;
export type TagUpdate = z.infer<typeof TagUpdateSchema>;
