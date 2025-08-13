export const ACTIVITY_LEVELS = [
  "Basal Metabolic Rate (BMR)",
  "Sedentary: little or no exercise",
  "Light: exercise 1-3 times/week",
  "Moderate: exercise 4-5 times/week",
  "Active: daily exercise or intense exercise 3-4 times/week",
  "Very Active: intense exercise 6-7 times/week",
  "Extra Active: very intense exercise daily, or physical job",
] as const;

export const GOALS = [
  "Maintain Weight",
  "Mild weight loss of 0.25 kg per week",
  "Weight loss of 0.5 kg per week",
  "Extreme weight loss of 1 kg per week",
  "Mild weight gain of 0.25 kg per week",
  "Weight gain of 0.5 kg per week",
  "Extreme weight gain of 1 kg per week",
] as const;

export const MEAL_SLOTS = ["Breakfast", "Lunch", "Dinner", "Snacks", "Shakes"] as const;

export type ActivityLevel = typeof ACTIVITY_LEVELS[number];
export type Goal = typeof GOALS[number];
export type MealSlot = typeof MEAL_SLOTS[number];
