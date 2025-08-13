"use client";

import * as React from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode; // Right-side CTA
}

export function SectionHeader({
  title,
  description,
  children,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold text-ink">{title}</h1>
        {description && (
          <p className="text-sm text-graphite mt-1">{description}</p>
        )}
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  );
}
