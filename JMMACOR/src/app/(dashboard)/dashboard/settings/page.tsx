'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { appSettings } from '@/lib/app-settings';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">
          Configure branding and system preferences.
        </p>
      </div>

      <Separator className="mb-8" />

      <div className="space-y-6">
        {/* Branding Settings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Branding Configuration</h3>
            <Badge variant="secondary">Read-Only</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                {appSettings.brandName}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                {appSettings.logoUrl || 'Not configured'}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Footer Note
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                {appSettings.footerNote}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Show Kilojoules by Default
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                {appSettings.defaultShowKJ ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Branding settings are configured in <code>src/lib/app-settings.ts</code>
            </p>
          </div>
        </Card>

        {/* System Settings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Configuration</h3>
            <Badge variant="outline">Coming Soon</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Formula
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                Mifflin-St Jeor
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Units System
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
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
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Database Information</h3>
            <Badge variant="secondary">Info Only</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Database Type
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                SQLite
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                prisma/dev.db
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Backup Directory
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                /backups
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" disabled>
            Export Settings
          </Button>
          <Button variant="outline" disabled>
            Reset to Defaults
          </Button>
          <Button variant="outline" disabled>
            Import Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
