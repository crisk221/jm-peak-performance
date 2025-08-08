import { LoadingSpinner } from "../../components/ui/loading-spinner";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 h-8 w-48 animate-pulse rounded bg-gray-200"></div>
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <div className="p-6">
              <div className="mb-2 h-5 w-24 animate-pulse rounded bg-gray-200"></div>
              <div className="mb-4 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <LoadingSpinner size="lg" aria-label="Loading dashboard" />
      </div>
    </div>
  );
}
