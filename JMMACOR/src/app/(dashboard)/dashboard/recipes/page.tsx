'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { listRecipes, deleteRecipe, duplicateRecipe } from '@/app/actions/recipes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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

const cuisineOptions = ['Italian', 'Asian', 'Mexican', 'American', 'Mediterranean', 'Indian', 'Thai', 'French'];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const result = await listRecipes({
        q: searchQuery,
        cuisine: selectedCuisine,
        page,
        pageSize
      });
      setRecipes(result.items);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load recipes:', error);
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
        console.error('Delete failed:', error);
        alert('Failed to delete recipe');
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateRecipe(id);
      await loadRecipes(); // Refresh list
    } catch (error) {
      console.error('Duplicate failed:', error);
      alert('Failed to duplicate recipe');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Recipes</h2>
            <p className="text-gray-600">
              Manage your meal recipes and nutrition information.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/recipes/new">New Recipe</Link>
          </Button>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Search and Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search recipes by title or cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCuisine === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCuisine('')}
            >
              All
            </Button>
            {cuisineOptions.map((cuisine) => (
              <Button
                key={cuisine}
                variant={selectedCuisine === cuisine ? 'default' : 'outline'}
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
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">🍳</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery || selectedCuisine ? 'No recipes found' : 'No recipes yet'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchQuery || selectedCuisine 
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first recipe to get started with meal planning.'
            }
          </p>
          <Button asChild>
            <Link href="/dashboard/recipes/new">Create First Recipe</Link>
          </Button>
        </Card>
      ) : (
        <>
          {/* Recipe Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cuisine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nutrition/Serving
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recipes.map((recipe) => (
                    <tr key={recipe.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {recipe.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {recipe.cuisine ? (
                          <Badge variant="secondary">{recipe.cuisine}</Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {recipe.baseServings}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium">{recipe.kcalPerServing} kcal</div>
                          <div className="text-gray-600">
                            P: {recipe.proteinPerServing}g • 
                            C: {recipe.carbsPerServing}g • 
                            F: {recipe.fatPerServing}g
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/recipes/${recipe.id}`}>Edit</Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicate(recipe.id)}
                          >
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(recipe.id, recipe.name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} recipes
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
