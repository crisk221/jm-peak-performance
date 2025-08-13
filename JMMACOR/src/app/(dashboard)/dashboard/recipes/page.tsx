"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  listRecipes,
  deleteRecipe,
  duplicateRecipe,
} from "@/app/actions/recipes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/section-header";
import { EmptyState } from "@/components/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChefHat, Search, Plus, Edit, Copy, Trash2 } from "lucide-react";

interface Recipe {
  id: string;
  name: string;
  cuisine: string | null;
  baseServings: number;
  kcalPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  createdAt: Date;
}

const cuisineOptions = [
  "Italian",
  "Asian",
  "Mexican",
  "American",
  "Mediterranean",
  "Indian",
  "Thai",
  "French",
];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const result = await listRecipes({
        q: searchQuery,
        cuisine: selectedCuisine,
        page,
        pageSize,
      });
      setRecipes(result.items);
      setTotal(result.total);
    } catch (error) {
      console.error("Failed to load recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [searchQuery, selectedCuisine, page]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete recipe "${name}"? This cannot be undone.`)) {
      try {
        await deleteRecipe(id);
        await loadRecipes(); // Refresh list
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete recipe");
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateRecipe(id);
      await loadRecipes(); // Refresh list
    } catch (error) {
      console.error("Duplicate failed:", error);
      alert("Failed to duplicate recipe");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader
        title="Recipes"
        description="Manage your recipe database and nutrition information"
      >
        <Button asChild>
          <Link href="/dashboard/recipes/new">
            <Plus className="h-4 w-4 mr-2" />
            New Recipe
          </Link>
        </Button>
      </SectionHeader>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite" />
            <Input
              placeholder="Search recipes by title or cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCuisine === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCuisine("")}
            >
              All
            </Button>
            {cuisineOptions.map((cuisine) => (
              <Button
                key={cuisine}
                variant={selectedCuisine === cuisine ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCuisine(cuisine)}
              >
                {cuisine}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Results */}
      {loading ? (
        <Card className="p-8 text-center">
          <div className="text-lg">Loading recipes...</div>
        </Card>
      ) : recipes.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title={
            searchQuery || selectedCuisine
              ? "No recipes found"
              : "No recipes yet"
          }
          body={
            searchQuery || selectedCuisine
              ? "Try adjusting your search or filter criteria."
              : "Create your first recipe to get started with meal planning."
          }
          primary={{
            label: "Create First Recipe",
            onClick: () => (window.location.href = "/dashboard/recipes/new"),
          }}
        />
      ) : (
        <>
          {/* Recipe Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipe</TableHead>
                  <TableHead>Cuisine</TableHead>
                  <TableHead>Servings</TableHead>
                  <TableHead>Nutrition/Serving</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipes.map((recipe) => (
                  <TableRow key={recipe.id}>
                    <TableCell>
                      <div className="font-medium text-ink dark:text-paper">
                        {recipe.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {recipe.cuisine ? (
                        <Badge variant="secondary">{recipe.cuisine}</Badge>
                      ) : (
                        <span className="text-graphite dark:text-paper/50">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-ink dark:text-paper">
                      {recipe.baseServings}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-ink dark:text-paper">
                          {recipe.kcalPerServing} kcal
                        </div>
                        <div className="text-graphite dark:text-paper/70">
                          P: {recipe.proteinPerServing}g • C:{" "}
                          {recipe.carbsPerServing}g • F: {recipe.fatPerServing}g
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/recipes/${recipe.id}`}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicate(recipe.id)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(recipe.id, recipe.name)}
                          className="text-danger hover:text-danger border-danger/20 hover:border-danger/30"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-graphite dark:text-paper/70">
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, total)} of {total} recipes
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
