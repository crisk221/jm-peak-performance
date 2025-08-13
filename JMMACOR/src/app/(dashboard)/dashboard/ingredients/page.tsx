'use client';

import { useState, useEffect } from 'react';
import { listIngredients, deleteIngredient } from '@/app/actions/ingredients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';
import Link from 'next/link';

interface Ingredient {
  id: string;
  name: string;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  allergens: string[];
}

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { addToast } = useToast();

  const loadIngredients = async (search?: string, page: number = 1) => {
    try {
      setLoading(true);
      const result = await listIngredients(search, page, 20);
      setIngredients(result.ingredients);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (error) {
      addToast('Failed to load ingredients', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        loadIngredients(searchTerm, 1);
      } else {
        loadIngredients(undefined, 1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      setDeleting(id);
      await deleteIngredient(id);
      addToast('Ingredient deleted successfully', 'success');
      loadIngredients(searchTerm, currentPage);
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : 'Failed to delete ingredient',
        'error'
      );
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ingredients</h1>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/ingredients/import">
            <Button variant="outline">
              Import CSV/Excel
            </Button>
          </Link>
          <Link href="/dashboard/ingredients/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ingredient Library</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading ingredients...</div>
          ) : ingredients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No ingredients found matching your search.' : 'No ingredients yet. Add your first ingredient!'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Calories/100g</TableHead>
                    <TableHead>Protein/100g</TableHead>
                    <TableHead>Carbs/100g</TableHead>
                    <TableHead>Fat/100g</TableHead>
                    <TableHead>Allergens</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredients.map((ingredient) => (
                    <TableRow key={ingredient.id}>
                      <TableCell className="font-medium">{ingredient.name}</TableCell>
                      <TableCell>{ingredient.kcalPer100g.toFixed(1)}</TableCell>
                      <TableCell>{ingredient.proteinPer100g.toFixed(1)}g</TableCell>
                      <TableCell>{ingredient.carbsPer100g.toFixed(1)}g</TableCell>
                      <TableCell>{ingredient.fatPer100g.toFixed(1)}g</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {ingredient.allergens.map((allergen) => (
                            <Badge key={allergen} variant="secondary" className="text-xs">
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/ingredients/${ingredient.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(ingredient.id, ingredient.name)}
                            disabled={deleting === ingredient.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadIngredients(searchTerm, currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadIngredients(searchTerm, currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
