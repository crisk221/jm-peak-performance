"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/page-layout";
import { EmptyState } from "@/components/empty-state";
import { Download, Database, BarChart3, FileText, History } from "lucide-react";

export default function ExportsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus(null);

    try {
      const response = await fetch("/api/export-json");

      if (response.ok) {
        // Create download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `nutrition-planner-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

        setExportStatus("Export completed successfully!");
      } else {
        setExportStatus("Export failed. Please try again.");
      }
    } catch (error) {
      setExportStatus("Export failed. Please check your connection.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageLayout
      title="Data Exports"
      subtitle="Download backups and export your nutrition planning data."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 hover:shadow-card transition-all duration-200 rounded-lg border border-border">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <Download className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-ink dark:text-paper mb-2">
                Complete Data Export
              </h3>
              <p className="text-graphite dark:text-paper/70 text-sm mb-4">
                Export all clients, plans, meals, recipes, and ingredients as a
                JSON file.
              </p>

              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full mb-3"
              >
                {isExporting ? "Exporting..." : "Download JSON Export"}
              </Button>

              {exportStatus && (
                <Badge
                  variant={
                    exportStatus.includes("success") ? "default" : "destructive"
                  }
                  className="text-xs"
                >
                  {exportStatus}
                </Badge>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card transition-all duration-200">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-warning/10 text-warning">
              <Database className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-ink dark:text-paper mb-2">
                Database Backup
              </h3>
              <p className="text-graphite dark:text-paper/70 text-sm mb-4">
                Create a complete SQLite database backup for recovery purposes.
              </p>

              <Button variant="outline" disabled className="w-full">
                Manual DB Backup
              </Button>

              <p className="text-xs text-graphite dark:text-paper/50 mt-2">
                Automated backups are created in the /backups directory.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card transition-all duration-200">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-success/10 text-success">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-ink dark:text-paper mb-2">
                Analytics Export
              </h3>
              <p className="text-graphite dark:text-paper/70 text-sm mb-4">
                Export usage statistics and nutrition analytics data.
              </p>

              <Button variant="outline" disabled className="w-full">
                Export Analytics
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-card transition-all duration-200">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-ink dark:text-paper mb-2">
                Client Reports
              </h3>
              <p className="text-graphite dark:text-paper/70 text-sm mb-4">
                Generate PDF reports for individual clients or bulk exports.
              </p>

              <Button variant="outline" disabled className="w-full">
                Generate Reports
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Separator />

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-ink dark:text-paper mb-4 flex items-center gap-2">
          <History className="h-5 w-5" />
          Export History
        </h3>
        <EmptyState
          icon={History}
          title="No export history yet"
          body="Export history and logs will appear here once exports are performed."
        />
      </Card>
    </PageLayout>
  );
}
