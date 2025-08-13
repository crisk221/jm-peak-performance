"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SectionHeader } from "@/components/section-header";
import {
  Zap,
  ChefHat,
  Carrot,
  Download,
  Settings,
  Activity,
  BarChart3,
  CheckCircle,
} from "lucide-react";

const quickActions = [
  {
    title: "New Client Wizard",
    description: "Start the 3-step nutrition planning process",
    href: "/wizard/intake",
    icon: Zap,
    primary: true,
  },
  {
    title: "Manage Recipes",
    description: "View and organize meal recipes",
    href: "/dashboard/recipes",
    icon: ChefHat,
  },
  {
    title: "Manage Ingredients",
    description: "Browse nutrition database",
    href: "/dashboard/ingredients",
    icon: Carrot,
  },
  {
    title: "Export Data",
    description: "Download backups and reports",
    href: "/dashboard/exports",
    icon: Download,
  },
  {
    title: "Settings",
    description: "Configure branding and preferences",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <SectionHeader
        title="Welcome to Your Dashboard"
        description="Manage your nutrition planning workflow and client data from one central location."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Card
              key={action.href}
              className="p-6 hover:shadow-card transition-all duration-200 hover:border-primary/20 group"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-ink dark:text-paper mb-2">
                    {action.title}
                  </h3>
                  <p className="text-graphite dark:text-paper/70 text-sm mb-4">
                    {action.description}
                  </p>
                  <Button
                    asChild
                    variant={action.primary ? "default" : "outline"}
                    className="w-full"
                  >
                    <Link href={action.href}>
                      {action.primary ? "Start Wizard" : "View"}
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-success/10 text-success">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-ink dark:text-paper">
              Recent Activity
            </h3>
          </div>
          <p className="text-graphite dark:text-paper/70 text-sm">
            No recent activity to display.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-warning/10 text-warning">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-ink dark:text-paper">
              Quick Stats
            </h3>
          </div>
          <p className="text-graphite dark:text-paper/70 text-sm">
            Statistics will appear here as you use the system.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-success/10 text-success">
              <CheckCircle className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-ink dark:text-paper">
              System Status
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-sm text-graphite dark:text-paper/70">
              All systems operational
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
