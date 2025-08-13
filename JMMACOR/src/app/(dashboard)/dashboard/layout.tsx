"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appSettings } from "@/lib/app-settings";
import {
  BarChart3,
  ChefHat,
  Carrot,
  Download,
  Settings,
  ArrowLeft,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/dashboard/recipes", label: "Recipes", icon: ChefHat },
  { href: "/dashboard/ingredients", label: "Ingredients", icon: Carrot },
  { href: "/dashboard/exports", label: "Exports", icon: Download },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="w-64 min-h-screen bg-paper dark:bg-ink border-r border-border dark:border-graphite/30 p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-ink dark:text-paper">
          {appSettings.brandName}
        </h2>
        <Badge variant="secondary" className="mt-1">
          Dashboard
        </Badge>
      </div>

      <Separator className="mb-4" />

      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 font-medium"
                    : "text-graphite dark:text-paper/70 hover:bg-border/50 dark:hover:bg-graphite/50 hover:text-ink dark:hover:text-paper"
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <Separator className="my-6" />

      <div className="text-xs text-graphite dark:text-paper/50">
        <Link
          href="/"
          className="flex items-center gap-2 hover:text-ink dark:hover:text-paper transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Home
        </Link>
      </div>
    </nav>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-paper dark:bg-ink">
      <SidebarNav />

      <div className="flex-1">
        {/* Header */}
        <header className="bg-paper dark:bg-ink/50 border-b border-border dark:border-graphite/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-ink dark:text-paper">
              Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <Button asChild>
                <Link href="/wizard/intake">New Client Wizard</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-6 bg-paper dark:bg-ink min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
