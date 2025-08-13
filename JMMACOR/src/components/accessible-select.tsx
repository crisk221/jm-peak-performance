"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AccessibleSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  name?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  "aria-describedby"?: string;
}

export function AccessibleSelect({
  value,
  onValueChange,
  options,
  placeholder,
  name,
  error,
  hint,
  required,
  "aria-describedby": ariaDescribedBy,
}: AccessibleSelectProps) {
  const errorId = error && name ? `${name}-error` : undefined;
  const hintId = hint && name ? `${name}-hint` : undefined;

  // Combine all describedby IDs
  const describedByIds = [ariaDescribedBy, hintId, errorId]
    .filter(Boolean)
    .join(" ");

  return (
    <Select value={value ?? ""} onValueChange={onValueChange}>
      <SelectTrigger
        className="focus-ring"
        aria-describedby={describedByIds || undefined}
        aria-invalid={error ? "true" : undefined}
        aria-required={required ? true : undefined}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="focus-ring"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
