"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2, Eye, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../../../lib/trpc";
import { routes, dynamicRoutes } from "../../../lib/routes";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Card } from "../../../../components/ui/card";
import { LoadingSpinner } from "../../../components/ui/loading-spinner";

export default function MealPlansPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: mealPlans = [], isLoading, refetch } = trpc.mealPlan.list.useQuery({
    search: searchQuery,
  });

  const deleteMutation = trpc.mealPlan.delete.useMutation({
    onSuccess: () => {
      toast.success("Meal plan deleted successfully!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleDelete = async (planId: string) => {
    if (confirm("Are you sure you want to delete this meal plan? This action cannot be undone.")) {
      deleteMutation.mutate({ id: planId });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meal Plans</h1>
          <p className="text-gray-600 mt-1">
            Generate and manage personalized meal plans for your clients
          </p>
        </div>
        <Link href={routes.mealPlanNew}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Meal Plan
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search meal plans..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Meal Plans List */}
      <div className="grid gap-4">
        {mealPlans.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No meal plans yet</h3>
                <p className="text-gray-600">
                  {searchQuery ? "No meal plans match your search." : "Get started by creating your first meal plan."}
                </p>
              </div>
              {!searchQuery && (
                <Link href={routes.mealPlanNew}>
                  <Button>Create Meal Plan</Button>
                </Link>
              )}
            </div>
          </Card>
        ) : (
          mealPlans.map((plan: any) => (
            <Card key={plan.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-semibold">{plan.client.name}'s Meal Plan</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(plan.startDate)}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {plan.days} days
                        </span>
                        <span>Created {formatDate(plan.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Avg Calories:</span>
                      <span className="ml-1 font-medium">{plan.kcal}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Protein:</span>
                      <span className="ml-1 font-medium">{plan.protein}g</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Carbs:</span>
                      <span className="ml-1 font-medium">{plan.carbs}g</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Fat:</span>
                      <span className="ml-1 font-medium">{plan.fat}g</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(dynamicRoutes.mealPlan(plan.id))}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(plan.id)}
                    disabled={deleteMutation.isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
