// Example usage of @jmpp/types schemas

import {
  RecipeCreateSchema,
  UserCreateSchema,
  ClientCreateSchema,
  IngredientCreateSchema,
  MealPlanCreateSchema,
  type RecipeCreate,
  type UserCreate,
  type ClientCreate,
  UserRole,
  Sex,
  Goal,
  MealType,
  Difficulty,
  UnitBase,
} from "@jmpp/types";

// Example 1: Creating a new user
const userInput = {
  email: "coach@example.com",
  name: "John Coach",
  passwordHash: "hashed_password_here",
  role: UserRole.COACH,
};

try {
  const validatedUser: UserCreate = UserCreateSchema.parse(userInput);
  console.log("✅ User data is valid:", validatedUser);
} catch (error) {
  console.error("❌ User validation failed:", error);
}

// Example 2: Creating a new recipe
const recipeInput = {
  authorId: "clxxx1234567890",
  title: "Protein Pancakes",
  slug: "protein-pancakes",
  description: "High-protein breakfast option",
  instructions: "1. Mix ingredients. 2. Cook on medium heat. 3. Serve warm.",
  servings: 2,
  timeMinutes: 15,
  mealType: MealType.BREAKFAST,
  difficulty: Difficulty.EASY,
};

try {
  const validatedRecipe: RecipeCreate = RecipeCreateSchema.parse(recipeInput);
  console.log("✅ Recipe data is valid:", validatedRecipe);
} catch (error) {
  console.error("❌ Recipe validation failed:", error);
}

// Example 3: Creating a client
const clientInput = {
  coachId: "clxxx1234567890",
  name: "Jane Client",
  sex: Sex.FEMALE,
  age: 30,
  heightCm: 170,
  weightKg: 65,
  activityLevel: "MODERATE",
  goal: Goal.CUT,
  kcalTarget: 1800,
  proteinTarget: 135,
  carbsTarget: 180,
  fatTarget: 60,
  preferences: {
    dietaryRestrictions: ["gluten-free"],
    allergies: ["nuts"],
    dislikedIngredients: ["mushrooms"],
    cuisines: ["italian", "mexican"],
    hardware: ["air-fryer", "oven"],
  },
};

try {
  const validatedClient: ClientCreate = ClientCreateSchema.parse(clientInput);
  console.log("✅ Client data is valid:", validatedClient);
} catch (error) {
  console.error("❌ Client validation failed:", error);
}

// Example 4: Creating an ingredient
const ingredientInput = {
  name: "Chicken Breast",
  unitBase: UnitBase.GRAM,
  kcal100: 165,
  protein100: 31,
  carbs100: 0,
  fat100: 3.6,
};

try {
  const validatedIngredient = IngredientCreateSchema.parse(ingredientInput);
  console.log("✅ Ingredient data is valid:", validatedIngredient);
} catch (error) {
  console.error("❌ Ingredient validation failed:", error);
}

// Example 5: Partial update validation
import { RecipeUpdateSchema } from "@jmpp/types";

const recipeUpdateInput = {
  id: "clxxx1234567890",
  title: "Updated Protein Pancakes",
  timeMinutes: 20, // Only updating title and time
};

try {
  const validatedUpdate = RecipeUpdateSchema.parse(recipeUpdateInput);
  console.log("✅ Recipe update data is valid:", validatedUpdate);
} catch (error) {
  console.error("❌ Recipe update validation failed:", error);
}

export {};
