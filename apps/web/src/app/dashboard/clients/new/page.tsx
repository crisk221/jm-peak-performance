"use client";

import { ClientForm } from "../../../../components/clients/client-form";

export default function NewClientPage() {
  return (
    <div className="container mx-auto py-8">
      <ClientForm mode="create" />
    </div>
  );
}
