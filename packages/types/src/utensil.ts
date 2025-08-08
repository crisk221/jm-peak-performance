import { z } from "zod";

// Base Utensil schema matching Prisma model
export const UtensilSchema = z.object({
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

// Create schema - required fields for utensil creation
export const UtensilCreateSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

// Update schema - partial create with id required
export const UtensilUpdateSchema = UtensilCreateSchema.partial().extend({
  id: z.string().cuid(),
});

// Inferred types
export type Utensil = z.infer<typeof UtensilSchema>;
export type UtensilCreate = z.infer<typeof UtensilCreateSchema>;
export type UtensilUpdate = z.infer<typeof UtensilUpdateSchema>;
