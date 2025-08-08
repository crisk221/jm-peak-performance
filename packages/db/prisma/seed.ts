import { prisma } from "../src/client";
import { Decimal } from "@prisma/client/runtime/library";

async function main() {
  console.log("🌱 Starting database seed...");

  // Create a coach user
  const coach = await prisma.user.create({
    data: {
      email: "coach@jmpp.com",
      name: "John Coach",
      passwordHash:
        "$2a$12$LQv3c1yqBwGGVnZMUHTZwO3vLKCp5E2p7X8pE2p7X8pE2p7X8pE2", // placeholder hashed password
      role: "COACH",
    },
  });

  console.log("✅ Created coach user:", coach.email);

  // Create ingredients
  const chickenBreast = await prisma.ingredient.create({
    data: {
      name: "Chicken Breast",
      unitBase: "GRAM",
      kcal100: new Decimal(165),
      protein100: new Decimal(31),
      carbs100: new Decimal(0),
      fat100: new Decimal(3.6),
    },
  });

  const brownRice = await prisma.ingredient.create({
    data: {
      name: "Brown Rice",
      unitBase: "GRAM",
      kcal100: new Decimal(123),
      protein100: new Decimal(2.6),
      carbs100: new Decimal(23),
      fat100: new Decimal(0.9),
    },
  });

  const oliveOil = await prisma.ingredient.create({
    data: {
      name: "Olive Oil",
      unitBase: "ML",
      kcal100: new Decimal(884),
      protein100: new Decimal(0),
      carbs100: new Decimal(0),
      fat100: new Decimal(100),
    },
  });

  console.log("✅ Created ingredients");

  // Create utensils
  const airFryer = await prisma.utensil.create({
    data: {
      name: "Air Fryer",
      slug: "air-fryer",
    },
  });

  const oven = await prisma.utensil.create({
    data: {
      name: "Oven",
      slug: "oven",
    },
  });

  const stove = await prisma.utensil.create({
    data: {
      name: "Stove",
      slug: "stove",
    },
  });

  console.log("✅ Created utensils");

  // Create tags
  const highProtein = await prisma.tag.create({
    data: {
      name: "High-Protein",
      slug: "high-protein",
    },
  });

  const glutenFree = await prisma.tag.create({
    data: {
      name: "Gluten-Free",
      slug: "gluten-free",
    },
  });

  console.log("✅ Created tags");

  // Create a recipe
  const chickenRiceRecipe = await prisma.recipe.create({
    data: {
      authorId: coach.id,
      title: "Chicken & Rice",
      slug: "chicken-and-rice",
      description: "A simple and nutritious high-protein meal",
      instructions:
        "1. Season chicken breast with salt and pepper. 2. Cook chicken in air fryer at 380°F for 12-15 minutes. 3. Cook brown rice on stove according to package instructions. 4. Drizzle with olive oil and serve.",
      servings: 1,
      timeMinutes: 25,
      mealType: "LUNCH",
      difficulty: "EASY",
    },
  });

  // Add recipe ingredients
  await prisma.recipeIngredient.createMany({
    data: [
      {
        recipeId: chickenRiceRecipe.id,
        ingredientId: chickenBreast.id,
        quantity: new Decimal(150),
        unit: "G",
      },
      {
        recipeId: chickenRiceRecipe.id,
        ingredientId: brownRice.id,
        quantity: new Decimal(80),
        unit: "G",
        note: "Dry weight",
      },
      {
        recipeId: chickenRiceRecipe.id,
        ingredientId: oliveOil.id,
        quantity: new Decimal(10),
        unit: "ML",
      },
    ],
  });

  // Add recipe utensils
  await prisma.recipeUtensil.createMany({
    data: [
      {
        recipeId: chickenRiceRecipe.id,
        utensilId: airFryer.id,
      },
      {
        recipeId: chickenRiceRecipe.id,
        utensilId: stove.id,
      },
    ],
  });

  // Add recipe tags
  await prisma.recipeTag.createMany({
    data: [
      {
        recipeId: chickenRiceRecipe.id,
        tagId: highProtein.id,
      },
      {
        recipeId: chickenRiceRecipe.id,
        tagId: glutenFree.id,
      },
    ],
  });

  console.log("✅ Created recipe with ingredients, utensils, and tags");

  // Create a client
  const client = await prisma.client.create({
    data: {
      coachId: coach.id,
      name: "Jane Doe",
      sex: "FEMALE",
      age: 28,
      heightCm: 165,
      weightKg: new Decimal(65),
      activityLevel: "MODERATE",
      goal: "CUT",
      kcalTarget: 1800,
      proteinTarget: 135,
      carbsTarget: 180,
      fatTarget: 60,
      preferences: {
        dietaryRestrictions: ["gluten-free"],
        allergies: [],
        dislikedIngredients: ["mushrooms"],
        cuisines: ["italian", "mediterranean"],
        hardware: ["air-fryer", "oven"],
      },
    },
  });

  console.log("✅ Created client:", client.name);

  // Create a 3-day meal plan
  const mealPlan = await prisma.mealPlan.create({
    data: {
      clientId: client.id,
      coachId: coach.id,
      startDate: new Date(),
      days: 3,
      kcal: 1800,
      protein: 135,
      carbs: 180,
      fat: 60,
    },
  });

  // Add meal plan items
  await prisma.mealPlanItem.createMany({
    data: [
      // Day 1
      {
        mealPlanId: mealPlan.id,
        recipeId: chickenRiceRecipe.id,
        dayIndex: 0,
        mealIndex: 1, // Lunch
        servings: new Decimal(1),
        notes: "Main protein source for the day",
      },
      // Day 2
      {
        mealPlanId: mealPlan.id,
        recipeId: chickenRiceRecipe.id,
        dayIndex: 1,
        mealIndex: 1, // Lunch
        servings: new Decimal(1),
      },
      // Day 3
      {
        mealPlanId: mealPlan.id,
        recipeId: chickenRiceRecipe.id,
        dayIndex: 2,
        mealIndex: 1, // Lunch
        servings: new Decimal(1),
      },
    ],
  });

  console.log("✅ Created 3-day meal plan with items");
  console.log("🎉 Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
