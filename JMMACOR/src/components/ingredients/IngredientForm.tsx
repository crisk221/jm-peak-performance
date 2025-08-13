'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ingredientSchema, type IngredientFormData } from '@/schemas/ingredient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ChipInput } from '@/components/ChipInput';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

interface IngredientFormProps {
  initialData?: IngredientFormData;
  isEdit?: boolean;
  onSubmit: (data: IngredientFormData) => Promise<void>;
  isSubmitting: boolean;
  submitError?: string | undefined;
}

export function IngredientForm({ 
  initialData, 
  isEdit = false, 
  onSubmit, 
  isSubmitting,
  submitError 
}: IngredientFormProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: initialData || {
      name: '',
      kcalPer100g: 0,
      proteinPer100g: 0,
      carbsPer100g: 0,
      fatPer100g: 0,
      allergens: [],
    },
  });

  const allergens = watch('allergens');
  const kcal = watch('kcalPer100g');

  // Autofocus name field on load
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  // Handle duplicate name error from server
  useEffect(() => {
    if (submitError && submitError.includes('already exists')) {
      setError('name', { message: 'Name already exists' });
    }
  }, [submitError, setError]);

  const handleFormSubmit = async (data: IngredientFormData) => {
    // Clear any previous name errors
    clearErrors('name');
    
    // Dedupe allergens case-insensitive
    const deduped = Array.from(
      new Set(data.allergens.map(a => a.toLowerCase()))
    );
    const finalData = { ...data, allergens: deduped };
    
    await onSubmit(finalData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      handleSubmit(handleFormSubmit)();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/dashboard/ingredients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ingredients
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {isEdit ? 'Edit Ingredient' : 'Add New Ingredient'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" onKeyDown={handleKeyDown}>
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register('name', {
                    setValueAs: (value) => value?.trim() || '',
                  })}
                  ref={nameInputRef}
                  placeholder="e.g., Chicken Breast"
                  autoComplete="off"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <Separator />

              {/* Nutrition per 100g */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Nutrition per 100g</h3>
                  {kcal > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Energy density: {kcal.toFixed(1)} kcal / 100g
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kcalPer100g">Calories (kcal) *</Label>
                    <Input
                      id="kcalPer100g"
                      type="number"
                      step="0.1"
                      min="0"
                      {...register('kcalPer100g', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.kcalPer100g && (
                      <p className="text-sm text-red-600">{errors.kcalPer100g.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proteinPer100g">Protein (g) *</Label>
                    <Input
                      id="proteinPer100g"
                      type="number"
                      step="0.1"
                      min="0"
                      {...register('proteinPer100g', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.proteinPer100g && (
                      <p className="text-sm text-red-600">{errors.proteinPer100g.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carbsPer100g">Carbohydrates (g) *</Label>
                    <Input
                      id="carbsPer100g"
                      type="number"
                      step="0.1"
                      min="0"
                      {...register('carbsPer100g', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.carbsPer100g && (
                      <p className="text-sm text-red-600">{errors.carbsPer100g.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fatPer100g">Fat (g) *</Label>
                    <Input
                      id="fatPer100g"
                      type="number"
                      step="0.1"
                      min="0"
                      {...register('fatPer100g', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.fatPer100g && (
                      <p className="text-sm text-red-600">{errors.fatPer100g.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Allergens */}
              <div className="space-y-2">
                <Label>Allergens</Label>
                <ChipInput
                  value={allergens}
                  onChange={(newAllergens: string[]) => setValue('allergens', newAllergens)}
                  placeholder="Add allergens (e.g., gluten, dairy, nuts)..."
                />
                <p className="text-sm text-muted-foreground">
                  Press Enter to add each allergen. Duplicates will be removed automatically.
                </p>
              </div>

              <Separator />

              {/* Submit */}
              <div className="flex items-center justify-end space-x-2">
                <Link href="/dashboard/ingredients">
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting 
                    ? (isEdit ? 'Updating...' : 'Creating...') 
                    : (isEdit ? 'Update Ingredient' : 'Create Ingredient')
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
