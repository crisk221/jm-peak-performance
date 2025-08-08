import { getServerSession } from "next-auth/next";
import { authOptions } from "../src/app/api/auth/[...nextauth]/route";

/**
 * Get the server-side session
 * Use this in server components and API routes
 */
export const getServerAuthSession = () => {
  return getServerSession(authOptions);
};

/**
 * Wrapper for authenticated server actions
 * Throws if user is not authenticated
 */
export const requireAuth = async () => {
  const session = await getServerAuthSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session;
};
