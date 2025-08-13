import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stepper } from '@/components/Stepper';

const steps = [
  { number: 1, title: 'Intake' },
  { number: 2, title: 'Macros' },
  { number: 3, title: 'Plan' },
];

function getCurrentStep(pathname: string): number {
  if (pathname.includes('/intake')) return 1;
  if (pathname.includes('/macros')) return 2;
  if (pathname.includes('/plan')) return 3;
  return 1;
}

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Personal Trainer Wizard</CardTitle>
            <div className="flex justify-center">
              <Stepper currentStep={1} steps={steps} />
            </div>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              {children}
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
