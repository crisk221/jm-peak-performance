'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function ExportsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus(null);
    
    try {
      const response = await fetch('/api/export-json');
      
      if (response.ok) {
        // Create download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `nutrition-planner-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        setExportStatus('Export completed successfully!');
      } else {
        setExportStatus('Export failed. Please try again.');
      }
    } catch (error) {
      setExportStatus('Export failed. Please check your connection.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Data Exports</h2>
        <p className="text-gray-600">
          Download backups and export your nutrition planning data.
        </p>
      </div>

      <Separator className="mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">📤</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Complete Data Export
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Export all clients, plans, meals, recipes, and ingredients as a JSON file.
              </p>
              
              <Button 
                onClick={handleExport}
                disabled={isExporting}
                className="w-full mb-3"
              >
                {isExporting ? 'Exporting...' : 'Download JSON Export'}
              </Button>
              
              {exportStatus && (
                <Badge 
                  variant={exportStatus.includes('success') ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {exportStatus}
                </Badge>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🗃️</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Database Backup
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Create a complete SQLite database backup for recovery purposes.
              </p>
              
              <Button variant="outline" disabled className="w-full">
                Manual DB Backup
              </Button>
              
              <p className="text-xs text-gray-500 mt-2">
                Automated backups are created in the /backups directory.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">📊</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Analytics Export
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Export usage statistics and nutrition analytics data.
              </p>
              
              <Button variant="outline" disabled className="w-full">
                Export Analytics
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">📋</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Client Reports
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Generate PDF reports for individual clients or bulk exports.
              </p>
              
              <Button variant="outline" disabled className="w-full">
                Generate Reports
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Separator className="my-8" />

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export History</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-gray-600 text-sm">
            Export history and logs will appear here once exports are performed.
          </p>
        </div>
      </Card>
    </div>
  );
}
