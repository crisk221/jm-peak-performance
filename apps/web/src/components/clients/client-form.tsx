"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { 
  ClientCreateInputSchema, 
  ClientUpdateInputSchema,
  SexEnum,
  GoalEnum,
  ActivityLevelEnum,
  type ClientCreateInput,
  type ClientUpdateInput,
  type Client
} from "@jmpp/types";
import { trpc } from "../../lib/trpc";
import { routes, dynamicRoutes } from "../../lib/routes";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card } from "../../../components/ui/card";
import { LoadingSpinner } from "../ui/loading-spinner";

type ClientFormProps = {
  client?: Client;
  mode: "create" | "edit";
};

export function ClientForm({ client, mode }: ClientFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = mode === "edit";
  
  const form = useForm<ClientCreateInput>({
    resolver: zodResolver(isEdit ? ClientUpdateInputSchema : ClientCreateInputSchema),
    defaultValues: client
      ? {
          name: client.name,
          sex: client.sex,
          age: client.age,
          heightCm: client.heightCm,
          weightKg: client.weightKg,
          activityLevel: client.activityLevel,
          goal: client.goal,
          kcalTarget: client.kcalTarget,
          proteinTarget: client.proteinTarget,
          carbsTarget: client.carbsTarget,
          fatTarget: client.fatTarget,
          preferences: client.preferences,
        }
      : {
          name: "",
          sex: "MALE" as const,
          age: 25,
          heightCm: 175,
          weightKg: 70,
          activityLevel: "MODERATELY_ACTIVE" as const,
          goal: "MAINTAIN" as const,
          kcalTarget: 2000,
          proteinTarget: 150,
          carbsTarget: 250,
          fatTarget: 67,
          preferences: {
            dietaryRestrictions: [],
            allergies: [],
            disliked: [],
            cuisines: [],
            hardware: [],
          },
        },
  });

  const createMutation = trpc.client.create.useMutation({
    onSuccess: (newClient) => {
      toast.success("Client created successfully!");
      router.push(dynamicRoutes.client(newClient.id));
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSubmitting(false);
    },
  });

  const updateMutation = trpc.client.update.useMutation({
    onSuccess: (updatedClient) => {
      toast.success("Client updated successfully!");
      router.push(dynamicRoutes.client(updatedClient.id));
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: ClientCreateInput) => {
    setIsSubmitting(true);
    
    if (isEdit && client) {
      updateMutation.mutate({ id: client.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleArrayChange = (field: keyof ClientCreateInput["preferences"], value: string) => {
    const newValues = value.split(",").map(v => v.trim()).filter(Boolean);
    form.setValue(`preferences.${field}`, newValues);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isEdit ? "Edit Client" : "New Client"}
        </h1>
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input
                {...form.register("name")}
                placeholder="Client name"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sex *</label>
              <select
                {...form.register("sex")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SexEnum.options.map((sex) => (
                  <option key={sex} value={sex}>
                    {sex.toLowerCase().replace("_", " ")}
                  </option>
                ))}
              </select>
              {form.formState.errors.sex && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.sex.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Age *</label>
              <Input
                {...form.register("age", { valueAsNumber: true })}
                type="number"
                min="1"
                max="150"
                placeholder="25"
              />
              {form.formState.errors.age && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.age.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Height (cm) *</label>
              <Input
                {...form.register("heightCm", { valueAsNumber: true })}
                type="number"
                min="50"
                max="300"
                placeholder="175"
              />
              {form.formState.errors.heightCm && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.heightCm.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Weight (kg) *</label>
              <Input
                {...form.register("weightKg", { valueAsNumber: true })}
                type="number"
                min="0"
                max="1000"
                step="0.1"
                placeholder="70"
              />
              {form.formState.errors.weightKg && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.weightKg.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Activity Level *</label>
              <select
                {...form.register("activityLevel")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ActivityLevelEnum.options.map((level) => (
                  <option key={level} value={level}>
                    {level.toLowerCase().replace("_", " ")}
                  </option>
                ))}
              </select>
              {form.formState.errors.activityLevel && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.activityLevel.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Goal *</label>
              <select
                {...form.register("goal")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {GoalEnum.options.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal.toLowerCase()}
                  </option>
                ))}
              </select>
              {form.formState.errors.goal && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.goal.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Macros */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Macro Targets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Calories *</label>
              <Input
                {...form.register("kcalTarget", { valueAsNumber: true })}
                type="number"
                min="0"
                max="10000"
                placeholder="2000"
              />
              {form.formState.errors.kcalTarget && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.kcalTarget.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Protein (g) *</label>
              <Input
                {...form.register("proteinTarget", { valueAsNumber: true })}
                type="number"
                min="0"
                max="1000"
                placeholder="150"
              />
              {form.formState.errors.proteinTarget && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.proteinTarget.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Carbs (g) *</label>
              <Input
                {...form.register("carbsTarget", { valueAsNumber: true })}
                type="number"
                min="0"
                max="2000"
                placeholder="250"
              />
              {form.formState.errors.carbsTarget && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.carbsTarget.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fat (g) *</label>
              <Input
                {...form.register("fatTarget", { valueAsNumber: true })}
                type="number"
                min="0"
                max="1000"
                placeholder="67"
              />
              {form.formState.errors.fatTarget && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.fatTarget.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Dietary Restrictions</label>
              <Input
                placeholder="vegetarian, gluten-free, etc. (comma-separated)"
                defaultValue={client?.preferences.dietaryRestrictions?.join(", ") || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleArrayChange("dietaryRestrictions", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Allergies</label>
              <Input
                placeholder="nuts, dairy, etc. (comma-separated)"
                defaultValue={client?.preferences.allergies?.join(", ") || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleArrayChange("allergies", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Disliked Foods</label>
              <Input
                placeholder="broccoli, seafood, etc. (comma-separated)"
                defaultValue={client?.preferences.disliked?.join(", ") || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleArrayChange("disliked", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Preferred Cuisines</label>
              <Input
                placeholder="italian, asian, mexican, etc. (comma-separated)"
                defaultValue={client?.preferences.cuisines?.join(", ") || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleArrayChange("cuisines", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Available Hardware</label>
              <Input
                placeholder="oven, air fryer, slow cooker, etc. (comma-separated)"
                defaultValue={client?.preferences.hardware?.join(", ") || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleArrayChange("hardware", e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoadingSpinner className="w-4 h-4 mr-2" />
            ) : null}
            {isEdit ? "Update Client" : "Create Client"}
          </Button>
        </div>
      </form>
    </div>
  );
}
