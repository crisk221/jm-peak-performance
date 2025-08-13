"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SrOnlyProps {
  children: React.ReactNode;
  className?: string;
}

export function SrOnly({ children, className }: SrOnlyProps) {
  return <span className={cn("sr-only", className)}>{children}</span>;
}
