import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Session management
export async function createSession(
  userId: string,
  remember: boolean = false,
): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date();

  if (remember) {
    // 30 days for "remember me"
    expiresAt.setDate(expiresAt.getDate() + 30);
  } else {
    // 1 day for regular sessions
    expiresAt.setDate(expiresAt.getDate() + 1);
  }

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      remember,
    },
  });

  // Set HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set("sess", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sess")?.value;

  if (sessionToken) {
    // Remove from database
    await prisma.session.deleteMany({
      where: { token: sessionToken },
    });

    // Clear cookie
    cookieStore.delete("sess");
  }
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sess")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    // Session expired, clean up
    if (session) {
      await prisma.session.delete({
        where: { id: session.id },
      });
    }
    return null;
  }

  return session.user;
}

export async function revokeUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

// Helper functions
function generateSessionToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateResetToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
