"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/section-header";
import { appSettings } from "@/lib/app-settings";
import {
  Palette,
  Settings as SettingsIcon,
  Database,
  Download,
  RotateCcw,
  Upload,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SectionHeader
        title="Settings"
        description="Configure branding and system preferences."
      />

      <div className="space-y-6">
        {/* Branding Settings */}
        <Card className="p-6 hover:shadow-card transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ink dark:text-paper flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding Configuration
            </h3>
            <Badge variant="secondary">Read-Only</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink dark:text-paper mb-1">
                Brand Name
              </label>
              <div className="p-3 bg-muted border border-border rounded-md text-sm text-ink dark:text-paper">
                {appSettings.brandName}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink dark:text-paper mb-1">
                Logo URL
              </label>
              <div className="p-3 bg-muted border border-border rounded-md text-sm text-ink dark:text-paper">
                {appSettings.logoUrl || "Not configured"}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink dark:text-paper mb-1">
                Footer Note
              </label>
              <div className="p-3 bg-muted border border-border rounded-md text-sm text-ink dark:text-paper">
                {appSettings.footerNote}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink dark:text-paper mb-1">
                Show Kilojoules by Default
              </label>
              <div className="p-3 bg-muted border border-border rounded-md text-sm text-ink dark:text-paper">
                {appSettings.defaultShowKJ ? "Yes" : "No"}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-graphite dark:text-paper/50">
              Branding settings are configured in{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">
                src/lib/app-settings.ts
              </code>
            </p>
          </div>
        </Card>

        {/* System Settings */}
        <Card className="p-6 hover:shadow-card transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ink dark:text-paper flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              System Configuration
            </h3>
            <Badge variant="outline">Coming Soon</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink dark:text-paper mb-1">
                Default Formula
              </label>
              <div className="p-3 bg-muted border border-border rounded-md text-sm text-ink dark:text-paper">
                Mifflin-St Jeor
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink dark:text-paper mb-1">
                Units System
              </label>
              <div className="p-3 bg-muted border border-border rounded-md text-sm text-ink dark:text-paper">
                Metric / Imperial
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button variant="outline" disabled>
              Edit System Settings
            </Button>
          </div>
        </Card>

        {/* Database Settings */}
        <Card className="p-6 hover:shadow-card transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ink dark:text-paper flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Information
            </h3>
            <Badge variant="secondary">Info Only</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink dark:text-paper mb-1">
                Database Type
              </label>
              <div className="p-3 bg-muted border border-border rounded-md text-sm text-ink dark:text-paper">
                SQLite
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink dark:text-paper mb-1">
                Location
              </label>
              <div className="p-3 bg-muted border border-border rounded-md text-sm text-ink dark:text-paper">
                prisma/dev.db
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink dark:text-paper mb-1">
                Backup Directory
              </label>
              <div className="p-3 bg-muted border border-border rounded-md text-sm text-ink dark:text-paper">
                /backups
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          <Button variant="outline" disabled>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button variant="outline" disabled>
            <Upload className="h-4 w-4 mr-2" />
            Import Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
