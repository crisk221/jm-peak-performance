"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";

interface ProtectedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function Protected({
  children,
  fallback,
  redirectTo = "/sign-in",
}: ProtectedProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(redirectTo);
    }
  }, [status, router, redirectTo]);

  if (status === "loading") {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="space-y-4 text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      )
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return <>{children}</>;
  }

  return null;
}
