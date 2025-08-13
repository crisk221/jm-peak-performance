"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";

type ServingStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

export function ServingStepper({
  value,
  onChange,
  min = 0.25,
  max = 20,
  step = 0.25,
  disabled = false,
}: ServingStepperProps) {
  const handleDecrease = () => {
    const newValue = Math.max(min, value - step);
    onChange(Math.round(newValue * 4) / 4); // Round to nearest 0.25
  };

  const handleIncrease = () => {
    const newValue = Math.min(max, value + step);
    onChange(Math.round(newValue * 4) / 4); // Round to nearest 0.25
  };

  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDecrease}
        disabled={disabled || !canDecrease}
        className="h-8 w-8 p-0"
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <div className="w-16 text-center">
        <span className="text-sm font-medium">
          {value.toFixed(2).replace(/\.?0+$/, '')}
        </span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleIncrease}
        disabled={disabled || !canIncrease}
        className="h-8 w-8 p-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
