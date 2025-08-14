"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createRecipe, updateRecipe } from "@/app/actions/recipes";
import { createOrFindIngredient } from "@/app/actions/ingredients";
import { recipeSchema, type RecipeFormData } from "@/schemas/recipe";
import { calcRecipePerServing, formatMacros } from "@/lib/nutrition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ChipInput } from "@/components/ChipInput";
import IngredientPicker from "./IngredientPicker";
import { RecipeImport } from "./recipe-import";
import { Globe } from "lucide-react";
import type { ExtractedRecipe } from "@/lib/recipe-extract";

interface RecipeFormProps {
  initialData?: {
    id?: string;
    name: string;
    cuisine?: string | null;
    difficulty?: string | null;
    utensils?: string | null;
    baseServings: number;
    instructions: string;
    ingredients: Array<{
      ingredientId: string;
      gramsPerBase: number;
      ingredient: {
        name: string;
        kcalPer100g: number;
        proteinPer100g: number;
        carbsPer100g: number;
        fatPer100g: number;
      };
    }>;
  };
}

interface IngredientRow {
  ingredientId: string;
  gramsPerBase: number;
  name?: string;
  per100?: { kcal: number; p: number; c: number; f: number };
}

export default function RecipeForm({ initialData }: RecipeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [ingredientData, setIngredientData] = useState<
    Map<string, { name: string; per100: any }>
  >(new Map());

  const isEditing = !!initialData?.id;

  // Initialize form with default values
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: initialData?.name || "",
      cuisine: initialData?.cuisine || "",
      difficulty: (initialData?.difficulty as any) || undefined,
      utensils: initialData?.utensils ? JSON.parse(initialData.utensils) : [],
      baseServings: initialData?.baseServings || 2,
      instructions: initialData?.instructions || "",
      ingredients:
        initialData?.ingredients?.map((ing) => ({
          ingredientId: ing.ingredientId,
          gramsPerBase: ing.gramsPerBase,
        })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  // Initialize ingredient data map
  useEffect(() => {
    if (initialData?.ingredients) {
      const dataMap = new Map();
      initialData.ingredients.forEach((ing) => {
        dataMap.set(ing.ingredientId, {
          name: ing.ingredient.name,
          per100: {
            kcal: ing.ingredient.kcalPer100g,
            p: ing.ingredient.proteinPer100g,
            c: ing.ingredient.carbsPer100g,
            f: ing.ingredient.fatPer100g,
          },
        });
      });
      setIngredientData(dataMap);
    }
  }, [initialData]);

  const watchedIngredients = form.watch("ingredients");
  const watchedBaseServings = form.watch("baseServings");

  // Calculate nutrition per serving
  const nutritionPerServing = (() => {
    try {
      if (watchedIngredients.length === 0 || !watchedBaseServings) {
        return { kcal: 0, p: 0, c: 0, f: 0 };
      }

      const ingredientsWithData = watchedIngredients
        .map((ing) => {
          const data = ingredientData.get(ing.ingredientId);
          if (!data) return null;
          return {
            gramsPerBase: ing.gramsPerBase,
            ingredient: {
              kcalPer100g: data.per100.kcal,
              proteinPer100g: data.per100.p,
              carbsPer100g: data.per100.c,
              fatPer100g: data.per100.f,
            },
          };
        })
        .filter(Boolean);

      if (ingredientsWithData.length === 0) {
        return { kcal: 0, p: 0, c: 0, f: 0 };
      }

      return calcRecipePerServing({
        baseServings: watchedBaseServings,
        ingredients: ingredientsWithData as any,
      });
    } catch {
      return { kcal: 0, p: 0, c: 0, f: 0 };
    }
  })();

  const formattedNutrition = formatMacros(nutritionPerServing);

  const handleAddIngredient = (ingredient: {
    ingredientId: string;
    name: string;
    per100: { kcal: number; p: number; c: number; f: number };
  }) => {
    append({
      ingredientId: ingredient.ingredientId,
      gramsPerBase: 100,
    });

    setIngredientData(
      (prev) =>
        new Map(
          prev.set(ingredient.ingredientId, {
            name: ingredient.name,
            per100: ingredient.per100,
          }),
        ),
    );
  };

  const handleRemoveIngredient = (index: number) => {
    const ingredient = watchedIngredients[index];
    if (ingredient) {
      setIngredientData((prev) => {
        const newMap = new Map(prev);
        newMap.delete(ingredient.ingredientId);
        return newMap;
      });
    }
    remove(index);
  };

  const handleImportRecipe = async (extractedRecipe: ExtractedRecipe) => {
    try {
      setIsSubmitting(true);

      // Format ingredients as text to include in instructions
      const ingredientsList = extractedRecipe.ingredients
        .map((ing) => ing.raw || ing.name || "Unknown ingredient")
        .join("\n");

      // Combine ingredients and instructions
      const fullInstructions = `INGREDIENTS:\n${ingredientsList}\n\nINSTRUCTIONS:\n${extractedRecipe.steps.join("\n\n")}`;

      // Prepare recipe data for saving (without ingredients array)
      const recipeData = {
        title: extractedRecipe.title || "Imported Recipe",
        cuisine: extractedRecipe.cuisine || "",
        difficulty: "", // Not provided by extraction
        utensils: [], // Not provided by extraction
        baseServings: extractedRecipe.servings || 4,
        instructions: fullInstructions,
        ingredients: [], // Empty array since we're storing ingredients as text
      };

      // Save the recipe using the existing action
      await createRecipe(recipeData);

      // Success! The createRecipe action will redirect automatically
    } catch (error) {
      console.error("Error importing and saving recipe:", error);
      alert("Failed to save recipe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        title: data.title,
        cuisine: data.cuisine || "",
        difficulty: data.difficulty || "",
        utensils: data.utensils,
        baseServings: data.baseServings,
        instructions: data.instructions,
        ingredients: data.ingredients,
      };

      if (isEditing && initialData?.id) {
        await updateRecipe(initialData.id, submitData);
      } else {
        await createRecipe(submitData);
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {isEditing ? "Edit Recipe" : "Create New Recipe"}
          </h2>
          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
            >
              <Globe className="h-4 w-4" />
              Import from web
            </Button>
          )}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Recipe Title *</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Enter recipe name"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="cuisine">Cuisine</Label>
              <Input
                id="cuisine"
                {...form.register("cuisine")}
                placeholder="e.g., Italian, Asian, Mexican"
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                {...form.register("difficulty")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                aria-describedby="difficulty-help"
              >
                <option value="">Select difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Fast">Fast</option>
                <option value="Long">Long</option>
              </select>
              <p id="difficulty-help" className="sr-only">
                Choose the preparation difficulty level for this recipe.
              </p>
            </div>

            <div>
              <Label htmlFor="baseServings">Base Servings *</Label>
              <Input
                id="baseServings"
                type="number"
                step="0.5"
                min="0.5"
                max="20"
                {...form.register("baseServings", { valueAsNumber: true })}
              />
              {form.formState.errors.baseServings && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.baseServings.message}
                </p>
              )}
            </div>
          </div>

          {/* Utensils */}
          <div>
            <Label>Utensils & Equipment</Label>
            <ChipInput
              value={form.watch("utensils")}
              onChange={(value: string[]) => form.setValue("utensils", value)}
              placeholder="Add utensils (e.g., blender, oven, pan)"
            />
          </div>

          <Separator />

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ingredients</h3>
              <Button
                type="button"
                onClick={() => setShowIngredientPicker(true)}
                variant="outline"
              >
                Add Ingredient
              </Button>
            </div>

            {form.formState.errors.ingredients && (
              <p className="text-sm text-red-600 mb-4">
                {form.formState.errors.ingredients.message}
              </p>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => {
                const ingredient = watchedIngredients[index];
                const data = ingredient
                  ? ingredientData.get(ingredient.ingredientId)
                  : null;

                return (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {data?.name || "Unknown ingredient"}
                        </div>
                        {data && (
                          <div className="text-xs text-gray-600">
                            {data.per100.kcal} kcal/100g • P: {data.per100.p}g •
                            C: {data.per100.c}g • F: {data.per100.f}g
                          </div>
                        )}
                      </div>

                      <div className="w-24">
                        <Input
                          type="number"
                          min="1"
                          max="5000"
                          placeholder="grams"
                          {...form.register(
                            `ingredients.${index}.gramsPerBase`,
                            { valueAsNumber: true },
                          )}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveIngredient(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                );
              })}

              {fields.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-gray-500 mb-4">No ingredients added yet</p>
                  <Button
                    type="button"
                    onClick={() => setShowIngredientPicker(true)}
                  >
                    Add First Ingredient
                  </Button>
                </Card>
              )}
            </div>
          </div>

          <Separator />

          {/* Instructions */}
          <div>
            <Label htmlFor="instructions">Instructions *</Label>
            <textarea
              id="instructions"
              {...form.register("instructions")}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter step-by-step cooking instructions..."
            />
            {form.formState.errors.instructions && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.instructions.message}
              </p>
            )}
          </div>

          <Separator />

          {/* Nutrition Summary */}
          <Card className="p-4 bg-blue-50">
            <h4 className="font-semibold mb-2">Nutrition Per Serving</h4>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold">
                  {formattedNutrition.kcal}
                </div>
                <div className="text-xs text-gray-600">kcal</div>
              </div>
              <div>
                <div className="text-lg font-bold">{formattedNutrition.p}g</div>
                <div className="text-xs text-gray-600">Protein</div>
              </div>
              <div>
                <div className="text-lg font-bold">{formattedNutrition.c}g</div>
                <div className="text-xs text-gray-600">Carbs</div>
              </div>
              <div>
                <div className="text-lg font-bold">{formattedNutrition.f}g</div>
                <div className="text-xs text-gray-600">Fat</div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Update Recipe"
                  : "Create Recipe"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      {/* Ingredient Picker Modal */}
      {showIngredientPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <IngredientPicker
            onSelect={handleAddIngredient}
            onClose={() => setShowIngredientPicker(false)}
          />
        </div>
      )}

      {/* Recipe Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            {isSubmitting ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg font-medium">Saving recipe...</p>
                <p className="text-sm text-gray-600 mt-2">
                  Matching ingredients and creating recipe
                </p>
              </div>
            ) : (
              <RecipeImport
                onSave={handleImportRecipe}
                onCancel={() => setShowImportModal(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
