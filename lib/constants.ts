
import { env } from "./env";

export const IS_PRODUCTION = env.NODE_ENV === "production";
export const IS_DEVELOPMENT = env.NODE_ENV === "development";
export const GITHUB_OAUTH_ENABLED = !!(env.GITHUB_ID && env.GITHUB_SECRET);
export const GITHUB_ID = env.GITHUB_ID;
export const GITHUB_SECRET = env.GITHUB_SECRET;
export const NEXTAUTH_SECRET = env.NEXTAUTH_SECRET;
export const REDIS_URL = env.REDIS_URL;
export const REDIS_HTTP_URL = env.REDIS_HTTP_URL;
export const RATE_LIMITING_DISABLED = env.RATE_LIMITING_DISABLED === "1";
export const SESSION_MAX_AGE = Number(env.SESSION_MAX_AGE) || 86400;
export const SENTRY_DSN = env.SENTRY_DSN;

// Rate Limiting
export const SIGNUP_RATE_LIMIT = {
  interval: 60 * 60, // 60 minutes
  allowedPerInterval: 30,
};
export const LOGIN_RATE_LIMIT = {
  interval: 15 * 60, // 15 minutes
  allowedPerInterval: 30,
};
export const CLIENT_SIDE_API_RATE_LIMIT = {
  interval: 60, // 1 minute
  allowedPerInterval: 100,
};
export const MANAGEMENT_API_RATE_LIMIT = {
  interval: 60, // 1 minute
  allowedPerInterval: 100,
};

export const SHARE_RATE_LIMIT = {
  interval: 60 * 1, // 1 minutes
  allowedPerInterval: 30,
};
export const FORGET_PASSWORD_RATE_LIMIT = {
  interval: 60 * 60, // 60 minutes
  allowedPerInterval: 5, // Limit to 5 requests per hour
};
export const RESET_PASSWORD_RATE_LIMIT = {
  interval: 60 * 60, // 60 minutes
  allowedPerInterval: 5, // Limit to 5 requests per hour
};
export const VERIFY_EMAIL_RATE_LIMIT = {
  interval: 60 * 60, // 60 minutes
  allowedPerInterval: 10, // Limit to 10 requests per hour
};
export const SYNC_USER_IDENTIFICATION_RATE_LIMIT = {
  interval: 60, // 1 minute
  allowedPerInterval: 5,
};

export const DEBUG = env.DEBUG === "1";

export const WEBAPP_URL =
  env.WEBAPP_URL || (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : false) || "http://localhost:3000";