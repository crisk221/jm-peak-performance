"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface StepperProps {
  currentStep: number;
  steps: Array<{
    number: number;
    title: string;
    href?: string;
  }>;
}

export function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="flex items-center space-x-2 mb-6">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center space-x-2">
            <Badge
              variant={
                step.number === currentStep
                  ? "default"
                  : step.number < currentStep
                    ? "secondary"
                    : "outline"
              }
              className={cn(
                "rounded-full w-8 h-8 flex items-center justify-center font-semibold",
                step.number === currentStep && "bg-primary text-white",
                step.number < currentStep &&
                  "bg-success/20 text-success border-success",
              )}
            >
              {step.number}
            </Badge>
            <span
              className={cn(
                "text-sm font-medium",
                step.number === currentStep && "text-ink",
                step.number < currentStep && "text-graphite",
                step.number > currentStep && "text-graphite/60",
              )}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <Separator orientation="horizontal" className="w-8 mx-4" />
          )}
        </div>
      ))}
    </div>
  );
}
