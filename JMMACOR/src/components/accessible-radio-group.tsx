"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface AccessibleRadioGroupProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  name?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  "aria-describedby"?: string;
}

export function AccessibleRadioGroup({
  value,
  onValueChange,
  options,
  name,
  error,
  hint,
  required,
  "aria-describedby": ariaDescribedBy,
}: AccessibleRadioGroupProps) {
  const errorId = error && name ? `${name}-error` : undefined;
  const hintId = hint && name ? `${name}-hint` : undefined;

  // Combine all describedby IDs
  const describedByIds = [ariaDescribedBy, hintId, errorId]
    .filter(Boolean)
    .join(" ");

  return (
    <RadioGroup
      value={value ?? ""}
      onValueChange={onValueChange}
      aria-describedby={describedByIds || undefined}
      aria-invalid={error ? "true" : undefined}
      aria-required={required ? true : undefined}
      className="flex flex-wrap gap-6"
    >
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <RadioGroupItem
            value={option.value}
            id={`${name}-${option.value}`}
            className="focus-ring"
          />
          <Label
            htmlFor={`${name}-${option.value}`}
            className="text-sm cursor-pointer min-h-[40px] flex items-center"
          >
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
