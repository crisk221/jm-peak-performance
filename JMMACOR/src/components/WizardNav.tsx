'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface WizardNavProps {
  backHref?: string;
  nextHref?: string;
  onNext?: () => void | Promise<void>;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
}

export function WizardNav({
  backHref,
  nextHref,
  onNext,
  nextLabel = "Next",
  nextDisabled = false,
  isLoading = false,
}: WizardNavProps) {
  const handleNext = async () => {
    if (onNext) {
      await onNext();
    }
  };

  return (
    <div className="flex justify-between pt-6 border-t">
      <div>
        {backHref && (
          <Button variant="outline" asChild>
            <Link href={backHref}>Back</Link>
          </Button>
        )}
      </div>
      <div>
        {nextHref ? (
          <Button asChild disabled={nextDisabled || isLoading}>
            <Link href={nextHref}>{nextLabel}</Link>
          </Button>
        ) : (
          <Button 
            onClick={handleNext} 
            disabled={nextDisabled || isLoading}
            type={onNext ? "button" : "submit"}
          >
            {isLoading ? "Loading..." : nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
