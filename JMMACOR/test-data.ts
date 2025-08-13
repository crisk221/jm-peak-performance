import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestData() {
  console.log('🧪 Creating test client and plan...');

  // Create a test client
  const client = await prisma.client.create({
    data: {
      fullName: 'John Doe',
      gender: 'male',
      age: 30,
      heightCm: 180,
      weightKg: 80,
      activity: 'Active: daily exercise or intense exercise 3-4 times/week',
      goal: 'Weight loss of 0.5 kg per week',
      allergies: JSON.stringify([]),
      cuisines: JSON.stringify(['American', 'Asian']),
      dislikes: JSON.stringify([]),
      includeMeals: JSON.stringify(['Breakfast', 'Lunch', 'Dinner']),
    },
  });

  console.log('✅ Created test client:', client.id);

  // Create a test plan
  const plan = await prisma.plan.create({
    data: {
      clientId: client.id,
      kcalTarget: 2200,
      proteinG: 165,
      carbsG: 220,
      fatG: 85,
      splitType: 'balanced',
      custom: null,
    },
  });

  console.log('✅ Created test plan:', plan.id);
  console.log(`🌐 Test URL: http://localhost:3001/wizard/plan?clientId=${client.id}&planId=${plan.id}`);

  return { client, plan };
}

createTestData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
