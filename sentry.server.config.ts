// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import { SENTRY_DSN } from "@/lib/constants";
import * as Sentry from "@sentry/nextjs";
import { logger } from "@/packages/logger";

if (SENTRY_DSN) {
  logger.info("Sentry DSN found, enabling Sentry on the server");

  Sentry.init({
    dsn: SENTRY_DSN,

    // No tracing while Sentry doesn't update to telemetry 2.0.0 - https://github.com/getsentry/sentry-javascript/issues/15737
    tracesSampleRate: 0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: process.env.NODE_ENV === 'development',

    beforeSend(event, hint) {
      const error = hint.originalException as Error;

      // @ts-expect-error notfound error
      if (error && error.digest === "NEXT_NOT_FOUND") {
        return null;
      }

      return event;
    },
  });
} else {
  logger.warn("Sentry DSN not found, Sentry will be disabled on the server");
}