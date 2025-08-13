"use client";

import { notFound } from "next/navigation";
import { trpc } from "../../../../../lib/trpc";
import { ClientForm } from "../../../../../components/clients/client-form";
import { LoadingSpinner } from "../../../../../components/ui/loading-spinner";

type EditClientPageProps = {
  params: {
    id: string;
  };
};

export default function EditClientPage({ params }: EditClientPageProps) {
  const { id } = params;

  const { data: client, isLoading } = trpc.client.getById.useQuery({ id });

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
    <div className="container mx-auto py-8">
      <ClientForm client={client} mode="edit" />
    </div>
  );
}
