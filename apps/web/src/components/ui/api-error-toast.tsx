import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";

/**
 * Maps tRPC/HTTP errors to user-friendly toast messages
 */
export function handleApiError(error: unknown) {
  if (error instanceof TRPCClientError) {
    // Handle tRPC-specific errors
    switch (error.data?.code) {
      case "UNAUTHORIZED":
        toast.error("Please sign in to continue");
        break;
      case "FORBIDDEN":
        toast.error("You do not have permission to perform this action");
        break;
      case "NOT_FOUND":
        toast.error("The requested resource was not found");
        break;
      case "BAD_REQUEST":
        toast.error(error.message || "Invalid request");
        break;
      case "INTERNAL_SERVER_ERROR":
        toast.error("A server error occurred. Please try again later.");
        break;
      default:
        toast.error(error.message || "An unexpected error occurred");
    }
  } else if (error instanceof Error) {
    // Handle generic errors
    toast.error(error.message || "An error occurred");
  } else {
    // Handle unknown errors
    toast.error("An unexpected error occurred");
  }
}

/**
 * Creates an error handler function for React Query
 */
export function createApiErrorHandler() {
  return (error: unknown) => {
    // Log error for debugging in development
    if (process.env.NODE_ENV === "development") {
      console.error("API Error:", error);
    }

    handleApiError(error);
  };
}
