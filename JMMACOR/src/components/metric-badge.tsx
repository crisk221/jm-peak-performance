"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MetricBadgeProps {
  value: number;
  target?: number;
  unit?: string;
  label: string;
  className?: string;
}

export function MetricBadge({
  value,
  target,
  unit = "",
  label,
  className,
}: MetricBadgeProps) {
  // Determine state based on target
  let state: "ok" | "warn" | "over" | "neutral" = "neutral";

  if (target !== undefined) {
    const percentage = (value / target) * 100;
    if (percentage < 90) {
      state = "warn"; // Under target
    } else if (percentage > 110) {
      state = "over"; // Over target
    } else {
      state = "ok"; // Within range
    }
  }

  const stateStyles = {
    neutral: "border border-border text-ink dark:text-paper",
    ok: "border border-border text-ink dark:text-paper",
    warn: "badge-soft-warning border-0",
    over: "badge-soft-danger border-0",
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-3 text-center",
        stateStyles[state],
        className,
      )}
    >
      <div className="text-lg font-semibold font-mono">
        {value.toLocaleString()}
        {unit}
      </div>
      {target && (
        <div className="text-xs opacity-75 mt-1">
          / {target.toLocaleString()}
          {unit}
        </div>
      )}
      <div className="text-xs mt-1 font-medium">{label}</div>
    </div>
  );
}
