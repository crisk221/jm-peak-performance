"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  generateResetToken,
  revokeUserSessions,
} from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const identifier = formData.get("identifier") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";
  const next = (formData.get("next") as string) || "/dashboard";

  if (!identifier || !password) {
    return { error: "Username/email and password are required" };
  }

  // Find user by username or email
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
    },
  });

  if (!user || !(await verifyPassword(password, user.password))) {
    return { error: "Invalid credentials" };
  }

  // Create session
  await createSession(user.id, remember);

  // Redirect to intended destination
  redirect(next);
}

export async function logoutAction() {
  await destroySession();
  redirect("/auth/login");
}

export async function requestResetAction(formData: FormData) {
  const identifier = formData.get("identifier") as string;

  if (!identifier) {
    return { error: "Email or username is required" };
  }

  // Find user by username or email
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
    },
  });

  if (!user) {
    // Don't reveal if user exists or not
    return {
      ok: true,
      message: "If an account exists, you will receive reset instructions",
    };
  }

  // Generate reset token
  const token = generateResetToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

  // Store token
  await prisma.passwordResetToken.create({
    data: {
      email: user.email,
      token,
      expiresAt,
    },
  });

  // In development, return the token for easy testing
  if (process.env.NODE_ENV === "development") {
    return {
      ok: true,
      message: "Reset link generated",
      devToken: token,
      devLink: `/auth/reset/${token}`,
    };
  }

  // In production, send email here
  return {
    ok: true,
    message: "If an account exists, you will receive reset instructions",
  };
}

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token || !password || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" };
  }

  // Find and validate token
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
    return { error: "Invalid or expired reset token" };
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: resetToken.email },
  });

  if (!user) {
    return { error: "User not found" };
  }

  // Hash new password
  const hashedPassword = await hashPassword(password);

  // Update password and mark token as used
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    }),
  ]);

  // Revoke all existing sessions
  await revokeUserSessions(user.id);

  return { success: true, message: "Password reset successfully" };
}
