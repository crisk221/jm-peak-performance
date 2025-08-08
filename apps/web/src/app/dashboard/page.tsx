"use client";

import { useSession } from "next-auth/react";
import { trpc } from "../../lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Protected } from "../../components/auth/protected";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const userQuery = trpc.user.me.useQuery(undefined, {
    enabled: !!session?.user,
  });
  const statsQuery = trpc.user.stats.useQuery(undefined, {
    enabled: !!session?.user,
  });

  return (
    <Protected>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              {userQuery.isLoading && (
                <p className="text-gray-500">Loading...</p>
              )}
              {userQuery.error && (
                <p className="text-red-500">Error loading profile</p>
              )}
              {userQuery.data && (
                <div className="space-y-2">
                  <p>
                    <strong>Name:</strong> {String(userQuery.data.name)}
                  </p>
                  <p>
                    <strong>Email:</strong> {String(userQuery.data.email)}
                  </p>
                  <p>
                    <strong>Role:</strong> {String(userQuery.data.role)}
                  </p>
                  <p>
                    <strong>Member since:</strong>{" "}
                    {new Date(
                      userQuery.data.createdAt as string
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Your activity summary</CardDescription>
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading && (
                <p className="text-gray-500">Loading...</p>
              )}
              {statsQuery.error && (
                <p className="text-red-500">Error loading stats</p>
              )}
              {statsQuery.data && (
                <div className="space-y-2">
                  <p>
                    <strong>Clients:</strong> {statsQuery.data.totalClients}
                  </p>
                  <p>
                    <strong>Recipes:</strong> {statsQuery.data.totalRecipes}
                  </p>
                  <p>
                    <strong>Meal Plans:</strong>{" "}
                    {statsQuery.data.totalMealPlans}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-500">• Add new client</p>
                <p className="text-gray-500">• Create recipe</p>
                <p className="text-gray-500">• Plan meals</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Protected>
  );
}
