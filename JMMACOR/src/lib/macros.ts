/**
 * Macro calculation engine that mirrors calculator.net behavior
 */

// BMR Calculations
export function bmrMifflinStJeor({ sex, age, heightCm, weightKg }: {
  sex: string;
  age: number;
  heightCm: number;
  weightKg: number;
}): number {
  // Mifflin-St Jeor Equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex.toLowerCase() === 'male' ? base + 5 : base - 161;
}

export function bmrHarrisBenedict({ sex, age, heightCm, weightKg }: {
  sex: string;
  age: number;
  heightCm: number;
  weightKg: number;
}): number {
  // Revised Harris-Benedict Equation
  if (sex.toLowerCase() === 'male') {
    return 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
  }
}

export function bmrKatchMcArdle({ bodyFatPct, weightKg }: {
  bodyFatPct: number;
  weightKg: number;
}): number {
  // Katch-McArdle Equation (requires body fat percentage)
  const leanBodyMass = weightKg * (1 - bodyFatPct / 100);
  return 370 + (21.6 * leanBodyMass);
}

// Activity multipliers (stable mapping)
export function activityFactor(label: string): number {
  const mapping: Record<string, number> = {
    "Basal Metabolic Rate (BMR)": 1.0,
    "Sedentary: little or no exercise": 1.2,
    "Light: exercise 1-3 times/week": 1.375,
    "Moderate: exercise 4-5 times/week": 1.55,
    "Active: daily exercise or intense exercise 3-4 times/week": 1.725,
    "Very Active: intense exercise 6-7 times/week": 1.9,
    "Extra Active: very intense exercise daily, or physical job": 1.95,
  };
  
  return mapping[label] ?? 1.2; // Default to sedentary if not found
}

// Goal delta calories per day
export function goalDeltaKcal(label: string): number {
  const mapping: Record<string, number> = {
    "Maintain Weight": 0,
    "Mild weight loss of 0.25 kg per week": -250,
    "Weight loss of 0.5 kg per week": -500,
    "Extreme weight loss of 1 kg per week": -1000,
    "Mild weight gain of 0.25 kg per week": 250,
    "Weight gain of 0.5 kg per week": 500,
    "Extreme weight gain of 1 kg per week": 1000,
  };
  
  return mapping[label] ?? 0; // Default to maintain if not found
}

// TDEE calculation
export function tdee(bmr: number, activityLabel: string): number {
  return bmr * activityFactor(activityLabel);
}

// Target calories with clamping
export function targetCalories(tdee: number, goalLabel: string): number {
  const delta = goalDeltaKcal(goalLabel);
  const target = tdee + delta;
  
  // Clamp delta within ±1000 and round to nearest integer
  const clampedTarget = Math.max(tdee - 1000, Math.min(tdee + 1000, target));
  return Math.round(clampedTarget);
}

// Macro calculations from percentages
export function calcMacrosFromPercents({ kcal, pctCarb, pctProt, pctFat }: {
  kcal: number;
  pctCarb: number;
  pctProt: number;
  pctFat: number;
}): { protein: number; carbs: number; fat: number } {
  // Using 4 kcal/g for protein and carbs, 9 kcal/g for fat
  const proteinKcal = kcal * (pctProt / 100);
  const carbsKcal = kcal * (pctCarb / 100);
  const fatKcal = kcal * (pctFat / 100);
  
  return {
    protein: Math.round(proteinKcal / 4),
    carbs: Math.round(carbsKcal / 4),
    fat: Math.round(fatKcal / 9),
  };
}

// Scale custom grams to match target energy
export function scaleCustomGramsToEnergy({ kcalTarget, grams }: {
  kcalTarget: number;
  grams: { p: number; c: number; f: number };
}): { p: number; c: number; f: number } {
  const currentKcal = grams.p * 4 + grams.c * 4 + grams.f * 9;
  
  if (currentKcal === 0) {
    // If no grams, distribute evenly (balanced approach)
    const balanced = calcMacrosFromPercents({ kcal: kcalTarget, pctCarb: 50, pctProt: 25, pctFat: 25 });
    return { p: balanced.protein, c: balanced.carbs, f: balanced.fat };
  }
  
  const scaleFactor = kcalTarget / currentKcal;
  
  return {
    p: Math.round(grams.p * scaleFactor),
    c: Math.round(grams.c * scaleFactor),
    f: Math.round(grams.f * scaleFactor),
  };
}

// Preset profiles
export const presets = {
  balanced: { carbs: 50, protein: 25, fat: 25 },
  lowFat: { carbs: 60, protein: 25, fat: 15 },
  lowCarb: { carbs: 25, protein: 40, fat: 35 },
  highProtein: { carbs: 35, protein: 40, fat: 25 },
} as const;

// Helper functions
export function kcalToKJ(kcal: number): number {
  return kcal * 4.184;
}

export function round(n: number, dp: number = 0): number {
  const factor = Math.pow(10, dp);
  return Math.round(n * factor) / factor;
}

// Convert feet/inches to cm
export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return Math.round(totalInches * 2.54);
}

// Map old activity/goal labels to canonical ones
export function mapToCanonicalActivity(oldLabel: string): string {
  const mapping: Record<string, string> = {
    "BMR": "Basal Metabolic Rate (BMR)",
    "Sedentary": "Sedentary: little or no exercise",
    "Light": "Light: exercise 1-3 times/week",
    "Moderate": "Moderate: exercise 4-5 times/week",
    "Active": "Active: daily exercise or intense exercise 3-4 times/week",
    "Very Active": "Very Active: intense exercise 6-7 times/week",
    "Extra Active": "Extra Active: very intense exercise daily, or physical job",
  };
  
  return mapping[oldLabel] || oldLabel;
}

export function mapToCanonicalGoal(oldLabel: string): string {
  const mapping: Record<string, string> = {
    "Maintain": "Maintain Weight",
    "Mild loss": "Mild weight loss of 0.25 kg per week",
    "Loss": "Weight loss of 0.5 kg per week",
    "Extreme loss": "Extreme weight loss of 1 kg per week",
    "Mild gain": "Mild weight gain of 0.25 kg per week",
    "Gain": "Weight gain of 0.5 kg per week",
    "Extreme gain": "Extreme weight gain of 1 kg per week",
  };
  
  return mapping[oldLabel] || oldLabel;
}
