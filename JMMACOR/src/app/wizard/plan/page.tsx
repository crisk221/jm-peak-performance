'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  getPlan, 
  listRecipes, 
  computeRecipeNutrition, 
  upsertMeal, 
  deleteMeal, 
  autoPopulateMeals, 
  rebalancePlan,
  getCuisines 
} from '@/app/actions/plan';
import { WizardNav } from '@/components/WizardNav';
import { isWithinTolerance, macroEnergy } from '@/lib/nutrition';
import { Trash2, RotateCcw, Scale, Search, ChefHat, Plus, FileDown, ExternalLink } from 'lucide-react';

interface PlanData {
  id: string;
  kcalTarget: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  splitType: string;
  custom: any;
  client: {
    fullName: string;
    includeMeals: string[];
  };
  meals: Array<{
    id: string;
    slot: string;
    servings: number;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    recipe: {
      id: string;
      name: string;
      cuisine: string | null;
    } | null;
  }>;
}

interface Recipe {
  id: string;
  name: string;
  cuisine: string | null;
  baseServings: number;
}

interface SlotTargets {
  [slot: string]: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function PlanPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');
  const planId = searchParams.get('planId');

  const [plan, setPlan] = useState<PlanData | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Swap modal state
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapSlot, setSwapSlot] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('__ALL_CUISINES__');

  const loadData = async () => {
    if (!planId) return;

    try {
      setLoading(true);
      const [planData, recipesData, cuisinesData] = await Promise.all([
        getPlan(planId),
        listRecipes(),
        getCuisines(),
      ]);

      setPlan(planData);
      setRecipes(recipesData);
      setCuisines(cuisinesData);

      // Auto-populate meals if none exist
      if (planData.meals.length === 0 && !isInitialized) {
        await initializeMeals(planData);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Failed to load plan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMeals = async (planData: PlanData) => {
    const slots = planData.client.includeMeals.length > 0 
      ? planData.client.includeMeals 
      : ['Breakfast', 'Lunch', 'Dinner'];

    // Even split across slots
    const slotTargets = calculateSlotTargets(planData, slots);

    try {
      await autoPopulateMeals({
        planId: planData.id,
        slots,
        slotKcalTargets: Object.fromEntries(
          Object.entries(slotTargets).map(([slot, target]) => [slot, target.kcal])
        ),
      });

      // Reload data to show the new meals
      await loadData();
    } catch (error) {
      console.error('Failed to initialize meals:', error);
    }
  };

  const calculateSlotTargets = (planData: PlanData, slots: string[]): SlotTargets => {
    const slotCount = slots.length;
    const targets: SlotTargets = {};

    for (const slot of slots) {
      targets[slot] = {
        kcal: Math.round(planData.kcalTarget / slotCount),
        protein: Math.round(planData.proteinG / slotCount * 10) / 10,
        carbs: Math.round(planData.carbsG / slotCount * 10) / 10,
        fat: Math.round(planData.fatG / slotCount * 10) / 10,
      };
    }

    return targets;
  };

  const updateServings = async (mealId: string, newServings: number) => {
    const meal = plan?.meals.find(m => m.id === mealId);
    if (!meal || !meal.recipe || !plan) return;

    try {
      const nutrition = await computeRecipeNutrition(meal.recipe.id, newServings);
      await upsertMeal({
        planId: plan.id,
        slot: meal.slot,
        recipeId: meal.recipe.id,
        servings: newServings,
        macros: nutrition,
      });

      await loadData();
    } catch (error) {
      console.error('Failed to update servings:', error);
    }
  };

  const swapRecipe = async (newRecipeId: string) => {
    if (!plan || !swapSlot) return;

    const slotTargets = calculateSlotTargets(plan, plan.client.includeMeals);
    const targetKcal = slotTargets[swapSlot]?.kcal || 500;

    try {
      // Calculate optimal servings for the new recipe
      const newRecipe = recipes.find(r => r.id === newRecipeId);
      if (!newRecipe) return;

      const baseNutrition = await computeRecipeNutrition(newRecipeId, 1);
      const optimalServings = Math.max(0.25, Math.min(3.0, 
        Math.round((targetKcal / baseNutrition.kcal) * 4) / 4
      ));

      const finalNutrition = await computeRecipeNutrition(newRecipeId, optimalServings);
      
      await upsertMeal({
        planId: plan.id,
        slot: swapSlot,
        recipeId: newRecipeId,
        servings: optimalServings,
        macros: finalNutrition,
      });

      setSwapModalOpen(false);
      setSwapSlot('');
      await loadData();
    } catch (error) {
      console.error('Failed to swap recipe:', error);
    }
  };

  const removeMeal = async (mealId: string) => {
    try {
      await deleteMeal({ mealId });
      await loadData();
    } catch (error) {
      console.error('Failed to remove meal:', error);
    }
  };

  const rebalanceDay = async () => {
    if (!plan) return;

    try {
      await rebalancePlan({ planId: plan.id });
      await loadData();
    } catch (error) {
      console.error('Failed to rebalance day:', error);
    }
  };

  const exportPdf = async () => {
    if (!plan) return;

    try {
      setIsExportingPdf(true);
      
      const response = await fetch(`/api/print/${plan.id}`);
      
      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or generate one
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'meal-plan.pdf';
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const openPrintPreview = () => {
    if (!plan) return;
    window.open(`/print/${plan.id}`, '_blank');
  };

  const getDayTotals = () => {
    if (!plan) return { kcal: 0, protein: 0, carbs: 0, fat: 0 };

    return plan.meals.reduce(
      (totals, meal) => ({
        kcal: totals.kcal + meal.kcal,
        protein: totals.protein + meal.protein,
        carbs: totals.carbs + meal.carbs,
        fat: totals.fat + meal.fat,
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const getToleranceStatus = () => {
    if (!plan) return { kcal: false, protein: false, carbs: false, fat: false, overall: false };

    const current = getDayTotals();
    const target = {
      kcal: plan.kcalTarget,
      p: plan.proteinG,
      c: plan.carbsG,
      f: plan.fatG,
    };

    return isWithinTolerance(
      { kcal: current.kcal, p: current.protein, c: current.carbs, f: current.fat },
      target
    );
  };

  const getProteinWarning = () => {
    if (!plan) return null;
    
    const current = getDayTotals();
    const target = plan.proteinG;
    const diff = Math.abs(current.protein - target);
    const percentDiff = (diff / target) * 100;
    
    if (percentDiff > 10) {
      const isOver = current.protein > target;
      return {
        message: `Protein ${isOver ? 'over' : 'under'} target by ${Math.round(diff)}g`,
        diff: Math.round(diff),
        isOver,
      };
    }
    
    return null;
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = !searchQuery || 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === '__ALL_CUISINES__' || recipe.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  useEffect(() => {
    loadData();
  }, [planId]);

  if (loading || !plan) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const slots = plan.client.includeMeals.length > 0 
    ? plan.client.includeMeals 
    : ['Breakfast', 'Lunch', 'Dinner'];

  const slotTargets = calculateSlotTargets(plan, slots);
  const dayTotals = getDayTotals();
  const tolerance = getToleranceStatus();
  const proteinWarning = getProteinWarning();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <WizardNav />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Meal Plan</h1>
        <p className="text-muted-foreground">
          Create a personalized meal plan for {plan.client.fullName}
        </p>
      </div>

      {/* Day Totals Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Daily Nutrition Targets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Calories</div>
              <div className={`text-lg font-bold ${tolerance.kcal ? 'text-green-600' : 'text-orange-600'}`}>
                {dayTotals.kcal} / {plan.kcalTarget}
              </div>
              <Badge variant={tolerance.kcal ? 'default' : 'secondary'} className="text-xs">
                {tolerance.kcal ? 'On Target' : 'Adjust'}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Protein</div>
              <div className={`text-lg font-bold ${tolerance.protein ? 'text-green-600' : 'text-orange-600'}`}>
                {Math.round(dayTotals.protein)}g / {plan.proteinG}g
              </div>
              <Badge variant={tolerance.protein ? 'default' : 'secondary'} className="text-xs">
                {tolerance.protein ? 'On Target' : 'Adjust'}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Carbs</div>
              <div className={`text-lg font-bold ${tolerance.carbs ? 'text-green-600' : 'text-orange-600'}`}>
                {Math.round(dayTotals.carbs)}g / {plan.carbsG}g
              </div>
              <Badge variant={tolerance.carbs ? 'default' : 'secondary'} className="text-xs">
                {tolerance.carbs ? 'On Target' : 'Adjust'}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Fat</div>
              <div className={`text-lg font-bold ${tolerance.fat ? 'text-green-600' : 'text-orange-600'}`}>
                {Math.round(dayTotals.fat)}g / {plan.fatG}g
              </div>
              <Badge variant={tolerance.fat ? 'default' : 'secondary'} className="text-xs">
                {tolerance.fat ? 'On Target' : 'Adjust'}
              </Badge>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={rebalanceDay}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Rebalance Day
            </Button>
            <Button 
              variant="outline" 
              onClick={openPrintPreview}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Preview
            </Button>
            <Button 
              onClick={exportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              {isExportingPdf ? 'Generating...' : 'Export PDF'}
            </Button>
            <Badge 
              variant={tolerance.overall ? 'default' : 'destructive'}
              className="flex items-center gap-1"
            >
              {tolerance.overall ? '✓ All targets met' : '⚠ Needs adjustment'}
            </Badge>
            {proteinWarning && (
              <Badge 
                variant="outline"
                className="flex items-center gap-1 border-orange-200 text-orange-700 bg-orange-50"
              >
                ⚠ {proteinWarning.message}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Meal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map(slot => {
          const meal = plan.meals.find(m => m.slot === slot);
          const target = slotTargets[slot];

          return (
            <Card key={slot} className="relative">
              <CardHeader>
                <CardTitle className="text-lg">{slot}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Target: {target.kcal} kcal
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {meal ? (
                  <>
                    <div className="space-y-2">
                      <div className="font-medium">{meal.recipe?.name}</div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm">Servings:</label>
                        <Input
                          type="number"
                          step="0.25"
                          min="0.25"
                          max="3"
                          value={meal.servings}
                          onChange={(e) => updateServings(meal.id, parseFloat(e.target.value) || 0.25)}
                          className="w-20 h-8"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Nutrition:</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>{meal.kcal} kcal</div>
                        <div>{Math.round(meal.protein)}g protein</div>
                        <div>{Math.round(meal.carbs)}g carbs</div>
                        <div>{Math.round(meal.fat)}g fat</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSwapSlot(slot);
                          setSwapModalOpen(true);
                        }}
                        className="flex items-center gap-1"
                      >
                        <ChefHat className="h-3 w-3" />
                        Swap
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMeal(meal.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ChefHat className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">No meal assigned</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setSwapSlot(slot);
                        setSwapModalOpen(true);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Meal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Swap Recipe Modal */}
      {swapModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader>
              <CardTitle>Choose Recipe for {swapSlot}</CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All cuisines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__ALL_CUISINES__">All cuisines</SelectItem>
                    {cuisines.map(cuisine => (
                      <SelectItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-96">
              <div className="space-y-2">
                {filteredRecipes.map(recipe => (
                  <div
                    key={recipe.id}
                    className="border rounded-lg p-3 hover:bg-muted cursor-pointer"
                    onClick={() => swapRecipe(recipe.id)}
                  >
                    <div className="font-medium">{recipe.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {recipe.cuisine} • {recipe.baseServings} serving{recipe.baseServings !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setSwapModalOpen(false);
                  setSwapSlot('');
                  setSearchQuery('');
                  setSelectedCuisine('__ALL_CUISINES__');
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button 
          size="lg" 
          disabled={!tolerance.overall}
          className="min-w-32"
        >
          Continue to PDF
        </Button>
      </div>
    </div>
  );
}
