import type { IncomingMessage, ServerResponse } from "http";
import type { Session } from "@auth/core/types";
import { Auth } from "@auth/core";
import type { AuthConfig } from "@auth/core";

/**
 * Auth.js configuration
 * Using JWT strategy for session management
 */
export const authConfig: AuthConfig = {
  providers: [
    // Add providers here when needed (OAuth, credentials, etc.)
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Get server-side session for tRPC context
 */
export async function getServerAuthSession(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<Session | null> {
  try {
    const response = await Auth(req, authConfig);

    // Extract session from Auth.js response
    if (response && response.body) {
      const body = JSON.parse(response.body.toString());
      return body.user ? { user: body.user, expires: body.expires } : null;
    }

    return null;
  } catch (error) {
    console.error("Auth session error:", error);
    return null;
  }
}

/**
 * Type-safe session user
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface SessionWithUser extends Session {
  user: SessionUser;
}
