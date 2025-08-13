'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const quickActions = [
  {
    title: 'New Client Wizard',
    description: 'Start the 3-step nutrition planning process',
    href: '/wizard/intake',
    icon: '🧙‍♂️',
    primary: true,
  },
  {
    title: 'Manage Recipes',
    description: 'View and organize meal recipes',
    href: '/dashboard/recipes',
    icon: '🍳',
  },
  {
    title: 'Manage Ingredients',
    description: 'Browse nutrition database',
    href: '/dashboard/ingredients', 
    icon: '🥗',
  },
  {
    title: 'Export Data',
    description: 'Download backups and reports',
    href: '/dashboard/exports',
    icon: '📤',
  },
  {
    title: 'Settings',
    description: 'Configure branding and preferences',
    href: '/dashboard/settings',
    icon: '⚙️',
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Dashboard</h2>
        <p className="text-gray-600">
          Manage your nutrition planning workflow and client data from one central location.
        </p>
      </div>

      <Separator className="mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Card key={action.href} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="text-3xl">{action.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {action.description}
                </p>
                <Button 
                  asChild 
                  variant={action.primary ? 'default' : 'outline'}
                  className="w-full"
                >
                  <Link href={action.href}>
                    {action.primary ? 'Start Wizard' : 'View'}
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Separator className="my-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Activity</h3>
          <p className="text-gray-600 text-sm">
            No recent activity to display.
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Stats</h3>
          <p className="text-gray-600 text-sm">
            Statistics will appear here as you use the system.
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">System Status</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">All systems operational</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
