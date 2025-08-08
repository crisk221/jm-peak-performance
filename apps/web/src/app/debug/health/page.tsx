"use client";

import { trpc } from "../../../lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { LoadingSpinner } from "../../../components/ui/loading-spinner";
import { ErrorState } from "../../../components/ui/error-state";

export default function HealthDebugPage() {
  const healthCheck = trpc.health.check.useQuery();
  const databaseCheck = trpc.health.database.useQuery();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Health Debug</h1>
        <p className="text-gray-600">tRPC API connectivity test</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Health Check</CardTitle>
            <CardDescription>Basic API connectivity</CardDescription>
          </CardHeader>
          <CardContent>
            {healthCheck.isLoading && (
              <LoadingSpinner aria-label="Checking API health..." />
            )}
            {healthCheck.error && (
              <ErrorState
                title="Health check failed"
                message={healthCheck.error.message}
                onRetry={() => healthCheck.refetch()}
              />
            )}
            {healthCheck.data && (
              <div className="text-green-600">
                <p>
                  <strong>Status:</strong> {healthCheck.data.status}
                </p>
                <p>
                  <strong>Timestamp:</strong> {healthCheck.data.timestamp}
                </p>
                <pre className="mt-2 rounded bg-green-50 p-2 text-xs">
                  {JSON.stringify(healthCheck.data, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Check</CardTitle>
            <CardDescription>Database connectivity test</CardDescription>
          </CardHeader>
          <CardContent>
            {databaseCheck.isLoading && (
              <LoadingSpinner aria-label="Checking database connectivity..." />
            )}
            {databaseCheck.error && (
              <ErrorState
                title="Database check failed"
                message={databaseCheck.error.message}
                onRetry={() => databaseCheck.refetch()}
              />
            )}
            {databaseCheck.data && (
              <div className="text-green-600">
                <p>
                  <strong>Status:</strong> {databaseCheck.data.status}
                </p>
                {databaseCheck.data.latency && (
                  <p>
                    <strong>Latency:</strong> {databaseCheck.data.latency}ms
                  </p>
                )}
                {databaseCheck.data.error && (
                  <p>
                    <strong>Error:</strong> {databaseCheck.data.error}
                  </p>
                )}
                <pre className="mt-2 rounded bg-green-50 p-2 text-xs">
                  {JSON.stringify(databaseCheck.data, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
