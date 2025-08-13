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
    neutral: "bg-muted text-ink border-border",
    ok: "bg-success/10 text-success border-success/20",
    warn: "bg-warning/10 text-warning border-warning/20",
    over: "bg-danger/10 text-danger border-danger/20",
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
