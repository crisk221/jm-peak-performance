"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "../../lib/trpc";
import { Protected } from "../../components/auth/protected";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { ErrorState } from "../../components/ui/error-state";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

export default function RecipesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter();

  const recipesQuery = trpc.recipe.list.useQuery({
    search: search || undefined,
    page,
    pageSize: 12,
  });

  const deleteRecipe = trpc.recipe.delete.useMutation({
    onSuccess: () => {
      alert("Recipe deleted successfully");
      recipesQuery.refetch();
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteRecipe.mutate({ id });
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

  return (
    <Protected>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
            <p className="text-gray-600">Manage your recipe collection</p>
          </div>
          <Link
            href="/recipes/new"
            className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            New Recipe
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page when searching
            }}
            className="max-w-md"
          />
        </div>

        {/* Content */}
        {recipesQuery.isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner aria-label="Loading recipes..." />
          </div>
        )}

        {recipesQuery.error && (
          <ErrorState
            title="Failed to load recipes"
            message={recipesQuery.error.message}
            onRetry={() => recipesQuery.refetch()}
          />
        )}

        {recipesQuery.data && (
          <>
            {/* Recipe Grid */}
            {recipesQuery.data.recipes.length === 0 ? (
              <div className="py-12 text-center">
                <p className="mb-4 text-gray-500">
                  {search
                    ? "No recipes found matching your search."
                    : "No recipes yet."}
                </p>
                <Link
                  href="/recipes/new"
                  className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Create your first recipe
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recipesQuery.data.recipes.map((recipe: any) => (
                  <Card
                    key={recipe.id}
                    className="transition-shadow hover:shadow-md"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-2 text-lg">
                            {getMealTypeIcon(recipe.mealType)} {recipe.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {recipe.servings} serving
                            {recipe.servings !== 1 ? "s" : ""} •{" "}
                            {recipe.timeMinutes} min
                          </CardDescription>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}
                        >
                          {recipe.difficulty.toLowerCase()}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Link
                          href={`/recipes/${recipe.id}`}
                          className="inline-flex h-9 flex-1 items-center justify-center whitespace-nowrap rounded-md bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                          View
                        </Link>
                        <Link
                          href={`/recipes/${recipe.id}/edit`}
                          className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 text-sm font-medium transition-colors hover:bg-gray-50"
                        >
                          Edit
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(recipe.id, recipe.title)}
                          disabled={deleteRecipe.isLoading}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {recipesQuery.data.pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {recipesQuery.data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === recipesQuery.data.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Protected>
  );
}
