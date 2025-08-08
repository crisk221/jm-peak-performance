"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-20 animate-pulse rounded bg-gray-200"></div>;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/sign-in">
          <Button variant="ghost">Sign In</Button>
        </Link>
        <Link href="/sign-up">
          <Button>Sign Up</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-700">
        Welcome, {session.user.name}
      </span>
      <Button
        variant="outline"
        onClick={() => signOut({ callbackUrl: "/sign-in" })}
      >
        Sign Out
      </Button>
    </div>
  );
}
