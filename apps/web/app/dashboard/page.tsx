import { redirect } from 'next/navigation';
import { getServerAuthSession } from '../../lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session.user.name}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {session.user.name}</p>
              <p><strong>Email:</strong> {session.user.email}</p>
              <p><strong>Role:</strong> {session.user.role}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>Manage your clients</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No clients yet. Start by adding your first client.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recipes</CardTitle>
            <CardDescription>Your recipe collection</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No recipes yet. Create your first recipe.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meal Plans</CardTitle>
            <CardDescription>Active meal plans</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No meal plans yet. Create one for your clients.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
