"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body: string;
  primary?: {
    label: string;
    onClick: () => void;
  };
  secondary?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  primary,
  secondary,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="mb-4 rounded-full bg-muted p-3">
          <Icon className="h-6 w-6 text-graphite" />
        </div>
        <h3 className="text-lg font-semibold text-ink mb-2">{title}</h3>
        <p className="text-sm text-graphite mb-6">{body}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          {primary && (
            <Button onClick={primary.onClick} className="focus-ring">
              {primary.label}
            </Button>
          )}
          {secondary && (
            <Button
              variant="outline"
              onClick={secondary.onClick}
              className="focus-ring"
            >
              {secondary.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
