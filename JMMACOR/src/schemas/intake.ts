import { z } from "zod";

export const intakeSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(80, "Name must be less than 80 characters"),
  gender: z.enum(["male", "female", "other"]),
  age: z.number().int().min(10, "Age must be at least 10").max(100, "Age must be less than 100"),
  heightCm: z.number().int().min(100, "Height must be at least 100cm").max(250, "Height must be less than 250cm"),
  weightKg: z.number().min(30, "Weight must be at least 30kg").max(300, "Weight must be less than 300kg"),
  activity: z.string().min(1, "Please select an activity level"),
  goal: z.string().min(1, "Please select a goal"),
  allergies: z.array(z.string().min(1)).max(30, "Too many allergies").default([]),
  cuisines: z.array(z.string().min(1)).max(30, "Too many cuisine preferences").default([]),
  dislikes: z.array(z.string().min(1)).max(50, "Too many dislikes").default([]),
  includeMeals: z.array(z.enum(["Breakfast", "Lunch", "Dinner", "Snacks", "Shakes"]))
    .min(1, "Select at least one meal"),
});

export type IntakeForm = z.infer<typeof intakeSchema>;
