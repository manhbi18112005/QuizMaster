import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    /*
     * Serverside Environment variables, not available on the client.
     * Will throw if you access these variables on the client.
     */
    server: {
        NEXTAUTH_SECRET: z.string().optional(),
        DEBUG: z.enum(["1", "0"]).optional(),
        GITHUB_ID: z.string().optional(),
        GITHUB_SECRET: z.string().optional(),
        NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
        RATE_LIMITING_DISABLED: z.enum(["1", "0"]).optional(),
        REDIS_URL: z.string().optional(),
        REDIS_HTTP_URL: z.string().optional(),
        SENTRY_DSN: z.string().optional(),
        SESSION_MAX_AGE: z.string().transform((val) => parseInt(val)).optional(),
        VERCEL_URL: z.string().optional(),
        WEBAPP_URL: z.string().url().optional(),
    },

    /*
     * Due to how Next.js bundles environment variables on Edge and Client,
     * we need to manually destructure them to make sure all are included in bundle.
     *
     * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
     */
    runtimeEnv: {
        DEBUG: process.env.DEBUG,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        GITHUB_ID: process.env.GITHUB_ID,
        GITHUB_SECRET: process.env.GITHUB_SECRET,
        NODE_ENV: process.env.NODE_ENV,
        RATE_LIMITING_DISABLED: process.env.RATE_LIMITING_DISABLED,
        REDIS_URL: process.env.REDIS_URL,
        REDIS_HTTP_URL: process.env.REDIS_HTTP_URL,
        SENTRY_DSN: process.env.SENTRY_DSN,
        SESSION_MAX_AGE: process.env.SESSION_MAX_AGE,
        VERCEL_URL: process.env.VERCEL_URL,
        WEBAPP_URL: process.env.WEBAPP_URL,
    },
});