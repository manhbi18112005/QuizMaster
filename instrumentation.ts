import { IS_PRODUCTION, SENTRY_DSN } from "@/lib/constants";
import * as Sentry from "@sentry/nextjs";

export const onRequestError = Sentry.captureRequestError;

export const register = async () => {
  if (process.env.NEXT_RUNTIME === "nodejs" && IS_PRODUCTION && SENTRY_DSN) {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge" && IS_PRODUCTION && SENTRY_DSN) {
    await import("./sentry.edge.config");
  }
};