"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarDays, Users, Settings, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../../../../lib/trpc";
import { routes, dynamicRoutes } from "../../../../lib/routes";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Card } from "../../../../../components/ui/card";
import { LoadingSpinner } from "../../../../components/ui/loading-spinner";
import { ServingStepper } from "../../../../components/meal-plans/serving-stepper";
import type { MealPlanDraft, MealPlanDay } from "@jmpp/types";

const GeneratorFormSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  days: z.number().int().min(1).max(30),
  mealsPerDay: z.number().int().min(1).max(10),
  tolerancePct: z.number().min(0).max(50),
  startDate: z.string().min(1, "Start date is required"),
});

type GeneratorForm = z.infer<typeof GeneratorFormSchema>;

export default function MealPlanGeneratorPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<MealPlanDraft | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<GeneratorForm>({
    resolver: zodResolver(GeneratorFormSchema),
    defaultValues: {
      days: 7,
      mealsPerDay: 3,
      tolerancePct: 5,
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  // Get clients for dropdown
  const { data: clients = [], isLoading: loadingClients } = trpc.client.list.useQuery({});

  // Generate mutation
  const generateMutation = trpc.mealPlan.generate.useMutation({
    onSuccess: (result: any) => {
      setDraft(result);
      setIsGenerating(false);
      toast.success("Meal plan generated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message);
      setIsGenerating(false);
    },
  });

  // Save mutation
  const saveMutation = trpc.mealPlan.save.useMutation({
    onSuccess: (result: any) => {
      toast.success("Meal plan saved successfully!");
      router.push(dynamicRoutes.mealPlan(result.id));
    },
    onError: (error: any) => {
      toast.error(error.message);
      setIsSaving(false);
    },
  });

  const onGenerateDraft = async (data: GeneratorForm) => {
    setIsGenerating(true);
    generateMutation.mutate({
      clientId: data.clientId,
      days: data.days,
      mealsPerDay: data.mealsPerDay,
      tolerancePct: data.tolerancePct,
    });
  };

  const updateServings = (dayIndex: number, itemIndex: number, newServings: number) => {
    if (!draft) return;

    const updatedDraft = { ...draft };
    updatedDraft.days[dayIndex].items[itemIndex].servings = newServings;

    // Recalculate day totals
    const day = updatedDraft.days[dayIndex];
    day.totalMacros = day.items.reduce(
      (acc, item) => ({
        kcal: acc.kcal + (item.recipe?.kcalPerServing || 0) * item.servings,
        protein: acc.protein + (item.recipe?.proteinPerServing || 0) * item.servings,
        carbs: acc.carbs + (item.recipe?.carbsPerServing || 0) * item.servings,
        fat: acc.fat + (item.recipe?.fatPerServing || 0) * item.servings,
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );

    setDraft(updatedDraft);
  };

  const savePlan = async () => {
    if (!draft) return;

    const formData = form.getValues();
    setIsSaving(true);
    
    saveMutation.mutate({
      clientId: formData.clientId,
      startDate: formData.startDate,
      daysDraft: draft.days,
    });
  };

  const getToleranceStatus = (actual: number, target: number, tolerance: number) => {
    const diff = Math.abs(actual - target) / target;
    if (diff <= tolerance / 100) return "success";
    return "warning";
  };

  const selectedClient = clients.find((c: any) => c.id === form.watch("clientId"));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meal Plan Generator</h1>
          <p className="text-gray-600 mt-1">
            Generate personalized meal plans based on client preferences and macro targets
          </p>
        </div>
      </div>

      {/* Generator Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Generator Settings</h2>
        <form onSubmit={form.handleSubmit(onGenerateDraft)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Client *</label>
              <select
                {...form.register("clientId")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingClients}
              >
                <option value="">Select a client</option>
                {clients.map((client: any) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.clientId && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.clientId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Days</label>
              <Input
                {...form.register("days", { valueAsNumber: true })}
                type="number"
                min="1"
                max="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Meals/Day</label>
              <Input
                {...form.register("mealsPerDay", { valueAsNumber: true })}
                type="number"
                min="1"
                max="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tolerance %</label>
              <Input
                {...form.register("tolerancePct", { valueAsNumber: true })}
                type="number"
                min="0"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <Input
                {...form.register("startDate")}
                type="date"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isGenerating || !form.watch("clientId")}>
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Settings className="w-4 h-4 mr-2" />
              )}
              Generate Draft
            </Button>
          </div>
        </form>
      </Card>

      {/* Client Target Display */}
      {selectedClient && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">{selectedClient.name}'s Targets</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{selectedClient.kcalTarget}</p>
              <p className="text-sm text-gray-600">Calories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{selectedClient.proteinTarget}g</p>
              <p className="text-sm text-gray-600">Protein</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{selectedClient.carbsTarget}g</p>
              <p className="text-sm text-gray-600">Carbs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{selectedClient.fatTarget}g</p>
              <p className="text-sm text-gray-600">Fat</p>
            </div>
          </div>
        </Card>
      )}

      {/* Generated Plan */}
      {draft && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Generated Meal Plan</h2>
            <Button onClick={savePlan} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Plan
            </Button>
          </div>

          <div className="grid gap-6">
            {draft.days.map((day, dayIndex) => (
              <Card key={dayIndex} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Day {dayIndex + 1}</h3>
                  <div className="grid grid-cols-4 gap-4 text-center text-sm">
                    <div>
                      <p className={`font-bold ${
                        getToleranceStatus(day.totalMacros.kcal, draft.targetMacros.kcal, draft.tolerancePct) === 'success' 
                          ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {Math.round(day.totalMacros.kcal)}
                      </p>
                      <p className="text-gray-600">kcal</p>
                    </div>
                    <div>
                      <p className={`font-bold ${
                        getToleranceStatus(day.totalMacros.protein, draft.targetMacros.protein, draft.tolerancePct) === 'success' 
                          ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {Math.round(day.totalMacros.protein)}g
                      </p>
                      <p className="text-gray-600">protein</p>
                    </div>
                    <div>
                      <p className={`font-bold ${
                        getToleranceStatus(day.totalMacros.carbs, draft.targetMacros.carbs, draft.tolerancePct) === 'success' 
                          ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {Math.round(day.totalMacros.carbs)}g
                      </p>
                      <p className="text-gray-600">carbs</p>
                    </div>
                    <div>
                      <p className={`font-bold ${
                        getToleranceStatus(day.totalMacros.fat, draft.targetMacros.fat, draft.tolerancePct) === 'success' 
                          ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {Math.round(day.totalMacros.fat)}g
                      </p>
                      <p className="text-gray-600">fat</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {day.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.recipe?.title}</h4>
                        <div className="text-sm text-gray-600 mt-1 grid grid-cols-4 gap-2">
                          <span>{Math.round((item.recipe?.kcalPerServing || 0) * item.servings)} kcal</span>
                          <span>{Math.round((item.recipe?.proteinPerServing || 0) * item.servings)}g protein</span>
                          <span>{Math.round((item.recipe?.carbsPerServing || 0) * item.servings)}g carbs</span>
                          <span>{Math.round((item.recipe?.fatPerServing || 0) * item.servings)}g fat</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <ServingStepper
                          value={item.servings}
                          onChange={(newServings: number) => updateServings(dayIndex, itemIndex, newServings)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
