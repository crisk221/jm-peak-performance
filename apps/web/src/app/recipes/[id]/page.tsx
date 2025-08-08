"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "../../../lib/trpc";
import { Protected } from "../../../components/auth/protected";
import { LoadingSpinner } from "../../../components/ui/loading-spinner";
import { ErrorState } from "../../../components/ui/error-state";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id as string;
  const [isExporting, setIsExporting] = useState(false);

  const recipeQuery = trpc.recipe.getById.useQuery({ id: recipeId });

  const deleteRecipe = trpc.recipe.delete.useMutation({
    onSuccess: () => {
      alert("Recipe deleted successfully");
      router.push("/recipes");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleDelete = () => {
    if (
      recipeQuery.data &&
      confirm(`Are you sure you want to delete "${recipeQuery.data.title}"?`)
    ) {
      deleteRecipe.mutate({ id: recipeId });
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/exports/recipe/${recipeId}`);

      if (!response.ok) {
        throw new Error("Failed to export PDF");
      }

      // Create a blob and download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recipe-${recipeId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert("Failed to export PDF. Please try again.");
      console.error("PDF export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "text-green-600 bg-green-50";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50";
      case "HARD":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case "BREAKFAST":
        return "🌅";
      case "LUNCH":
        return "🌞";
      case "DINNER":
        return "🌙";
      case "SNACK":
        return "🍎";
      default:
        return "🍽️";
    }
  };

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case "GRAMS":
        return "g";
      case "KILOGRAMS":
        return "kg";
      case "MILLILITERS":
        return "ml";
      case "LITERS":
        return "l";
      case "CUPS":
        return "cup";
      case "TABLESPOONS":
        return "tbsp";
      case "TEASPOONS":
        return "tsp";
      case "PIECES":
        return "pc";
      default:
        return unit.toLowerCase();
    }
  };

  return (
    <Protected>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/recipes"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            ← Back to Recipes
          </Link>
          <div className="flex gap-2">
            {recipeQuery.data && (
              <>
                <Button
                  variant="outline"
                  onClick={handleExportPdf}
                  disabled={isExporting}
                  className="flex items-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Exporting...
                    </>
                  ) : (
                    <>📄 Export PDF</>
                  )}
                </Button>
                <Link
                  href={`/recipes/${recipeId}/edit`}
                  className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
                >
                  Edit Recipe
                </Link>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteRecipe.isLoading}
                >
                  Delete Recipe
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {recipeQuery.isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner aria-label="Loading recipe..." />
          </div>
        )}

        {recipeQuery.error && (
          <ErrorState
            title="Failed to load recipe"
            message={recipeQuery.error.message}
            onRetry={() => recipeQuery.refetch()}
          />
        )}

        {recipeQuery.data && (
          <div className="space-y-8">
            {/* Recipe Header */}
            <div>
              <h1 className="mb-4 text-4xl font-bold text-gray-900">
                {getMealTypeIcon(recipeQuery.data.mealType)}{" "}
                {recipeQuery.data.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Servings:</span>
                  <span>{recipeQuery.data.servings}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Time:</span>
                  <span>{recipeQuery.data.timeMinutes} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Difficulty:</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getDifficultyColor(recipeQuery.data.difficulty)}`}
                  >
                    {recipeQuery.data.difficulty.toLowerCase()}
                  </span>
                </div>
              </div>

              {recipeQuery.data.description && (
                <p className="mt-4 text-lg text-gray-700">
                  {recipeQuery.data.description}
                </p>
              )}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Ingredients */}
              <Card>
                <CardHeader>
                  <CardTitle>Ingredients</CardTitle>
                  <CardDescription>
                    {recipeQuery.data.ingredients?.length || 0} ingredients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recipeQuery.data.ingredients &&
                  recipeQuery.data.ingredients.length > 0 ? (
                    <ul className="space-y-3">
                      {recipeQuery.data.ingredients.map(
                        (recipeIngredient: any) => (
                          <li
                            key={recipeIngredient.id}
                            className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0"
                          >
                            <span className="font-medium">
                              {recipeIngredient.ingredient.name}
                            </span>
                            <span className="text-gray-600">
                              {recipeIngredient.quantity}{" "}
                              {getUnitLabel(recipeIngredient.unit)}
                              {recipeIngredient.note && (
                                <span className="ml-2 text-sm text-gray-500">
                                  ({recipeIngredient.note})
                                </span>
                              )}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No ingredients specified</p>
                  )}
                </CardContent>
              </Card>

              {/* Utensils & Tags */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Required Utensils</CardTitle>
                    <CardDescription>
                      {recipeQuery.data.utensils?.length || 0} utensils
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recipeQuery.data.utensils &&
                    recipeQuery.data.utensils.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {recipeQuery.data.utensils.map((recipeUtensil: any) => (
                          <span
                            key={recipeUtensil.id}
                            className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                          >
                            {recipeUtensil.utensil.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No specific utensils required
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                    <CardDescription>
                      {recipeQuery.data.tags?.length || 0} tags
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recipeQuery.data.tags &&
                    recipeQuery.data.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {recipeQuery.data.tags.map((recipeTag: any) => (
                          <span
                            key={recipeTag.id}
                            className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
                          >
                            {recipeTag.tag.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No tags assigned</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {recipeQuery.data.instructions}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Protected>
  );
}
