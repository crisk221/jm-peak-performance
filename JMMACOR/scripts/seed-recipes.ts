import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultRecipes = [
  // BREAKFAST RECIPES
  {
    name: "Protein-Packed Oatmeal",
    cuisine: "American",
    difficulty: "Easy",
    utensils: '["Bowl", "Microwave", "Measuring cup"]',
    baseServings: 1,
    instructions:
      "1. Mix 1/2 cup oats with 1 cup water/milk in microwave-safe bowl\n2. Microwave for 2-3 minutes\n3. Stir in protein powder when cooled slightly\n4. Top with berries and nuts\n5. Serve immediately",
    ingredients: [
      {
        name: "Rolled Oats",
        kcalPer100g: 389,
        proteinPer100g: 16.9,
        carbsPer100g: 66.3,
        fatPer100g: 6.9,
        gramsPerBase: 50,
        allergens: '["Gluten"]',
      },
      {
        name: "Whey Protein Powder",
        kcalPer100g: 400,
        proteinPer100g: 80,
        carbsPer100g: 5,
        fatPer100g: 5,
        gramsPerBase: 30,
        allergens: '["Dairy"]',
      },
      {
        name: "Mixed Berries",
        kcalPer100g: 57,
        proteinPer100g: 0.7,
        carbsPer100g: 14.5,
        fatPer100g: 0.3,
        gramsPerBase: 75,
        allergens: "[]",
      },
      {
        name: "Almonds",
        kcalPer100g: 579,
        proteinPer100g: 21.2,
        carbsPer100g: 21.6,
        fatPer100g: 49.9,
        gramsPerBase: 15,
        allergens: '["Tree Nuts"]',
      },
    ],
  },
  {
    name: "Greek Yogurt Parfait",
    cuisine: "Mediterranean",
    difficulty: "Easy",
    utensils: '["Bowl", "Spoon"]',
    baseServings: 1,
    instructions:
      "1. Layer Greek yogurt in bowl\n2. Add granola layer\n3. Add fresh fruit layer\n4. Repeat layers\n5. Drizzle with honey if desired",
    ingredients: [
      {
        name: "Greek Yogurt (Plain)",
        kcalPer100g: 59,
        proteinPer100g: 10,
        carbsPer100g: 3.6,
        fatPer100g: 0.4,
        gramsPerBase: 200,
        allergens: '["Dairy"]',
      },
      {
        name: "Granola",
        kcalPer100g: 471,
        proteinPer100g: 12.3,
        carbsPer100g: 64.7,
        fatPer100g: 20.3,
        gramsPerBase: 30,
        allergens: '["Gluten", "Tree Nuts"]',
      },
      {
        name: "Fresh Strawberries",
        kcalPer100g: 32,
        proteinPer100g: 0.7,
        carbsPer100g: 7.7,
        fatPer100g: 0.3,
        gramsPerBase: 100,
        allergens: "[]",
      },
      {
        name: "Honey",
        kcalPer100g: 304,
        proteinPer100g: 0.3,
        carbsPer100g: 82.4,
        fatPer100g: 0,
        gramsPerBase: 15,
        allergens: "[]",
      },
    ],
  },
  // LUNCH RECIPES
  {
    name: "Grilled Chicken Salad",
    cuisine: "American",
    difficulty: "Medium",
    utensils: '["Grill pan", "Large bowl", "Tongs", "Knife"]',
    baseServings: 1,
    instructions:
      "1. Season chicken breast and grill for 6-8 minutes per side\n2. Let rest, then slice\n3. Mix greens, vegetables in large bowl\n4. Add sliced chicken\n5. Drizzle with olive oil and lemon\n6. Season with salt and pepper",
    ingredients: [
      {
        name: "Chicken Breast",
        kcalPer100g: 165,
        proteinPer100g: 31,
        carbsPer100g: 0,
        fatPer100g: 3.6,
        gramsPerBase: 150,
        allergens: "[]",
      },
      {
        name: "Mixed Greens",
        kcalPer100g: 23,
        proteinPer100g: 2.9,
        carbsPer100g: 4.3,
        fatPer100g: 0.4,
        gramsPerBase: 100,
        allergens: "[]",
      },
      {
        name: "Cherry Tomatoes",
        kcalPer100g: 18,
        proteinPer100g: 0.9,
        carbsPer100g: 3.9,
        fatPer100g: 0.2,
        gramsPerBase: 75,
        allergens: "[]",
      },
      {
        name: "Cucumber",
        kcalPer100g: 16,
        proteinPer100g: 0.7,
        carbsPer100g: 4,
        fatPer100g: 0.1,
        gramsPerBase: 50,
        allergens: "[]",
      },
      {
        name: "Olive Oil",
        kcalPer100g: 884,
        proteinPer100g: 0,
        carbsPer100g: 0,
        fatPer100g: 100,
        gramsPerBase: 15,
        allergens: "[]",
      },
    ],
  },
  {
    name: "Quinoa Power Bowl",
    cuisine: "Mediterranean",
    difficulty: "Medium",
    utensils: '["Saucepan", "Bowl", "Strainer"]',
    baseServings: 1,
    instructions:
      "1. Cook quinoa according to package directions\n2. Roast sweet potato cubes at 400°F for 25 minutes\n3. Massage kale with lemon juice\n4. Assemble bowl with quinoa base\n5. Top with vegetables and chickpeas\n6. Drizzle with tahini dressing",
    ingredients: [
      {
        name: "Quinoa",
        kcalPer100g: 368,
        proteinPer100g: 14.1,
        carbsPer100g: 64.2,
        fatPer100g: 6.1,
        gramsPerBase: 75,
        allergens: "[]",
      },
      {
        name: "Sweet Potato",
        kcalPer100g: 86,
        proteinPer100g: 1.6,
        carbsPer100g: 20.1,
        fatPer100g: 0.1,
        gramsPerBase: 150,
        allergens: "[]",
      },
      {
        name: "Kale",
        kcalPer100g: 49,
        proteinPer100g: 4.3,
        carbsPer100g: 8.8,
        fatPer100g: 0.9,
        gramsPerBase: 50,
        allergens: "[]",
      },
      {
        name: "Chickpeas",
        kcalPer100g: 164,
        proteinPer100g: 8.9,
        carbsPer100g: 27.4,
        fatPer100g: 2.6,
        gramsPerBase: 100,
        allergens: "[]",
      },
      {
        name: "Tahini",
        kcalPer100g: 595,
        proteinPer100g: 17,
        carbsPer100g: 21,
        fatPer100g: 53,
        gramsPerBase: 20,
        allergens: '["Sesame"]',
      },
    ],
  },
  // DINNER RECIPES
  {
    name: "Baked Salmon with Vegetables",
    cuisine: "Scandinavian",
    difficulty: "Medium",
    utensils: '["Baking sheet", "Parchment paper", "Knife"]',
    baseServings: 1,
    instructions:
      "1. Preheat oven to 425°F\n2. Season salmon with herbs and lemon\n3. Arrange vegetables on baking sheet\n4. Drizzle with olive oil, season\n5. Bake salmon 12-15 minutes, vegetables 20-25 minutes\n6. Serve immediately",
    ingredients: [
      {
        name: "Salmon Fillet",
        kcalPer100g: 208,
        proteinPer100g: 22,
        carbsPer100g: 0,
        fatPer100g: 13,
        gramsPerBase: 150,
        allergens: '["Fish"]',
      },
      {
        name: "Broccoli",
        kcalPer100g: 34,
        proteinPer100g: 2.8,
        carbsPer100g: 7,
        fatPer100g: 0.4,
        gramsPerBase: 150,
        allergens: "[]",
      },
      {
        name: "Asparagus",
        kcalPer100g: 20,
        proteinPer100g: 2.2,
        carbsPer100g: 3.9,
        fatPer100g: 0.1,
        gramsPerBase: 100,
        allergens: "[]",
      },
      {
        name: "Lemon",
        kcalPer100g: 29,
        proteinPer100g: 1.1,
        carbsPer100g: 9,
        fatPer100g: 0.3,
        gramsPerBase: 30,
        allergens: "[]",
      },
      {
        name: "Olive Oil",
        kcalPer100g: 884,
        proteinPer100g: 0,
        carbsPer100g: 0,
        fatPer100g: 100,
        gramsPerBase: 10,
        allergens: "[]",
      },
    ],
  },
  {
    name: "Turkey and Vegetable Stir-Fry",
    cuisine: "Asian",
    difficulty: "Medium",
    utensils: '["Wok", "Spatula", "Knife", "Cutting board"]',
    baseServings: 1,
    instructions:
      "1. Heat oil in wok over high heat\n2. Cook turkey pieces until golden, 5-6 minutes\n3. Add harder vegetables first, cook 3 minutes\n4. Add softer vegetables, cook 2 minutes\n5. Add sauce, toss to coat\n6. Serve over brown rice",
    ingredients: [
      {
        name: "Ground Turkey",
        kcalPer100g: 189,
        proteinPer100g: 27,
        carbsPer100g: 0,
        fatPer100g: 8,
        gramsPerBase: 120,
        allergens: "[]",
      },
      {
        name: "Bell Peppers",
        kcalPer100g: 31,
        proteinPer100g: 1,
        carbsPer100g: 7,
        fatPer100g: 0.3,
        gramsPerBase: 100,
        allergens: "[]",
      },
      {
        name: "Snow Peas",
        kcalPer100g: 42,
        proteinPer100g: 2.8,
        carbsPer100g: 7.6,
        fatPer100g: 0.2,
        gramsPerBase: 75,
        allergens: "[]",
      },
      {
        name: "Brown Rice",
        kcalPer100g: 370,
        proteinPer100g: 7.9,
        carbsPer100g: 77.2,
        fatPer100g: 2.9,
        gramsPerBase: 75,
        allergens: "[]",
      },
      {
        name: "Soy Sauce",
        kcalPer100g: 8,
        proteinPer100g: 1.3,
        carbsPer100g: 0.8,
        fatPer100g: 0,
        gramsPerBase: 15,
        allergens: '["Soy"]',
      },
    ],
  },
  // SNACK RECIPES
  {
    name: "Apple Slices with Almond Butter",
    cuisine: "American",
    difficulty: "Easy",
    utensils: '["Knife", "Plate"]',
    baseServings: 1,
    instructions:
      "1. Wash and core apple\n2. Slice into wedges\n3. Arrange on plate\n4. Serve with almond butter for dipping\n5. Sprinkle with cinnamon if desired",
    ingredients: [
      {
        name: "Apple",
        kcalPer100g: 52,
        proteinPer100g: 0.3,
        carbsPer100g: 14,
        fatPer100g: 0.2,
        gramsPerBase: 150,
        allergens: "[]",
      },
      {
        name: "Almond Butter",
        kcalPer100g: 614,
        proteinPer100g: 21,
        carbsPer100g: 21,
        fatPer100g: 55,
        gramsPerBase: 20,
        allergens: '["Tree Nuts"]',
      },
      {
        name: "Cinnamon",
        kcalPer100g: 247,
        proteinPer100g: 4,
        carbsPer100g: 81,
        fatPer100g: 1.2,
        gramsPerBase: 1,
        allergens: "[]",
      },
    ],
  },
  {
    name: "Greek Yogurt with Nuts",
    cuisine: "Mediterranean",
    difficulty: "Easy",
    utensils: '["Bowl", "Spoon"]',
    baseServings: 1,
    instructions:
      "1. Scoop Greek yogurt into bowl\n2. Top with mixed nuts\n3. Drizzle with honey\n4. Add a pinch of cinnamon\n5. Enjoy immediately",
    ingredients: [
      {
        name: "Greek Yogurt (Plain)",
        kcalPer100g: 59,
        proteinPer100g: 10,
        carbsPer100g: 3.6,
        fatPer100g: 0.4,
        gramsPerBase: 150,
        allergens: '["Dairy"]',
      },
      {
        name: "Mixed Nuts",
        kcalPer100g: 607,
        proteinPer100g: 20,
        carbsPer100g: 21,
        fatPer100g: 54,
        gramsPerBase: 20,
        allergens: '["Tree Nuts"]',
      },
      {
        name: "Honey",
        kcalPer100g: 304,
        proteinPer100g: 0.3,
        carbsPer100g: 82.4,
        fatPer100g: 0,
        gramsPerBase: 10,
        allergens: "[]",
      },
    ],
  },
  // SHAKE RECIPES
  {
    name: "Chocolate Peanut Butter Protein Shake",
    cuisine: "American",
    difficulty: "Easy",
    utensils: '["Blender", "Measuring cup"]',
    baseServings: 1,
    instructions:
      "1. Add all ingredients to blender\n2. Blend on high for 60 seconds\n3. Add ice if desired consistency is thicker\n4. Blend again for 30 seconds\n5. Pour into glass and serve immediately",
    ingredients: [
      {
        name: "Chocolate Protein Powder",
        kcalPer100g: 400,
        proteinPer100g: 75,
        carbsPer100g: 10,
        fatPer100g: 5,
        gramsPerBase: 30,
        allergens: '["Dairy"]',
      },
      {
        name: "Peanut Butter",
        kcalPer100g: 588,
        proteinPer100g: 25,
        carbsPer100g: 20,
        fatPer100g: 50,
        gramsPerBase: 20,
        allergens: '["Peanuts"]',
      },
      {
        name: "Banana",
        kcalPer100g: 89,
        proteinPer100g: 1.1,
        carbsPer100g: 23,
        fatPer100g: 0.3,
        gramsPerBase: 100,
        allergens: "[]",
      },
      {
        name: "Almond Milk",
        kcalPer100g: 17,
        proteinPer100g: 0.6,
        carbsPer100g: 1.5,
        fatPer100g: 1.1,
        gramsPerBase: 250,
        allergens: '["Tree Nuts"]',
      },
    ],
  },
  {
    name: "Green Goddess Smoothie",
    cuisine: "American",
    difficulty: "Easy",
    utensils: '["Blender", "Measuring cup"]',
    baseServings: 1,
    instructions:
      "1. Add spinach and liquid to blender first\n2. Add remaining ingredients\n3. Blend on high for 90 seconds until smooth\n4. Taste and adjust sweetness if needed\n5. Serve immediately over ice",
    ingredients: [
      {
        name: "Fresh Spinach",
        kcalPer100g: 23,
        proteinPer100g: 2.9,
        carbsPer100g: 3.6,
        fatPer100g: 0.4,
        gramsPerBase: 50,
        allergens: "[]",
      },
      {
        name: "Vanilla Protein Powder",
        kcalPer100g: 380,
        proteinPer100g: 80,
        carbsPer100g: 5,
        fatPer100g: 2,
        gramsPerBase: 30,
        allergens: '["Dairy"]',
      },
      {
        name: "Avocado",
        kcalPer100g: 160,
        proteinPer100g: 2,
        carbsPer100g: 9,
        fatPer100g: 15,
        gramsPerBase: 50,
        allergens: "[]",
      },
      {
        name: "Pineapple",
        kcalPer100g: 50,
        proteinPer100g: 0.5,
        carbsPer100g: 13,
        fatPer100g: 0.1,
        gramsPerBase: 100,
        allergens: "[]",
      },
      {
        name: "Coconut Water",
        kcalPer100g: 19,
        proteinPer100g: 0.7,
        carbsPer100g: 3.7,
        fatPer100g: 0.2,
        gramsPerBase: 200,
        allergens: "[]",
      },
    ],
  },
];

async function seedRecipes() {
  try {
    console.log("🌱 Starting to seed recipes...");

    for (let i = 0; i < defaultRecipes.length; i++) {
      const recipeData = defaultRecipes[i];
      console.log(
        `Creating recipe ${i + 1}/${defaultRecipes.length}: ${recipeData.name}`,
      );

      // Create or find ingredients first
      const ingredientConnections = [];

      for (const ingredientData of recipeData.ingredients) {
        let ingredient = await prisma.ingredient.findUnique({
          where: { name: ingredientData.name },
        });

        if (!ingredient) {
          ingredient = await prisma.ingredient.create({
            data: {
              name: ingredientData.name,
              kcalPer100g: ingredientData.kcalPer100g,
              proteinPer100g: ingredientData.proteinPer100g,
              carbsPer100g: ingredientData.carbsPer100g,
              fatPer100g: ingredientData.fatPer100g,
              allergens: ingredientData.allergens,
            },
          });
        }

        ingredientConnections.push({
          ingredientId: ingredient.id,
          gramsPerBase: ingredientData.gramsPerBase,
        });
      }

      // Create recipe with ingredients
      const recipe = await prisma.recipe.create({
        data: {
          name: recipeData.name,
          cuisine: recipeData.cuisine,
          difficulty: recipeData.difficulty,
          utensils: recipeData.utensils,
          baseServings: recipeData.baseServings,
          instructions: recipeData.instructions,
          ingredients: {
            create: ingredientConnections,
          },
        },
      });

      console.log(`✅ Created: ${recipe.name}`);
    }

    const totalRecipes = await prisma.recipe.count();
    const totalIngredients = await prisma.ingredient.count();

    console.log("\n🎉 Recipe seeding completed!");
    console.log(`📊 Total recipes in database: ${totalRecipes}`);
    console.log(`🥗 Total ingredients in database: ${totalIngredients}`);
  } catch (error) {
    console.error("❌ Error seeding recipes:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedRecipes();
