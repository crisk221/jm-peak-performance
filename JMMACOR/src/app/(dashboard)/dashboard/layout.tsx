'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { appSettings } from '@/lib/app-settings';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/recipes', label: 'Recipes', icon: '🍳' },
  { href: '/dashboard/ingredients', label: 'Ingredients', icon: '🥗' },
  { href: '/dashboard/exports', label: 'Exports', icon: '📤' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="w-64 min-h-screen bg-gray-50 border-r border-gray-200 p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{appSettings.brandName}</h2>
        <Badge variant="secondary" className="mt-1">Dashboard</Badge>
      </div>
      
      <Separator className="mb-4" />
      
      <ul className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      
      <Separator className="my-6" />
      
      <div className="text-xs text-gray-500">
        <Link href="/" className="hover:text-gray-700 underline">
          ← Back to Home
        </Link>
      </div>
    </nav>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white">
      <SidebarNav />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              <Link 
                href="/wizard/intake" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                New Client Wizard
              </Link>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
