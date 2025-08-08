"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "../../lib/trpc";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { LoadingSpinner } from "../ui/loading-spinner";

// Form schema
const recipeFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(1000).optional(),
  instructions: z.string().min(1, "Instructions are required"),
  servings: z.number().int().min(1).max(100),
  timeMinutes: z.number().int().min(1).max(1440),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  ingredients: z.array(
    z.object({
      ingredientId: z.string().min(1, "Ingredient is required"),
      quantity: z.number().nonnegative(),
      unit: z.enum([
        "GRAMS",
        "KILOGRAMS",
        "MILLILITERS",
        "LITERS",
        "CUPS",
        "TABLESPOONS",
        "TEASPOONS",
        "PIECES",
      ]),
      note: z.string().optional(),
    })
  ),
  utensilIds: z.array(z.string()),
  tagIds: z.array(z.string()),
});

type RecipeFormData = z.infer<typeof recipeFormSchema>;

interface RecipeFormProps {
  recipeId?: string;
  initialData?: Partial<RecipeFormData>;
}

export function RecipeForm({ recipeId, initialData }: RecipeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch helper data
  const ingredientsQuery = trpc.recipe.ingredients.useQuery();
  const utensilsQuery = trpc.recipe.utensils.useQuery();
  const tagsQuery = trpc.recipe.tags.useQuery();

  // Mutations
  const createRecipe = trpc.recipe.create.useMutation();
  const updateRecipe = trpc.recipe.update.useMutation();

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      instructions: "",
      servings: 1,
      timeMinutes: 30,
      mealType: "LUNCH",
      difficulty: "MEDIUM",
      ingredients: [{ ingredientId: "", quantity: 0, unit: "GRAMS", note: "" }],
      utensilIds: [],
      tagIds: [],
      ...initialData,
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const onSubmit = async (data: RecipeFormData) => {
    try {
      setIsSubmitting(true);

      if (recipeId) {
        // Update existing recipe
        const result = await updateRecipe.mutateAsync({
          id: recipeId,
          ...data,
        });
        alert("Recipe updated successfully!");
        router.push(`/recipes/${result.id}`);
      } else {
        // Create new recipe
        const result = await createRecipe.mutateAsync(data);
        alert("Recipe created successfully!");
        router.push(`/recipes/${result.id}`);
      }
    } catch (error) {
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case "GRAMS":
        return "Grams (g)";
      case "KILOGRAMS":
        return "Kilograms (kg)";
      case "MILLILITERS":
        return "Milliliters (ml)";
      case "LITERS":
        return "Liters (l)";
      case "CUPS":
        return "Cups";
      case "TABLESPOONS":
        return "Tablespoons (tbsp)";
      case "TEASPOONS":
        return "Teaspoons (tsp)";
      case "PIECES":
        return "Pieces";
      default:
        return unit;
    }
  };

  if (
    ingredientsQuery.isLoading ||
    utensilsQuery.isLoading ||
    tagsQuery.isLoading
  ) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner aria-label="Loading form data..." />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title *
            </label>
            <Input {...form.register("title")} placeholder="Recipe title" />
            {form.formState.errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...form.register("description")}
              placeholder="Brief description of the recipe"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Servings *
              </label>
              <Input
                {...form.register("servings", { valueAsNumber: true })}
                type="number"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Time (minutes) *
              </label>
              <Input
                {...form.register("timeMinutes", { valueAsNumber: true })}
                type="number"
                min="1"
                max="1440"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Meal Type *
              </label>
              <select
                {...form.register("mealType")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BREAKFAST">🌅 Breakfast</option>
                <option value="LUNCH">🌞 Lunch</option>
                <option value="DINNER">🌙 Dinner</option>
                <option value="SNACK">🍎 Snack</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Difficulty *
              </label>
              <select
                {...form.register("difficulty")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ingredients</CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendIngredient({
                  ingredientId: "",
                  quantity: 0,
                  unit: "GRAMS",
                  note: "",
                })
              }
            >
              Add Ingredient
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {ingredientFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 items-end gap-4">
              <div className="col-span-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Ingredient
                </label>
                <select
                  {...form.register(`ingredients.${index}.ingredientId`)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select ingredient...</option>
                  {ingredientsQuery.data?.map((ingredient: any) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <Input
                  {...form.register(`ingredients.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                />
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Unit
                </label>
                <select
                  {...form.register(`ingredients.${index}.unit`)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[
                    "GRAMS",
                    "KILOGRAMS",
                    "MILLILITERS",
                    "LITERS",
                    "CUPS",
                    "TABLESPOONS",
                    "TEASPOONS",
                    "PIECES",
                  ].map((unit) => (
                    <option key={unit} value={unit}>
                      {getUnitLabel(unit)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Note
                </label>
                <Input
                  {...form.register(`ingredients.${index}.note`)}
                  placeholder="Optional note"
                />
              </div>

              <div className="col-span-1">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredientFields.length === 1}
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Utensils */}
      <Card>
        <CardHeader>
          <CardTitle>Required Utensils</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {utensilsQuery.data?.map((utensil: any) => (
              <label key={utensil.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={utensil.id}
                  {...form.register("utensilIds")}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{utensil.name}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {tagsQuery.data?.map((tag: any) => (
              <label key={tag.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={tag.id}
                  {...form.register("tagIds")}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{tag.name}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            {...form.register("instructions")}
            placeholder="Step-by-step cooking instructions..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={8}
          />
          {form.formState.errors.instructions && (
            <p className="mt-1 text-sm text-red-600">
              {form.formState.errors.instructions.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : recipeId
              ? "Update Recipe"
              : "Create Recipe"}
        </Button>
      </div>
    </form>
  );
}
