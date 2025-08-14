"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import { SkipToContent } from "@/components/skip-to-content";
import { appSettings } from "@/lib/app-settings";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/60">
        <SkipToContent />
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo + Wordmark */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-3 focus-ring rounded-md min-h-[40px]"
                aria-label="JM Peak Performance Home"
              >
                {appSettings.logoUrl ? (
                  <div className="h-8 relative">
                    <Image
                      src={appSettings.logoUrl}
                      alt={appSettings.brandName}
                      height={32}
                      width={120}
                      className="h-8 w-auto"
                      priority
                    />
                  </div>
                ) : (
                  <div className="h-8 w-8 text-primary">
                    <svg
                      viewBox="0 0 40 40"
                      fill="none"
                      className="h-full w-full"
                      aria-hidden="true"
                    >
                      <circle
                        cx="20"
                        cy="20"
                        r="18"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <text
                        x="20"
                        y="26"
                        textAnchor="middle"
                        fill="white"
                        fontFamily="Arial, sans-serif"
                        fontSize="16"
                        fontWeight="bold"
                      >
                        JM
                      </text>
                    </svg>
                  </div>
                )}
              </Link>
            </div>

            {/* Right: Search + Mode Toggle + User */}
            <nav
              aria-label="Primary navigation"
              className="flex items-center gap-3"
            >
              {/* Global Search */}
              <div className="relative hidden sm:block">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="h-10 w-64 pl-9 text-sm focus-ring min-h-[40px]"
                  aria-label="Global search"
                />
              </div>

              {/* Mode Toggle */}
              <ModeToggle />

              {/* User Menu Placeholder */}
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 px-0 focus-ring min-h-[40px] min-w-[40px]"
                aria-label="User menu"
              >
                <User className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main">
        <div className="mx-auto max-w-screen-xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
