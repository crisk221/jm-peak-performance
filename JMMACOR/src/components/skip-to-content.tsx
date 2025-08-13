"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function SkipToContent() {
  return (
    <a
      href="#main"
      className={cn(
        // Visually hidden by default
        "sr-only",
        // Show on focus
        "focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
        // Styling
        "z-50 px-4 py-2 rounded-md",
        "bg-primary text-primary-foreground",
        "text-sm font-medium",
        // Focus ring
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        // Ensure minimum hit target
        "min-h-[40px] flex items-center",
      )}
    >
      Skip to main content
    </a>
  );
}
