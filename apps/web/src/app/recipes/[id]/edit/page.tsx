"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "../../../../lib/trpc";
import { Protected } from "../../../../components/auth/protected";
import { LoadingSpinner } from "../../../../components/ui/loading-spinner";
import { ErrorState } from "../../../../components/ui/error-state";
import { RecipeForm } from "../../../../components/recipes/recipe-form";

export default function EditRecipePage() {
  const params = useParams();
  const recipeId = params.id as string;

  const recipeQuery = trpc.recipe.getById.useQuery({ id: recipeId });

  if (recipeQuery.isLoading) {
    return (
      <Protected>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center py-8">
            <LoadingSpinner aria-label="Loading recipe..." />
          </div>
        </div>
      </Protected>
    );
  }

  if (recipeQuery.error) {
    return (
      <Protected>
        <div className="container mx-auto px-4 py-8">
          <ErrorState
            title="Failed to load recipe"
            message={recipeQuery.error.message}
            onRetry={() => recipeQuery.refetch()}
          />
        </div>
      </Protected>
    );
  }

  if (!recipeQuery.data) {
    return (
      <Protected>
        <div className="container mx-auto px-4 py-8">
          <div className="py-8 text-center">
            <p className="text-gray-500">Recipe not found</p>
          </div>
        </div>
      </Protected>
    );
  }

  // Transform recipe data for the form
  const initialData = {
    title: recipeQuery.data.title,
    description: recipeQuery.data.description || "",
    instructions: recipeQuery.data.instructions,
    servings: recipeQuery.data.servings,
    timeMinutes: recipeQuery.data.timeMinutes,
    mealType: recipeQuery.data.mealType as
      | "BREAKFAST"
      | "LUNCH"
      | "DINNER"
      | "SNACK",
    difficulty: recipeQuery.data.difficulty as "EASY" | "MEDIUM" | "HARD",
    ingredients:
      recipeQuery.data.ingredients?.map((ri: any) => ({
        ingredientId: ri.ingredientId,
        quantity: ri.quantity,
        unit: ri.unit,
        note: ri.note || "",
      })) || [],
    utensilIds: recipeQuery.data.utensils?.map((ru: any) => ru.utensilId) || [],
    tagIds: recipeQuery.data.tags?.map((rt: any) => rt.tagId) || [],
  };

  return (
    <Protected>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href={`/recipes/${recipeId}`}
              className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              ← Back to Recipe
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Recipe</h1>
            <p className="text-gray-600">Update "{recipeQuery.data.title}"</p>
          </div>
        </div>

        {/* Form */}
        <RecipeForm recipeId={recipeId} initialData={initialData} />
      </div>
    </Protected>
  );
}
