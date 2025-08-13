import { z } from "zod";

// Define enums directly to avoid dependency on generated client
export const SexEnum = z.enum(["MALE", "FEMALE", "OTHER"]);
export const GoalEnum = z.enum(["CUT", "MAINTAIN", "BULK"]);
export const ActivityLevelEnum = z.enum([
  "SEDENTARY",
  "LIGHTLY_ACTIVE", 
  "MODERATELY_ACTIVE",
  "VERY_ACTIVE",
  "EXTRA_ACTIVE"
]);

// Client preferences schema
export const ClientPreferencesSchema = z.object({
  dietaryRestrictions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  disliked: z.array(z.string()).default([]),
  cuisines: z.array(z.string()).default([]),
  hardware: z.array(z.string()).default([]),
});

// Base Client schema matching Prisma model
export const ClientSchema = z.object({
  id: z.string().cuid(),
  coachId: z.string().cuid(),
  name: z.string().min(1).max(255),
  sex: SexEnum,
  age: z.number().int().min(1).max(150),
  heightCm: z.number().int().min(50).max(300),
  weightKg: z.number().nonnegative().max(1000),
  activityLevel: ActivityLevelEnum,
  goal: GoalEnum,
  kcalTarget: z.number().int().nonnegative().max(10000),
  proteinTarget: z.number().int().nonnegative().max(1000),
  carbsTarget: z.number().int().nonnegative().max(2000),
  fatTarget: z.number().int().nonnegative().max(1000),
  preferences: ClientPreferencesSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create schema - required fields for client creation
export const ClientCreateInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  sex: SexEnum,
  age: z.number().int().min(1, "Age must be at least 1").max(150, "Age must be less than 150"),
  heightCm: z.number().int().min(50, "Height must be at least 50cm").max(300, "Height must be less than 300cm"),
  weightKg: z.number().nonnegative().max(1000, "Weight must be less than 1000kg"),
  activityLevel: ActivityLevelEnum,
  goal: GoalEnum,
  kcalTarget: z.number().int().nonnegative().max(10000, "Calories must be less than 10,000"),
  proteinTarget: z.number().int().nonnegative().max(1000, "Protein must be less than 1000g"),
  carbsTarget: z.number().int().nonnegative().max(2000, "Carbs must be less than 2000g"),
  fatTarget: z.number().int().nonnegative().max(1000, "Fat must be less than 1000g"),
  preferences: ClientPreferencesSchema.default({
    dietaryRestrictions: [],
    allergies: [],
    disliked: [],
    cuisines: [],
    hardware: [],
  }),
});

// Update schema - partial create with id required
export const ClientUpdateInputSchema = ClientCreateInputSchema.partial().extend({
  id: z.string().cuid(),
});

// Search schema
export const ClientListInputSchema = z.object({
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

// Inferred types
export type Client = z.infer<typeof ClientSchema>;
export type ClientCreateInput = z.infer<typeof ClientCreateInputSchema>;
export type ClientUpdateInput = z.infer<typeof ClientUpdateInputSchema>;
export type ClientListInput = z.infer<typeof ClientListInputSchema>;
export type ClientPreferences = z.infer<typeof ClientPreferencesSchema>;
