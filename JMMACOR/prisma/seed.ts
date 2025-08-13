import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Check if we already have recipes
  const existingRecipeCount = await prisma.recipe.count();
  if (existingRecipeCount > 0) {
    console.log('📋 Recipes already exist, skipping recipe seed');
  } else {
    console.log('🍳 Creating demo recipes...');
    await seedRecipes();
  }

  // Create a sample ingredient if none exist
  const existingIngredientCount = await prisma.ingredient.count();
  if (existingIngredientCount === 0) {
    const ingredient = await prisma.ingredient.create({
      data: {
        name: 'Sample Ingredient (Seed)',
        kcalPer100g: 100.5,
        proteinPer100g: 20.0,
        carbsPer100g: 15.0,
        fatPer100g: 5.0,
        allergens: JSON.stringify(['gluten']),
      },
    });

    console.log('✅ Created sample ingredient:', ingredient);
  }

  // Count totals
  const ingredientCount = await prisma.ingredient.count();
  const recipeCount = await prisma.recipe.count();
  console.log(`📊 Total ingredients: ${ingredientCount}, recipes: ${recipeCount}`);
}

async function seedRecipes() {
  // Create base ingredients first
  const ingredients = await Promise.all([
    prisma.ingredient.upsert({
      where: { name: 'Rolled Oats' },
      update: {},
      create: {
        name: 'Rolled Oats',
        kcalPer100g: 389,
        proteinPer100g: 16.9,
        carbsPer100g: 66.3,
        fatPer100g: 6.9,
        allergens: JSON.stringify(['gluten']),
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Whey Protein Powder' },
      update: {},
      create: {
        name: 'Whey Protein Powder',
        kcalPer100g: 400,
        proteinPer100g: 80.0,
        carbsPer100g: 8.0,
        fatPer100g: 4.0,
        allergens: JSON.stringify(['dairy']),
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Chicken Breast' },
      update: {},
      create: {
        name: 'Chicken Breast',
        kcalPer100g: 165,
        proteinPer100g: 31.0,
        carbsPer100g: 0.0,
        fatPer100g: 3.6,
        allergens: JSON.stringify([]),
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Jasmine Rice' },
      update: {},
      create: {
        name: 'Jasmine Rice',
        kcalPer100g: 365,
        proteinPer100g: 7.1,
        carbsPer100g: 79.0,
        fatPer100g: 0.7,
        allergens: JSON.stringify([]),
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Greek Yogurt' },
      update: {},
      create: {
        name: 'Greek Yogurt',
        kcalPer100g: 97,
        proteinPer100g: 18.0,
        carbsPer100g: 3.6,
        fatPer100g: 0.4,
        allergens: JSON.stringify(['dairy']),
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Mixed Berries' },
      update: {},
      create: {
        name: 'Mixed Berries',
        kcalPer100g: 57,
        proteinPer100g: 0.7,
        carbsPer100g: 14.5,
        fatPer100g: 0.3,
        allergens: JSON.stringify([]),
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Beef Sirloin' },
      update: {},
      create: {
        name: 'Beef Sirloin',
        kcalPer100g: 205,
        proteinPer100g: 31.0,
        carbsPer100g: 0.0,
        fatPer100g: 8.2,
        allergens: JSON.stringify([]),
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Eggs' },
      update: {},
      create: {
        name: 'Eggs',
        kcalPer100g: 155,
        proteinPer100g: 13.0,
        carbsPer100g: 1.1,
        fatPer100g: 11.0,
        allergens: JSON.stringify(['eggs']),
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'Whole Wheat Bread' },
      update: {},
      create: {
        name: 'Whole Wheat Bread',
        kcalPer100g: 247,
        proteinPer100g: 13.0,
        carbsPer100g: 41.0,
        fatPer100g: 4.2,
        allergens: JSON.stringify(['gluten']),
      },
    }),
  ]);

  // Create recipes
  const recipes = [
    {
      name: 'Protein Oatmeal',
      cuisine: 'American',
      difficulty: 'Easy',
      baseServings: 1,
      instructions: '1. Cook oats with water. 2. Stir in protein powder when cool. 3. Serve hot.',
      ingredients: [
        { ingredient: 'Rolled Oats', grams: 50 },
        { ingredient: 'Whey Protein Powder', grams: 30 },
      ],
    },
    {
      name: 'Chicken & Rice Bowl',
      cuisine: 'Asian',
      difficulty: 'Medium',
      baseServings: 1,
      instructions: '1. Grill chicken breast. 2. Cook rice. 3. Combine and season. 4. Serve hot.',
      ingredients: [
        { ingredient: 'Chicken Breast', grams: 150 },
        { ingredient: 'Jasmine Rice', grams: 80 },
      ],
    },
    {
      name: 'Greek Yogurt & Berries',
      cuisine: 'Mediterranean',
      difficulty: 'Easy',
      baseServings: 1,
      instructions: '1. Place yogurt in bowl. 2. Top with berries. 3. Serve chilled.',
      ingredients: [
        { ingredient: 'Greek Yogurt', grams: 200 },
        { ingredient: 'Mixed Berries', grams: 100 },
      ],
    },
    {
      name: 'Beef Stir-fry & Rice',
      cuisine: 'Asian',
      difficulty: 'Medium',
      baseServings: 1,
      instructions: '1. Stir-fry beef strips. 2. Cook rice. 3. Combine and season. 4. Serve hot.',
      ingredients: [
        { ingredient: 'Beef Sirloin', grams: 120 },
        { ingredient: 'Jasmine Rice', grams: 75 },
      ],
    },
    {
      name: 'Scrambled Eggs & Toast',
      cuisine: 'American',
      difficulty: 'Easy',
      baseServings: 1,
      instructions: '1. Scramble eggs. 2. Toast bread. 3. Serve together.',
      ingredients: [
        { ingredient: 'Eggs', grams: 120 }, // ~2 large eggs
        { ingredient: 'Whole Wheat Bread', grams: 60 }, // ~2 slices
      ],
    },
  ];

  for (const recipeData of recipes) {
    const recipe = await prisma.recipe.create({
      data: {
        name: recipeData.name,
        cuisine: recipeData.cuisine,
        difficulty: recipeData.difficulty,
        baseServings: recipeData.baseServings,
        instructions: recipeData.instructions,
        utensils: JSON.stringify(['pan', 'spatula']),
      },
    });

    // Add ingredients to recipe
    for (const ingredientData of recipeData.ingredients) {
      const ingredient = ingredients.find(i => i.name === ingredientData.ingredient);
      if (ingredient) {
        await prisma.recipeIngredient.create({
          data: {
            recipeId: recipe.id,
            ingredientId: ingredient.id,
            gramsPerBase: ingredientData.grams,
          },
        });
      }
    }

    console.log(`✅ Created recipe: ${recipe.name}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
