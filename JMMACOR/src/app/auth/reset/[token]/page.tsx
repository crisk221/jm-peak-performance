"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { resetPasswordAction } from "@/app/actions/auth";

export const runtime = "nodejs";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [result, setResult] = useState<{
    error?: string;
    success?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);

    // Add token to form data
    formData.append("token", token);

    try {
      const response = await resetPasswordAction(formData);
      if (response.error) {
        setResult({ error: response.error });
      } else if (response.success) {
        setResult({
          success: response.message || "Password reset successfully",
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
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
            <CardDescription>Enter your new password</CardDescription>
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
                  <div className="mt-1 text-sm">Redirecting to login...</div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                disabled={loading || !!result?.success}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                disabled={loading || !!result?.success}
                className="bg-white"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !!result?.success}
            >
              {loading ? "Resetting..." : "Reset Password"}
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
