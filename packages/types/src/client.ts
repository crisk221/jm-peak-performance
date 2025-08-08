import { z } from "zod";
import { Sex, Goal } from "@prisma/client";

// Base Client schema matching Prisma model
export const ClientSchema = z.object({
  id: z.string().cuid(),
  coachId: z.string().cuid(),
  name: z.string().min(1).max(255),
  sex: z.nativeEnum(Sex),
  age: z.number().int().min(1).max(150),
  heightCm: z.number().int().min(50).max(300),
  weightKg: z.number().nonnegative().max(1000),
  activityLevel: z.string().min(1).max(100),
  goal: z.nativeEnum(Goal),
  kcalTarget: z.number().int().nonnegative().max(10000),
  proteinTarget: z.number().int().nonnegative().max(1000),
  carbsTarget: z.number().int().nonnegative().max(2000),
  fatTarget: z.number().int().nonnegative().max(1000),
  preferences: z.object({
    dietaryRestrictions: z.array(z.string()),
    allergies: z.array(z.string()),
    dislikedIngredients: z.array(z.string()),
    cuisines: z.array(z.string()),
    hardware: z.array(z.string()),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create schema - required fields for client creation
export const ClientCreateSchema = z.object({
  coachId: z.string().cuid(),
  name: z.string().min(1).max(255),
  sex: z.nativeEnum(Sex),
  age: z.number().int().min(1).max(150),
  heightCm: z.number().int().min(50).max(300),
  weightKg: z.number().nonnegative().max(1000),
  activityLevel: z.string().min(1).max(100),
  goal: z.nativeEnum(Goal),
  kcalTarget: z.number().int().nonnegative().max(10000),
  proteinTarget: z.number().int().nonnegative().max(1000),
  carbsTarget: z.number().int().nonnegative().max(2000),
  fatTarget: z.number().int().nonnegative().max(1000),
  preferences: z.object({
    dietaryRestrictions: z.array(z.string()),
    allergies: z.array(z.string()),
    dislikedIngredients: z.array(z.string()),
    cuisines: z.array(z.string()),
    hardware: z.array(z.string()),
  }),
});

// Update schema - partial create with id required
export const ClientUpdateSchema = ClientCreateSchema.partial().extend({
  id: z.string().cuid(),
});

// Inferred types
export type Client = z.infer<typeof ClientSchema>;
export type ClientCreate = z.infer<typeof ClientCreateSchema>;
export type ClientUpdate = z.infer<typeof ClientUpdateSchema>;
