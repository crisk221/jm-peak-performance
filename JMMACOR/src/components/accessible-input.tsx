"use client";

import React, { forwardRef } from "react";
import { Input } from "@/components/ui/input";

interface AccessibleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  hint?: string;
  "aria-describedby"?: string;
}

export const AccessibleInput = forwardRef<
  HTMLInputElement,
  AccessibleInputProps
>(({ error, hint, "aria-describedby": ariaDescribedBy, id, ...props }, ref) => {
  const errorId = error && id ? `${id}-error` : undefined;
  const hintId = hint && id ? `${id}-hint` : undefined;

  // Combine all describedby IDs
  const describedByIds = [ariaDescribedBy, hintId, errorId]
    .filter(Boolean)
    .join(" ");

  return (
    <Input
      ref={ref}
      id={id}
      aria-describedby={describedByIds || undefined}
      aria-invalid={error ? "true" : undefined}
      className="focus-ring"
      {...props}
    />
  );
});

AccessibleInput.displayName = "AccessibleInput";
