import { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface FieldProps {
  label: string;
  error?: string | undefined;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  id?: string;
}

export function Field({
  label,
  error,
  hint,
  children,
  htmlFor,
  required = false,
  id,
}: FieldProps) {
  const fieldId = id || htmlFor;
  const labelId = fieldId ? `${fieldId}-label` : undefined;
  const errorId = error && fieldId ? `${fieldId}-error` : undefined;
  const hintId = hint && fieldId ? `${fieldId}-hint` : undefined;

  return (
    <div className="space-y-2">
      <Label id={labelId} htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </Label>
      {children}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          className="text-xs text-destructive"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}
