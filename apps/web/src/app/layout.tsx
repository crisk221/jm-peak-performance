import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import AuthProvider from "../../components/auth-provider";
import UserMenu from "../../components/user-menu";
import { Toaster } from "../../components/ui/toaster";
import QueryProvider from "../lib/query-provider";

export const metadata: Metadata = {
  title: "JM Peak Performance",
  description: "Full-stack Next.js 14 + tRPC application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              <header className="border-b bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center space-x-8">
                      <Link
                        href="/"
                        className="text-xl font-semibold text-gray-900"
                      >
                        JM Peak Performance
                      </Link>
                      <nav className="flex space-x-4">
                        <Link
                          href="/dashboard"
                          className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/recipes"
                          className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                          Recipes
                        </Link>
                      </nav>
                    </div>
                    <UserMenu />
                  </div>
                </div>
              </header>
              <main>{children}</main>
            </div>
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
