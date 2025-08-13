'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createIngredient } from '@/app/actions/ingredients';
import { IngredientForm } from '@/components/ingredients/IngredientForm';
import { useToast } from '@/lib/hooks/useToast';
import type { IngredientFormData } from '@/schemas/ingredient';

export default function NewIngredientPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const handleSubmit = async (data: IngredientFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(undefined);
      
      await createIngredient(data);
      
      addToast('Ingredient created successfully', 'success');
      router.push('/dashboard/ingredients');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create ingredient';
      setSubmitError(message);
      addToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IngredientForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError}
    />
  );
}
