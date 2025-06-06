import { NextResponse } from "next/server";
import { IS_DEVELOPMENT } from "@/lib/constants";
export const dynamic = "force-dynamic";

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

// A faulty API route to test Sentry's error monitoring - Development only
export function GET() {
  // Only allow in development environment
  if (!IS_DEVELOPMENT) {
    return NextResponse.json({ error: "This endpoint is only available in development" }, { status: 404 });
  }

  throw new SentryExampleAPIError("This error is raised on the backend called by the example page.");
  return NextResponse.json({ data: "Testing Sentry Error..." });
}
