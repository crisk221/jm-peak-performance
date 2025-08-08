"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClientConfig } from "./trpc";
import { createApiErrorHandler } from "../components/ui/api-error-toast";

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 60 seconds
            retry: 1, // Only retry once on failure
            onError: createApiErrorHandler(),
          },
          mutations: {
            retry: 1,
            onError: createApiErrorHandler(),
          },
        },
      })
  );

  const [trpcClient] = useState(() => trpc.createClient(trpcClientConfig));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
