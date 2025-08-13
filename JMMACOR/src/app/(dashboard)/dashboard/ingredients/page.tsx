"use client";

import { useState, useEffect } from "react";
import { listIngredients, deleteIngredient } from "@/app/actions/ingredients";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/page-layout";
import { EmptyState } from "@/components/empty-state";
import { Plus, Search, Edit, Trash2, Carrot, Upload } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";
import Link from "next/link";

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
  const [searchTerm, setSearchTerm] = useState("");
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
      addToast("Failed to load ingredients", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== "") {
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
      addToast("Ingredient deleted successfully", "success");
      loadIngredients(searchTerm, currentPage);
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Failed to delete ingredient",
        "error",
      );
    } finally {
      setDeleting(null);
    }
  };

  return (
    <PageLayout
      title="Ingredients"
      subtitle="Manage your ingredient library and nutrition database"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild className="focus-ring">
            <Link href="/dashboard/ingredients/import">
              <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
              Import CSV/Excel
            </Link>
          </Button>
          <Button asChild className="focus-ring">
            <Link href="/dashboard/ingredients/new">
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Add Ingredient
            </Link>
          </Button>
        </div>
      }
    >
      <Card className="rounded-lg border border-border shadow-card">
        <CardHeader>
          <CardTitle>Ingredient Library</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-graphite dark:text-graphite h-4 w-4"
                aria-hidden="true"
              />
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
            searchTerm ? (
              <EmptyState
                icon={Carrot}
                title="No ingredients found"
                body="No ingredients found matching your search."
                primary={{
                  label: "Add Ingredient",
                  onClick: () =>
                    (window.location.href = "/dashboard/ingredients/new"),
                }}
              />
            ) : (
              <EmptyState
                icon={Carrot}
                title="No ingredients yet"
                body="Add your first ingredient to start building your nutrition database!"
                primary={{
                  label: "Add Ingredient",
                  onClick: () =>
                    (window.location.href = "/dashboard/ingredients/new"),
                }}
                secondary={{
                  label: "Import from CSV",
                  onClick: () =>
                    (window.location.href = "/dashboard/ingredients/import"),
                }}
              />
            )
          ) : (
            <>
              <Table>
                <caption className="sr-only">
                  List of ingredients with nutritional information and available
                  actions
                </caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Name</TableHead>
                    <TableHead scope="col" className="text-right">
                      Calories/100g
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Protein/100g
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Carbs/100g
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                      Fat/100g
                    </TableHead>
                    <TableHead scope="col">Allergens</TableHead>
                    <TableHead scope="col" className="w-[100px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredients.map((ingredient) => (
                    <TableRow key={ingredient.id}>
                      <TableCell className="font-medium">
                        {ingredient.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {ingredient.kcalPer100g.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        {ingredient.proteinPer100g.toFixed(1)}g
                      </TableCell>
                      <TableCell className="text-right">
                        {ingredient.carbsPer100g.toFixed(1)}g
                      </TableCell>
                      <TableCell className="text-right">
                        {ingredient.fatPer100g.toFixed(1)}g
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {ingredient.allergens.map((allergen) => (
                            <Badge
                              key={allergen}
                              variant="secondary"
                              className="text-xs"
                            >
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="flex items-center space-x-2"
                          role="group"
                          aria-label={`Actions for ${ingredient.name}`}
                        >
                          <Link
                            href={`/dashboard/ingredients/${ingredient.id}`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="focus-ring min-h-[40px]"
                              aria-label={`Edit ${ingredient.name}`}
                            >
                              <Edit className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDelete(ingredient.id, ingredient.name)
                            }
                            disabled={deleting === ingredient.id}
                            className="focus-ring min-h-[40px]"
                            aria-label={`Delete ${ingredient.name}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
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
    </PageLayout>
  );
}
