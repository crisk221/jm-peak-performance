"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../../../lib/trpc";
import { routes, dynamicRoutes } from "../../../lib/routes";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Card } from "../../../../components/ui/card";
import { LoadingSpinner } from "../../../components/ui/loading-spinner";

export default function ClientsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: clients = [], isLoading, refetch } = trpc.client.list.useQuery({
    search: searchQuery,
  });

  const deleteMutation = trpc.client.delete.useMutation({
    onSuccess: () => {
      toast.success("Client deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = async (clientId: string, clientName: string) => {
    if (confirm(`Are you sure you want to delete ${clientName}? This action cannot be undone.`)) {
      deleteMutation.mutate({ id: clientId });
    }
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
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-gray-600 mt-1">
            Manage your coaching clients and their nutrition goals
          </p>
        </div>
        <Link href={routes.clientNew}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Client
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          aria-label="Search clients by name"
        />
      </div>

      {/* Client List */}
      <div className="grid gap-4">
        {clients.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No clients yet</h3>
                <p className="text-gray-600">
                  {searchQuery ? "No clients match your search." : "Get started by adding your first client."}
                </p>
              </div>
              {!searchQuery && (
                <Link href={routes.clientNew}>
                  <Button>Add Client</Button>
                </Link>
              )}
            </div>
          </Card>
        ) : (
          clients.map((client) => (
            <Card key={client.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-semibold">{client.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>{client.sex.toLowerCase()}</span>
                        <span>{client.age} years old</span>
                        <span>{client.heightCm}cm, {client.weightKg}kg</span>
                        <span className="capitalize">{client.goal.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Calories:</span>
                      <span className="ml-1 font-medium">{client.kcalTarget}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Protein:</span>
                      <span className="ml-1 font-medium">{client.proteinTarget}g</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Carbs:</span>
                      <span className="ml-1 font-medium">{client.carbsTarget}g</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Fat:</span>
                      <span className="ml-1 font-medium">{client.fatTarget}g</span>
                    </div>
                  </div>

                  {(client.preferences.dietaryRestrictions.length > 0 || client.preferences.allergies.length > 0) && (
                    <div className="mt-3 space-y-1">
                      {client.preferences.dietaryRestrictions.length > 0 && (
                        <div className="text-sm">
                          <span className="text-gray-500">Restrictions:</span>
                          <span className="ml-1">{client.preferences.dietaryRestrictions.join(", ")}</span>
                        </div>
                      )}
                      {client.preferences.allergies.length > 0 && (
                        <div className="text-sm">
                          <span className="text-gray-500">Allergies:</span>
                          <span className="ml-1">{client.preferences.allergies.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(dynamicRoutes.client(client.id))}
                    aria-label={`View ${client.name}'s profile`}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(dynamicRoutes.clientEdit(client.id))}
                    aria-label={`Edit ${client.name}'s information`}
                  >
                    <Pencil className="w-4 h-4" aria-hidden="true" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(client.id, client.name)}
                    disabled={deleteMutation.isLoading}
                    aria-label={`Delete ${client.name}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    <span className="sr-only">Delete</span>
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
