'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getIngredient, updateIngredient } from '@/app/actions/ingredients';
import { IngredientForm } from '@/components/ingredients/IngredientForm';
import { useToast } from '@/lib/hooks/useToast';
import type { IngredientFormData } from '@/schemas/ingredient';

export default function EditIngredientPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<IngredientFormData>();

  const id = params.id as string;

  useEffect(() => {
    const loadIngredient = async () => {
      try {
        const ingredient = await getIngredient(id);
        setInitialData({
          name: ingredient.name,
          kcalPer100g: ingredient.kcalPer100g,
          proteinPer100g: ingredient.proteinPer100g,
          carbsPer100g: ingredient.carbsPer100g,
          fatPer100g: ingredient.fatPer100g,
          allergens: ingredient.allergens,
        });
      } catch (error) {
        addToast('Failed to load ingredient', 'error');
        router.push('/dashboard/ingredients');
      } finally {
        setLoading(false);
      }
    };

    loadIngredient();
  }, [id, addToast, router]);

  const handleSubmit = async (data: IngredientFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(undefined);
      
      await updateIngredient(id, data);
      
      addToast('Ingredient updated successfully', 'success');
      router.push('/dashboard/ingredients');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update ingredient';
      setSubmitError(message);
      addToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading ingredient...</div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="p-6">
        <div className="text-center">Ingredient not found</div>
      </div>
    );
  }

  return (
    <IngredientForm
      initialData={initialData}
      isEdit={true}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError}
    />
  );
}
