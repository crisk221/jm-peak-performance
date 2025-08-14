"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Globe,
  ChefHat,
  Clock,
  Users,
  AlertCircle,
  Check,
  Edit,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ExtractedRecipe } from "@/lib/recipe-extract";

interface RecipeImportProps {
  onSave?: (recipe: ExtractedRecipe) => Promise<void>;
  onCancel?: () => void;
}

export function RecipeImport({ onSave, onCancel }: RecipeImportProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedRecipe, setExtractedRecipe] =
    useState<ExtractedRecipe | null>(null);
  const [editing, setEditing] = useState(false);

  const handleImport = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/recipes/import-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import recipe");
      }

      setExtractedRecipe(data.recipe);
      setEditing(true); // Automatically enter edit mode
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!extractedRecipe || !onSave) return;

    try {
      await onSave(extractedRecipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save recipe");
    }
  };

  const handleCancel = () => {
    setUrl("");
    setExtractedRecipe(null);
    setEditing(false);
    setError(null);
    onCancel?.();
  };

  if (!extractedRecipe) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Import Recipe from URL
          </CardTitle>
          <CardDescription>
            Paste a recipe URL to automatically extract ingredients and
            instructions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="recipe-url">Recipe URL</Label>
            <Input
              id="recipe-url"
              type="url"
              placeholder="https://example.com/recipe"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={!url.trim() || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <ChefHat className="mr-2 h-4 w-4" />
                  Import Recipe
                </>
              )}
            </Button>

            {onCancel && (
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Recipe Preview
              </CardTitle>
              <CardDescription>
                Review and edit the imported recipe before saving
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(!editing)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {editing ? "View" : "Edit"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipe-title">Title</Label>
                {editing ? (
                  <Input
                    id="recipe-title"
                    value={extractedRecipe.title || ""}
                    onChange={(e) =>
                      setExtractedRecipe({
                        ...extractedRecipe,
                        title: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="text-sm">
                    {extractedRecipe.title || "No title"}
                  </p>
                )}
              </div>

              {extractedRecipe.cuisine && (
                <div className="space-y-2">
                  <Label htmlFor="recipe-cuisine">Cuisine</Label>
                  {editing ? (
                    <Input
                      id="recipe-cuisine"
                      value={extractedRecipe.cuisine}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setExtractedRecipe({
                          ...extractedRecipe,
                          cuisine: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {extractedRecipe.cuisine}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipe-servings">Servings</Label>
                  {editing ? (
                    <Input
                      id="recipe-servings"
                      type="number"
                      min="1"
                      value={extractedRecipe.servings || ""}
                      onChange={(e) =>
                        setExtractedRecipe({
                          ...extractedRecipe,
                          servings: parseInt(e.target.value) || undefined,
                        })
                      }
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      {extractedRecipe.servings || "Not specified"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Prep + Cook Time</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {extractedRecipe.totalTimeMins
                      ? `${extractedRecipe.totalTimeMins} min`
                      : "Not specified"}
                  </div>
                </div>
              </div>

              {extractedRecipe.image && (
                <div className="space-y-2">
                  <Label>Image</Label>
                  <img
                    src={extractedRecipe.image}
                    alt={extractedRecipe.title || "Recipe"}
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nutrition */}
          {extractedRecipe.nutrition && (
            <Card>
              <CardHeader>
                <CardTitle>Nutrition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {extractedRecipe.nutrition.kcal && (
                    <div>
                      <span className="font-medium">Calories:</span>{" "}
                      {extractedRecipe.nutrition.kcal}
                    </div>
                  )}
                  {extractedRecipe.nutrition.proteinG && (
                    <div>
                      <span className="font-medium">Protein:</span>{" "}
                      {extractedRecipe.nutrition.proteinG}g
                    </div>
                  )}
                  {extractedRecipe.nutrition.carbsG && (
                    <div>
                      <span className="font-medium">Carbs:</span>{" "}
                      {extractedRecipe.nutrition.carbsG}g
                    </div>
                  )}
                  {extractedRecipe.nutrition.fatG && (
                    <div>
                      <span className="font-medium">Fat:</span>{" "}
                      {extractedRecipe.nutrition.fatG}g
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Ingredients & Instructions */}
        <div className="space-y-6">
          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>
                {extractedRecipe.ingredients.length} ingredients found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {extractedRecipe.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-medium">
                        {ingredient.name || "Unknown ingredient"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Original: "{ingredient.raw}"
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {ingredient.qty && ingredient.unit && (
                          <Badge variant="outline">
                            {ingredient.qty} {ingredient.unit}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
              <CardDescription>
                {extractedRecipe.steps.length} steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {extractedRecipe.steps.map((step: string, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      {editing ? (
                        <Textarea
                          value={step}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>,
                          ) => {
                            const newSteps = [...extractedRecipe.steps];
                            newSteps[index] = e.target.value;
                            setExtractedRecipe({
                              ...extractedRecipe,
                              steps: newSteps,
                            });
                          }}
                          rows={2}
                        />
                      ) : (
                        <p className="text-sm">{step}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleCancel}>
              Discard
            </Button>

            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Check className="h-4 w-4 mr-2" />
                Save Recipe
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
