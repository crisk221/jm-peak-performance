import type { ActivityLevel, Goal } from "@/lib/constants";

export interface ClientDraft {
  fullName: string;
  gender: string;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  activity: string;
  goal: string;
  allergies: string[];
  cuisines: string[];
  dislikes: string[];
  includeMeals: string[];
}

export interface PlanDraft {
  kcalTarget?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  splitType?: "balanced" | "lowFat" | "lowCarb" | "highProtein" | "custom";
  custom?: {
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
}

export interface WizardState {
  clientId?: string;
  clientDraft: ClientDraft;
  planDraft: PlanDraft;
}

export interface HydratedClient {
  id: string;
  fullName: string;
  gender: string;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: string;
  goal: string;
  allergies: string[];
  cuisines: string[];
  dislikes: string[];
  includeMeals: string[];
  createdAt: Date;
  updatedAt: Date;
}
