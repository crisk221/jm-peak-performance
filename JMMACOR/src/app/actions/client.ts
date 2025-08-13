'use server';

import { PrismaClient } from '@prisma/client';
import { toJson, fromJsonArray } from '@/lib/json-helpers';
import { feetInchesToCm, mapToCanonicalActivity, mapToCanonicalGoal } from '@/lib/macros';
import type { ClientDraft, HydratedClient } from '@/types/wizard';

const prisma = new PrismaClient();

export async function createClientDraft(input: Partial<ClientDraft>): Promise<{ id: string }> {
  try {
    const client = await prisma.client.create({
      data: {
        fullName: input.fullName || '',
        gender: input.gender || '',
        age: input.age || 0,
        heightCm: input.heightCm || 0,
        weightKg: input.weightKg || 0,
        activity: input.activity || '',
        goal: input.goal || '',
        allergies: toJson(input.allergies),
        cuisines: toJson(input.cuisines),
        dislikes: toJson(input.dislikes),
        includeMeals: toJson(input.includeMeals),
      },
    });

    return { id: client.id };
  } catch (error) {
    console.error('Failed to create client draft:', error);
    throw new Error('Failed to create client');
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateClientDraft(
  id: string, 
  input: Partial<ClientDraft>
): Promise<{ success: boolean }> {
  try {
    await prisma.client.update({
      where: { id },
      data: {
        ...(input.fullName !== undefined && { fullName: input.fullName }),
        ...(input.gender !== undefined && { gender: input.gender }),
        ...(input.age !== undefined && { age: input.age || 0 }),
        ...(input.heightCm !== undefined && { heightCm: input.heightCm || 0 }),
        ...(input.weightKg !== undefined && { weightKg: input.weightKg || 0 }),
        ...(input.activity !== undefined && { activity: input.activity }),
        ...(input.goal !== undefined && { goal: input.goal }),
        ...(input.allergies !== undefined && { allergies: toJson(input.allergies) }),
        ...(input.cuisines !== undefined && { cuisines: toJson(input.cuisines) }),
        ...(input.dislikes !== undefined && { dislikes: toJson(input.dislikes) }),
        ...(input.includeMeals !== undefined && { includeMeals: toJson(input.includeMeals) }),
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to update client draft:', error);
    throw new Error('Failed to update client');
  } finally {
    await prisma.$disconnect();
  }
}

export async function getClient(id: string): Promise<HydratedClient | null> {
  try {
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return null;
    }

    // Convert height if needed (legacy support for ft/in)
    let heightCm = client.heightCm;
    if (heightCm === 0 && client.fullName) {
      // If heightCm is missing but we have old data, we might need to derive it
      // For now, we'll handle this in the UI layer when we detect missing heightCm
    }

    // Map old activity/goal labels to canonical ones
    const canonicalActivity = mapToCanonicalActivity(client.activity);
    const canonicalGoal = mapToCanonicalGoal(client.goal);

    // Update the client record if we mapped to different values
    if (canonicalActivity !== client.activity || canonicalGoal !== client.goal) {
      await prisma.client.update({
        where: { id },
        data: {
          activity: canonicalActivity,
          goal: canonicalGoal,
        },
      });
    }

    return {
      id: client.id,
      fullName: client.fullName,
      gender: client.gender,
      age: client.age,
      heightCm: heightCm,
      weightKg: client.weightKg,
      activity: canonicalActivity,
      goal: canonicalGoal,
      allergies: fromJsonArray(client.allergies),
      cuisines: fromJsonArray(client.cuisines),
      dislikes: fromJsonArray(client.dislikes),
      includeMeals: fromJsonArray(client.includeMeals),
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  } catch (error) {
    console.error('Failed to get client:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateClientHeightCm(id: string, heightCm: number): Promise<{ success: boolean }> {
  try {
    await prisma.client.update({
      where: { id },
      data: { heightCm },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to update client height:', error);
    throw new Error('Failed to update height');
  } finally {
    await prisma.$disconnect();
  }
}

export async function createPlan(data: {
  clientId: string;
  kcalTarget: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  splitType: string;
  custom?: any;
  formula?: string;
}): Promise<{ id: string }> {
  try {
    const plan = await prisma.plan.create({
      data: {
        clientId: data.clientId,
        kcalTarget: data.kcalTarget,
        proteinG: data.proteinG,
        carbsG: data.carbsG,
        fatG: data.fatG,
        splitType: data.splitType,
        custom: data.custom ? toJson(data.custom) : null,
        formula: data.formula || null,
      },
    });

    return { id: plan.id };
  } catch (error) {
    console.error('Failed to create plan:', error);
    throw new Error('Failed to create plan');
  } finally {
    await prisma.$disconnect();
  }
}
