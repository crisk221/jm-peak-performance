"use client";

import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, FileText, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { trpc } from "../../../../lib/trpc";
import { Button } from "../../../../../components/ui/button";
import { Card } from "../../../../../components/ui/card";
import { LoadingSpinner } from "../../../../components/ui/loading-spinner";

type MealPlanDetailPageProps = {
  params: {
    id: string;
  };
};

export default function MealPlanDetailPage({ params }: MealPlanDetailPageProps) {
  const router = useRouter();
  const { id } = params;
  const [isExporting, setIsExporting] = useState(false);

  const { data: mealPlan, isLoading } = trpc.mealPlan.getById.useQuery({ id });

  const deleteMutation = trpc.mealPlan.delete.useMutation({
    onSuccess: () => {
      toast.success("Meal plan deleted successfully!");
      router.push("/dashboard/meal-plans");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleDelete = async () => {
    if (!mealPlan) return;
    
    if (confirm("Are you sure you want to delete this meal plan? This action cannot be undone.")) {
      deleteMutation.mutate({ id: mealPlan.id });
    }
  };

  const handleExportPdf = async () => {
    if (!mealPlan) return;
    
    setIsExporting(true);
    try {
      // Download PDF from route handler
      const response = await fetch(`/api/exports/meal-plan/${mealPlan.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${mealPlan.client.name}-meal-plan.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const groupItemsByDay = (items: any[]) => {
    const grouped: { [key: number]: any[] } = {};
    items.forEach(item => {
      if (!grouped[item.dayNumber]) {
        grouped[item.dayNumber] = [];
      }
      grouped[item.dayNumber].push(item);
    });
    return grouped;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  if (!mealPlan) {
    notFound();
  }

  const dayGroups = groupItemsByDay(mealPlan.items);
  const startDate = new Date(mealPlan.startDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{mealPlan.client.name}'s Meal Plan</h1>
            <p className="text-gray-600 mt-1">
              {mealPlan.days} days starting {formatDate(mealPlan.startDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleExportPdf}
            disabled={isExporting}
            aria-label={isExporting ? "Generating PDF..." : "Export meal plan as PDF"}
          >
            {isExporting ? (
              <LoadingSpinner className="w-4 h-4 mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isExporting ? "Generating..." : "Export PDF"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isLoading}
            aria-label="Delete meal plan"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Plan Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Plan Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Client</label>
            <p className="text-lg">{mealPlan.client.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Duration</label>
            <p className="text-lg">{mealPlan.days} days</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{mealPlan.kcal}</p>
            <p className="text-sm text-blue-600 font-medium">Avg Calories</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{mealPlan.protein}g</p>
            <p className="text-sm text-green-600 font-medium">Avg Protein</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{mealPlan.carbs}g</p>
            <p className="text-sm text-yellow-600 font-medium">Avg Carbs</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{mealPlan.fat}g</p>
            <p className="text-sm text-purple-600 font-medium">Avg Fat</p>
          </div>
        </div>
      </Card>

      {/* Target vs Plan Comparison */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Target vs Plan Comparison</h2>
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Calories</p>
              <p className="text-xl font-bold text-blue-600">{mealPlan.kcal}</p>
              <p className="text-sm text-gray-600">vs {mealPlan.client.kcalTarget} target</p>
              <div className={`text-sm font-medium ${
                Math.abs(mealPlan.kcal - mealPlan.client.kcalTarget) <= mealPlan.client.kcalTarget * 0.05 
                  ? 'text-green-600' : 'text-amber-600'
              }`}>
                {mealPlan.kcal > mealPlan.client.kcalTarget ? '+' : ''}
                {mealPlan.kcal - mealPlan.client.kcalTarget}
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Protein</p>
              <p className="text-xl font-bold text-green-600">{mealPlan.protein}g</p>
              <p className="text-sm text-gray-600">vs {mealPlan.client.proteinTarget}g target</p>
              <div className={`text-sm font-medium ${
                Math.abs(mealPlan.protein - mealPlan.client.proteinTarget) <= mealPlan.client.proteinTarget * 0.05 
                  ? 'text-green-600' : 'text-amber-600'
              }`}>
                {mealPlan.protein > mealPlan.client.proteinTarget ? '+' : ''}
                {mealPlan.protein - mealPlan.client.proteinTarget}g
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Carbs</p>
              <p className="text-xl font-bold text-yellow-600">{mealPlan.carbs}g</p>
              <p className="text-sm text-gray-600">vs {mealPlan.client.carbsTarget}g target</p>
              <div className={`text-sm font-medium ${
                Math.abs(mealPlan.carbs - mealPlan.client.carbsTarget) <= mealPlan.client.carbsTarget * 0.05 
                  ? 'text-green-600' : 'text-amber-600'
              }`}>
                {mealPlan.carbs > mealPlan.client.carbsTarget ? '+' : ''}
                {mealPlan.carbs - mealPlan.client.carbsTarget}g
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Fat</p>
              <p className="text-xl font-bold text-purple-600">{mealPlan.fat}g</p>
              <p className="text-sm text-gray-600">vs {mealPlan.client.fatTarget}g target</p>
              <div className={`text-sm font-medium ${
                Math.abs(mealPlan.fat - mealPlan.client.fatTarget) <= mealPlan.client.fatTarget * 0.05 
                  ? 'text-green-600' : 'text-amber-600'
              }`}>
                {mealPlan.fat > mealPlan.client.fatTarget ? '+' : ''}
                {mealPlan.fat - mealPlan.client.fatTarget}g
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Daily Meal Plan */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Daily Meal Plan</h2>
        
        {Object.entries(dayGroups)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([dayNumber, items]) => {
            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + parseInt(dayNumber) - 1);
            
            const dayTotals = items.reduce((acc, item) => ({
              kcal: acc.kcal + item.recipe.kcalPerServing * item.servings,
              protein: acc.protein + item.recipe.proteinPerServing * item.servings,
              carbs: acc.carbs + item.recipe.carbsPerServing * item.servings,
              fat: acc.fat + item.recipe.fatPerServing * item.servings,
            }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });

            return (
              <Card key={dayNumber} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Day {dayNumber} - {formatDate(dayDate)}
                  </h3>
                  <div className="grid grid-cols-4 gap-4 text-center text-sm">
                    <div>
                      <p className="font-bold text-blue-600">{Math.round(dayTotals.kcal)}</p>
                      <p className="text-gray-600">kcal</p>
                    </div>
                    <div>
                      <p className="font-bold text-green-600">{Math.round(dayTotals.protein)}g</p>
                      <p className="text-gray-600">protein</p>
                    </div>
                    <div>
                      <p className="font-bold text-yellow-600">{Math.round(dayTotals.carbs)}g</p>
                      <p className="text-gray-600">carbs</p>
                    </div>
                    <div>
                      <p className="font-bold text-purple-600">{Math.round(dayTotals.fat)}g</p>
                      <p className="text-gray-600">fat</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {items
                    .sort((a, b) => a.mealNumber - b.mealNumber)
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                              Meal {item.mealNumber}
                            </span>
                            <h4 className="font-medium">{item.recipe.title}</h4>
                          </div>
                          <div className="text-sm text-gray-600 mt-2 grid grid-cols-5 gap-2">
                            <span className="font-medium">{item.servings} serving{item.servings !== 1 ? 's' : ''}</span>
                            <span>{Math.round(item.recipe.kcalPerServing * item.servings)} kcal</span>
                            <span>{Math.round(item.recipe.proteinPerServing * item.servings)}g protein</span>
                            <span>{Math.round(item.recipe.carbsPerServing * item.servings)}g carbs</span>
                            <span>{Math.round(item.recipe.fatPerServing * item.servings)}g fat</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
