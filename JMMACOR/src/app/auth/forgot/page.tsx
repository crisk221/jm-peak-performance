"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MountainBg from "@/components/MountainBg";
import { appSettings } from "@/lib/app-settings";
import { requestResetAction } from "@/app/actions/auth";

export const runtime = "nodejs";

export default function ForgotPasswordPage() {
  const [result, setResult] = useState<{
    error?: string;
    success?: string;
    devLink?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);

    try {
      const response = await requestResetAction(formData);
      if (response.error) {
        setResult({ error: response.error });
      } else if (response.message) {
        setResult({
          success: response.message,
          ...(response.devLink && { devLink: response.devLink }),
        });
      }
    } catch (err) {
      setResult({ error: "An unexpected error occurred" });
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <MountainBg />

      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          {appSettings.logoUrl && (
            <div className="flex justify-center">
              <Image
                src={appSettings.logoUrl}
                alt={appSettings.brandName}
                height={60}
                width={240}
                className="h-15 w-auto object-contain"
                priority
              />
            </div>
          )}
          <div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Enter your email or username to receive reset instructions
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {result?.error && (
              <Alert variant="destructive">
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}

            {result?.success && (
              <Alert>
                <AlertDescription>
                  {result.success}
                  {result.devLink && process.env.NODE_ENV === "development" && (
                    <div className="mt-2">
                      <Link
                        href={result.devLink}
                        className="text-primary hover:underline text-sm"
                      >
                        Development Reset Link
                      </Link>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="identifier">Username or Email</Label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                required
                disabled={loading}
                className="bg-white"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Instructions"}
            </Button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm text-primary hover:underline"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
