import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { appSettings } from "@/lib/app-settings";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {appSettings.logoUrl ? (
              <Image
                src={appSettings.logoUrl}
                alt={appSettings.brandName}
                height={60}
                width={280}
                className="h-15 w-auto"
                priority
              />
            ) : (
              <CardTitle className="text-2xl text-center">
                {appSettings.brandName}
              </CardTitle>
            )}
          </div>
          <CardDescription className="text-center">
            3-page wizard for client intake, macro calculation, and meal
            planning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="self-center">
              Next.js 14 + TypeScript
            </Badge>
            <Badge variant="secondary" className="self-center">
              Tailwind CSS + shadcn/ui
            </Badge>
            <Badge variant="secondary" className="self-center">
              Prisma + SQLite
            </Badge>
            <Badge variant="secondary" className="self-center">
              Zustand + React Hook Form
            </Badge>
          </div>

          <div className="space-y-3">
            <Button className="w-full" size="lg" asChild>
              <Link href="/wizard/intake">Start Wizard</Link>
            </Button>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
