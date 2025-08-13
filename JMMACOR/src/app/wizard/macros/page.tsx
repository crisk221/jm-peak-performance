"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/section-header";
import { MetricBadge } from "@/components/metric-badge";
import {
  getClient,
  updateClientHeightCm,
  createPlan,
} from "@/app/actions/client";
import { useWizardStore } from "@/store/useWizardStore";
import {
  macrosInputSchema,
  customMacrosSchema,
  type MacrosInput,
  type CustomMacros,
} from "@/schemas/macros";
import {
  bmrMifflinStJeor,
  bmrHarrisBenedict,
  bmrKatchMcArdle,
  tdee,
  targetCalories,
  calcMacrosFromPercents,
  scaleCustomGramsToEnergy,
  presets,
  kcalToKJ,
  round,
  feetInchesToCm,
} from "@/lib/macros";
import { ACTIVITY_LEVELS, GOALS } from "@/lib/constants";
import macroConfig from "@/lib/macro-config.json";
import { AlertTriangle } from "lucide-react";

interface MacroResults {
  bmr: number;
  tdee: number;
  targetKcal: number;
  targetKJ: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function MacrosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clientId, setClientId, planDraft, setPlanDraft } = useWizardStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<MacroResults | null>(null);
  const [activeTab, setActiveTab] = useState("balanced");
  const [customMacros, setCustomMacros] = useState<CustomMacros>({
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [showLowCalorieWarning, setShowLowCalorieWarning] = useState(false);

  const form = useForm<MacrosInput>({
    resolver: zodResolver(macrosInputSchema),
    defaultValues: {
      sex: "male",
      age: 25,
      heightCm: 175,
      weightKg: 70,
      activity: "",
      goal: "",
      formula: "mifflin",
      showKJ: false,
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    const urlClientId = searchParams.get("clientId");
    if (urlClientId) {
      setClientId(urlClientId);
    }
  }, [searchParams, setClientId]);

  useEffect(() => {
    if (clientId) {
      loadClientData();
    }
  }, [clientId]);

  const loadClientData = async () => {
    try {
      setIsLoading(true);
      const client = await getClient(clientId!);

      if (client) {
        // Handle height conversion if needed
        let heightCm = client.heightCm;
        if (heightCm === 0) {
          // If no heightCm but we have the client, we need to prompt for conversion
          // For now, we'll use a default and let user correct it
          heightCm = 170;
        }

        form.reset({
          sex: client.gender.toLowerCase() as "male" | "female",
          age: client.age,
          heightCm: heightCm,
          weightKg: client.weightKg,
          activity: client.activity,
          goal: client.goal,
          formula: "mifflin",
          showKJ: false,
        });

        // Update heightCm in database if it was missing
        if (client.heightCm === 0 && heightCm !== 0) {
          await updateClientHeightCm(clientId!, heightCm);
        }
      }
    } catch (error) {
      console.error("Failed to load client data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMacros = () => {
    const values = form.getValues();
    setIsCalculating(true);

    try {
      let bmr: number;

      switch (values.formula) {
        case "harris":
          bmr = bmrHarrisBenedict(values);
          break;
        case "katch":
          // For now, use Mifflin as fallback since we don't have body fat %
          bmr = bmrMifflinStJeor(values);
          break;
        default:
          bmr = bmrMifflinStJeor(values);
      }

      const tdeeValue = tdee(bmr, values.activity);
      const targetKcal = targetCalories(tdeeValue, values.goal);
      const targetKJ = kcalToKJ(targetKcal);

      // Calculate macros for the active tab
      const preset = presets[activeTab as keyof typeof presets];
      const macros = calcMacrosFromPercents({
        kcal: targetKcal,
        pctCarb: preset.carbs,
        pctProt: preset.protein,
        pctFat: preset.fat,
      });

      setResults({
        bmr: round(bmr),
        tdee: round(tdeeValue),
        targetKcal,
        targetKJ: round(targetKJ),
        macros,
      });

      // Check for low calorie warning
      setShowLowCalorieWarning(targetKcal < macroConfig.limits.minCalories);
    } catch (error) {
      console.error("Calculation error:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);

    if (results && tabValue !== "custom") {
      const preset = presets[tabValue as keyof typeof presets];
      const macros = calcMacrosFromPercents({
        kcal: results.targetKcal,
        pctCarb: preset.carbs,
        pctProt: preset.protein,
        pctFat: preset.fat,
      });

      setResults({ ...results, macros });
    }
  };

  const handleCustomMacroChange = (
    field: keyof CustomMacros,
    value: number[],
  ) => {
    const newCustomMacros = { ...customMacros, [field]: value[0] };
    setCustomMacros(newCustomMacros);

    if (results) {
      const currentKcal =
        newCustomMacros.protein * 4 +
        newCustomMacros.carbs * 4 +
        newCustomMacros.fat * 9;
      setResults({
        ...results,
        macros: {
          protein: newCustomMacros.protein,
          carbs: newCustomMacros.carbs,
          fat: newCustomMacros.fat,
        },
      });
    }
  };

  const handleAutoBalance = () => {
    if (results) {
      const balanced = scaleCustomGramsToEnergy({
        kcalTarget: results.targetKcal,
        grams: {
          p: customMacros.protein,
          c: customMacros.carbs,
          f: customMacros.fat,
        },
      });

      setCustomMacros({
        protein: balanced.p,
        carbs: balanced.c,
        fat: balanced.f,
      });
      setResults({
        ...results,
        macros: { protein: balanced.p, carbs: balanced.c, fat: balanced.f },
      });
    }
  };

  const handleResetToPreset = () => {
    if (results && activeTab !== "custom") {
      const preset = presets[activeTab as keyof typeof presets];
      const macros = calcMacrosFromPercents({
        kcal: results.targetKcal,
        pctCarb: preset.carbs,
        pctProt: preset.protein,
        pctFat: preset.fat,
      });

      setCustomMacros({
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
      });
    }
  };

  const handleContinue = async () => {
    if (!results || !clientId) return;

    try {
      const planData = {
        clientId,
        kcalTarget: results.targetKcal,
        proteinG: results.macros.protein,
        carbsG: results.macros.carbs,
        fatG: results.macros.fat,
        splitType: activeTab as
          | "balanced"
          | "lowFat"
          | "lowCarb"
          | "highProtein"
          | "custom",
        custom:
          activeTab === "custom"
            ? {
                protein: results.macros.protein,
                carbs: results.macros.carbs,
                fat: results.macros.fat,
              }
            : undefined,
        formula: watchedValues.formula,
      };

      const { id: planId } = await createPlan(planData);

      // Update Zustand store
      setPlanDraft({
        kcalTarget: planData.kcalTarget,
        proteinG: planData.proteinG,
        carbsG: planData.carbsG,
        fatG: planData.fatG,
        splitType: planData.splitType,
      });

      // Navigate to plan page
      router.push(`/wizard/plan?clientId=${clientId}&planId=${planId}`);
    } catch (error) {
      console.error("Failed to save plan:", error);
    }
  };

  const getCurrentEnergyPercentage = () => {
    if (!results) return 0;
    const currentKcal =
      results.macros.protein * 4 +
      results.macros.carbs * 4 +
      results.macros.fat * 9;
    return Math.min(100, (currentKcal / results.targetKcal) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading client data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <SectionHeader
        title="Macro Calculator"
        description="Calculate your daily calorie and macronutrient targets"
      />

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Enter your details to calculate your metabolic needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <RadioGroup
                value={watchedValues.sex}
                onValueChange={(value) =>
                  form.setValue("sex", value as "male" | "female")
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age (years)</Label>
              <Input
                id="age"
                type="number"
                {...form.register("age", { valueAsNumber: true })}
                min="10"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heightCm">Height (cm)</Label>
              <Input
                id="heightCm"
                type="number"
                {...form.register("heightCm", { valueAsNumber: true })}
                min="100"
                max="250"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weightKg">Weight (kg)</Label>
              <Input
                id="weightKg"
                type="number"
                step="0.1"
                {...form.register("weightKg", { valueAsNumber: true })}
                min="30"
                max="300"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label id="activity-label" htmlFor="activity">
                Activity Level
              </Label>
              <Select
                value={watchedValues.activity}
                onValueChange={(value) => form.setValue("activity", value)}
              >
                <SelectTrigger
                  id="activity-trigger"
                  aria-labelledby="activity-label"
                  aria-describedby="activity-help"
                >
                  <SelectValue placeholder="Select your activity level" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p id="activity-help" className="sr-only">
                Choose your daily activity level for accurate calorie
                calculations.
              </p>
            </div>
            <div className="space-y-2">
              <Label id="goal-label" htmlFor="goal">
                Goal
              </Label>
              <Select
                value={watchedValues.goal}
                onValueChange={(value) => form.setValue("goal", value)}
              >
                <SelectTrigger
                  id="goal-trigger"
                  aria-labelledby="goal-label"
                  aria-describedby="goal-help"
                >
                  <SelectValue placeholder="Select your goal" />
                </SelectTrigger>
                <SelectContent>
                  {GOALS.map((goal) => (
                    <SelectItem key={goal} value={goal}>
                      {goal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p id="goal-help" className="sr-only">
                Select your primary fitness goal for personalized macro
                recommendations.
              </p>
            </div>{" "}
            <div className="space-y-2">
              <Label>BMR Formula</Label>
              <RadioGroup
                value={watchedValues.formula}
                onValueChange={(value) =>
                  form.setValue(
                    "formula",
                    value as "mifflin" | "harris" | "katch",
                  )
                }
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mifflin" id="mifflin" />
                  <Label htmlFor="mifflin">Mifflin-St Jeor (Recommended)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="harris" id="harris" />
                  <Label htmlFor="harris">Harris-Benedict</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Button
            onClick={calculateMacros}
            disabled={
              isCalculating || !watchedValues.activity || !watchedValues.goal
            }
            className="w-full"
          >
            {isCalculating ? "Calculating..." : "Calculate"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Results
                <div className="flex items-center space-x-2">
                  <Label htmlFor="showKJ" className="text-sm font-normal">
                    Show kJ
                  </Label>
                  <input
                    id="showKJ"
                    type="checkbox"
                    checked={watchedValues.showKJ}
                    onChange={(e) => form.setValue("showKJ", e.target.checked)}
                    className="rounded"
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricBadge label="BMR" value={results.bmr} unit="kcal/day" />
                <MetricBadge
                  label="TDEE"
                  value={results.tdee}
                  unit="kcal/day"
                />
                <MetricBadge
                  label="Target Calories"
                  value={results.targetKcal}
                  unit={
                    watchedValues.showKJ
                      ? `kcal (${results.targetKJ} kJ)`
                      : "kcal/day"
                  }
                  {...(showLowCalorieWarning && {
                    target: macroConfig.limits.minCalories,
                  })}
                />
              </div>

              {showLowCalorieWarning && (
                <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-ink dark:text-paper">
                        Low Calorie Warning
                      </p>
                      <p className="text-sm text-graphite dark:text-paper/70 mt-1">
                        Your target is below 1,200 kcal/day. Consider consulting
                        a healthcare professional before proceeding.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Macro Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Macronutrient Distribution</CardTitle>
              <CardDescription>
                Choose a preset or create your own macro split
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="balanced">Balanced</TabsTrigger>
                  <TabsTrigger value="lowFat">Low Fat</TabsTrigger>
                  <TabsTrigger value="lowCarb">Low Carb</TabsTrigger>
                  <TabsTrigger value="highProtein">High Protein</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>

                {Object.entries(presets).map(([key, preset]) => (
                  <TabsContent key={key} value={key} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold">
                          {results.macros.protein}g
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Protein ({preset.protein}%)
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold">
                          {results.macros.carbs}g
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Carbs ({preset.carbs}%)
                        </div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold">
                          {results.macros.fat}g
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Fat ({preset.fat}%)
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}

                <TabsContent value="custom" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Protein: {customMacros.protein}g</Label>
                        <Badge variant="outline">
                          {round(
                            ((customMacros.protein * 4) / results.targetKcal) *
                              100,
                          )}
                          %
                        </Badge>
                      </div>
                      <Slider
                        value={[customMacros.protein]}
                        onValueChange={(value) =>
                          handleCustomMacroChange("protein", value)
                        }
                        max={300}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Carbs: {customMacros.carbs}g</Label>
                        <Badge variant="outline">
                          {round(
                            ((customMacros.carbs * 4) / results.targetKcal) *
                              100,
                          )}
                          %
                        </Badge>
                      </div>
                      <Slider
                        value={[customMacros.carbs]}
                        onValueChange={(value) =>
                          handleCustomMacroChange("carbs", value)
                        }
                        max={500}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Fat: {customMacros.fat}g</Label>
                        <Badge variant="outline">
                          {round(
                            ((customMacros.fat * 9) / results.targetKcal) * 100,
                          )}
                          %
                        </Badge>
                      </div>
                      <Slider
                        value={[customMacros.fat]}
                        onValueChange={(value) =>
                          handleCustomMacroChange("fat", value)
                        }
                        max={200}
                        step={2}
                        className="w-full"
                      />
                    </div>

                    {/* Energy Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Energy Balance</Label>
                        <span className="text-sm">
                          {round(getCurrentEnergyPercentage())}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            getCurrentEnergyPercentage() > 105
                              ? "bg-red-500"
                              : getCurrentEnergyPercentage() > 95
                                ? "bg-green-500"
                                : "bg-yellow-500"
                          }`}
                          style={{
                            width: `${Math.min(100, getCurrentEnergyPercentage())}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={handleAutoBalance}
                        variant="outline"
                        size="sm"
                      >
                        Auto-balance
                      </Button>
                      <Button
                        onClick={handleResetToPreset}
                        variant="outline"
                        size="sm"
                      >
                        Reset to Balanced
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Continue Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleContinue}
              disabled={
                !results ||
                (activeTab === "custom" && getCurrentEnergyPercentage() < 90)
              }
              size="lg"
            >
              Continue to Meal Planning
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
