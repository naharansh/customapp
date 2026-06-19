import { NextRequest } from "next/server";
import { handlers } from "@/auth";

export async function GET(request: NextRequest) {
  return withLiveEnv(handlers.GET, request);
}

export async function POST(request: NextRequest) {
  return withLiveEnv(handlers.POST, request);
}

/**
 * Ensures AUTH_URL/NEXTAUTH_URL match the actual request origin.
 * proxy.ts also sets these, but this is a safety net for direct
 * requests to the API route (e.g. from next-auth internals).
 */
async function withLiveEnv(
  handler: (req: NextRequest) => Promise<Response>,
  request: NextRequest,
): Promise<Response> {
  const origin = new URL(request.url).origin;
  const orig = process.env.AUTH_URL;
  const origNext = process.env.NEXTAUTH_URL;

  if (origin !== orig || origin !== origNext) {
    process.env.AUTH_URL = origin;
    process.env.NEXTAUTH_URL = origin;
  }

  try {
    return await handler(request);
  } finally {
    if (process.env.AUTH_URL !== orig) process.env.AUTH_URL = orig;
    if (process.env.NEXTAUTH_URL !== origNext) process.env.NEXTAUTH_URL = origNext;
  }
}
