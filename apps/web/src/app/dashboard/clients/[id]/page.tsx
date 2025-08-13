"use client";

import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../../../../lib/trpc";
import { dynamicRoutes } from "../../../../lib/routes";
import { Button } from "../../../../../components/ui/button";
import { Card } from "../../../../../components/ui/card";
import { LoadingSpinner } from "../../../../components/ui/loading-spinner";

type ClientDetailPageProps = {
  params: {
    id: string;
  };
};

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const router = useRouter();
  const { id } = params;

  const { data: client, isLoading } = trpc.client.getById.useQuery({ id });

  const deleteMutation = trpc.client.delete.useMutation({
    onSuccess: () => {
      toast.success("Client deleted successfully!");
      router.push("/dashboard/clients");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = async () => {
    if (!client) return;
    
    if (confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) {
      deleteMutation.mutate({ id: client.id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  if (!client) {
    notFound();
  }

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
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="text-gray-600 mt-1">Client Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(dynamicRoutes.clientEdit(client.id))}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleteMutation.isLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
            <p className="text-lg">{client.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Sex</label>
            <p className="text-lg capitalize">{client.sex.toLowerCase()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Age</label>
            <p className="text-lg">{client.age} years old</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Height</label>
            <p className="text-lg">{client.heightCm} cm</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Weight</label>
            <p className="text-lg">{client.weightKg} kg</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Activity Level</label>
            <p className="text-lg capitalize">{client.activityLevel.toLowerCase().replace("_", " ")}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Goal</label>
            <p className="text-lg capitalize">{client.goal.toLowerCase()}</p>
          </div>
        </div>
      </Card>

      {/* Macro Targets */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Macro Targets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{client.kcalTarget}</p>
            <p className="text-sm text-blue-600 font-medium">Calories</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{client.proteinTarget}g</p>
            <p className="text-sm text-green-600 font-medium">Protein</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{client.carbsTarget}g</p>
            <p className="text-sm text-yellow-600 font-medium">Carbs</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{client.fatTarget}g</p>
            <p className="text-sm text-purple-600 font-medium">Fat</p>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Preferences & Restrictions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {client.preferences.dietaryRestrictions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Dietary Restrictions</label>
              <div className="flex flex-wrap gap-2">
                {client.preferences.dietaryRestrictions.map((restriction, index) => (
                  <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {restriction}
                  </span>
                ))}
              </div>
            </div>
          )}

          {client.preferences.allergies.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Allergies</label>
              <div className="flex flex-wrap gap-2">
                {client.preferences.allergies.map((allergy, index) => (
                  <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {client.preferences.disliked.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Disliked Foods</label>
              <div className="flex flex-wrap gap-2">
                {client.preferences.disliked.map((disliked, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {disliked}
                  </span>
                ))}
              </div>
            </div>
          )}

          {client.preferences.cuisines.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Preferred Cuisines</label>
              <div className="flex flex-wrap gap-2">
                {client.preferences.cuisines.map((cuisine, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>
          )}

          {client.preferences.hardware.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Available Hardware</label>
              <div className="flex flex-wrap gap-2">
                {client.preferences.hardware.map((hw, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {hw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {Object.values(client.preferences).every(arr => arr.length === 0) && (
          <p className="text-gray-500 italic">No preferences specified</p>
        )}
      </Card>
    </div>
  );
}
