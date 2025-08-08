import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@jmpp/api";

/**
 * Create a tRPC React client
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get the base URL for tRPC requests
 */
function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Browser should use relative path
    return "";
  }

  if (process.env.VERCEL_URL) {
    // Reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NEXTAUTH_URL) {
    // Use NEXTAUTH_URL if available
    return process.env.NEXTAUTH_URL;
  }

  // Assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * tRPC client configuration
 */
export const trpcClientConfig = {
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      // You can pass any HTTP headers you wish here
      async headers() {
        return {
          // Add any headers you need here
        };
      },
    }),
  ],
  transformer: superjson,
  /**
   * Global error handler for tRPC calls
   */
  onError: (opts) => {
    const { error, path, type } = opts;

    // Log errors in development
    if (process.env.NODE_ENV === "development") {
      console.error(
        `❌ tRPC ${type} failed on ${path ?? "<unknown>"}: ${error.message}`
      );
    }

    // Let the api-error-toast handle user-facing messages
    // This will be picked up by React Query's onError handler
  },
};
