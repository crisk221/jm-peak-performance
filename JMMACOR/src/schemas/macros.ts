import { z } from "zod";

export const macrosInputSchema = z.object({
  sex: z.enum(["male", "female"]),          // for now
  age: z.number().int().min(10).max(100),
  heightCm: z.number().int().min(100).max(250),
  weightKg: z.number().min(30).max(300),
  activity: z.string().min(1),
  goal: z.string().min(1),
  formula: z.enum(["mifflin", "harris", "katch"]).default("mifflin"),
  showKJ: z.boolean().default(false),
});

export type MacrosInput = z.infer<typeof macrosInputSchema>;

export const customMacrosSchema = z.object({
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(800),
  fat: z.number().min(0).max(300),
});

export type CustomMacros = z.infer<typeof customMacrosSchema>;
