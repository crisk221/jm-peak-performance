import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import type { IncomingMessage, ServerResponse } from "http";
import { prisma } from "@jmpp/db";

/**
 * Creates context for tRPC procedures (Pages Router)
 * This is called on every request
 */
export async function createContext(
  opts:
    | CreateNextContextOptions
    | { req: IncomingMessage; res: ServerResponse },
) {
  const { req, res } = opts;

  // For now, we'll handle auth on the client side
  const session = null;

  return {
    prisma,
    session,
    req,
    res,
  };
}

/**
 * Creates context for App Router API routes
 */
export async function createTRPCContext(opts: { req: Request }) {
  // For App Router, we need to handle this differently
  // We'll get the session without req/res for now
  const session = null; // TODO: Get session in App Router context

  return {
    prisma,
    session,
    req: opts.req,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
