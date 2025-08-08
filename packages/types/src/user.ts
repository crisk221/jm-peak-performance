import { z } from "zod";

// Define UserRole enum locally to avoid Prisma client dependency issues
export enum UserRole {
  COACH = "COACH",
  ADMIN = "ADMIN",
}

// Base User schema matching Prisma model
export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email().max(255),
  name: z.string().min(1).max(255),
  passwordHash: z.string().min(1),
  role: z.nativeEnum(UserRole),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create schema - required fields for user creation
export const UserCreateSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(255),
  password: z.string().min(8).max(100), // Plain password for forms
  role: z.nativeEnum(UserRole).optional().default(UserRole.COACH),
});

// Sign-in schema
export const UserSignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Update schema - partial create with id required
export const UserUpdateSchema = UserCreateSchema.partial().extend({
  id: z.string().cuid(),
});

// Inferred types
export type User = z.infer<typeof UserSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserSignIn = z.infer<typeof UserSignInSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
