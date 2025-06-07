import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import { IS_PRODUCTION } from "./lib/constants";

// Constants for reusable values
const CACHE_IMMUTABLE = "public, max-age=31536000, s-maxage=31536000, immutable";
const CACHE_LONG = "public, max-age=2592000, s-maxage=31536000, immutable";
const CACHE_MEDIUM = "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400";
const CACHE_VIDEO = "public, max-age=604800, s-maxage=31536000, stale-while-revalidate=604800";

const CORS_HEADERS = [
  { key: "Access-Control-Allow-Credentials", value: "true" },
  { key: "Access-Control-Allow-Origin", value: "*" },
  { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
  {
    key: "Access-Control-Allow-Headers",
    value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Cache-Control",
  },
];

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Content-Security-Policy",
    value: IS_PRODUCTION 
      ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.nnsvn.me; style-src 'self' 'unsafe-inline' https://*.nnsvn.me; img-src 'self' blob: data: https://*.nnsvn.me https://avatars.githubusercontent.com https://images.unsplash.com https://lh3.googleusercontent.com; font-src 'self' data: https://*.nnsvn.me https:; connect-src 'self' wss://*.nnsvn.me https://*.nnsvn.me https://avatars.githubusercontent.com https://images.unsplash.com https://lh3.googleusercontent.com; frame-src 'self' https://*.nnsvn.me; media-src 'self' blob: data: https://*.nnsvn.me; object-src 'self' data: https://*.nnsvn.me; base-uri 'self'; form-action 'self'; worker-src 'self' blob:"
      : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.nnsvn.me http://localhost:*; style-src 'self' 'unsafe-inline' https://*.nnsvn.me; img-src 'self' blob: data: https://*.nnsvn.me https://avatars.githubusercontent.com https://images.unsplash.com https://lh3.googleusercontent.com http://localhost:*; font-src 'self' data: https://*.nnsvn.me https:; connect-src 'self' wss://*.nnsvn.me https://*.nnsvn.me https://avatars.githubusercontent.com https://images.unsplash.com https://lh3.googleusercontent.com ws://localhost:* http://localhost:*; frame-src 'self' https://*.nnsvn.me; media-src 'self' blob: data: https://*.nnsvn.me; object-src 'self' data: https://*.nnsvn.me; base-uri 'self'; form-action 'self'; worker-src 'self' blob:",
  },
];

const nextConfig: NextConfig = {
  experimental: {},
  compiler: {
    removeConsole: IS_PRODUCTION,
  },
  output: 'standalone',
  poweredByHeader: !IS_PRODUCTION,
  productionBrowserSourceMaps: !IS_PRODUCTION,
  turbopack: {
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.slack-edge.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Remove or conditionally include HTTP localhost
      ...(process.env.NODE_ENV === 'development' ? [{
        protocol: "http" as const,
        hostname: "localhost",
      }] : []),
      {
        protocol: "https",
        hostname: "quiz.nnsvn.me",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      // Global security headers
      { source: "/(.*)", headers: SECURITY_HEADERS },

      // API CORS headers
      { source: "/api/:path*", headers: CORS_HEADERS },

      // Frame protection for auth pages
      {
        source: "/(environments|auth)/(.*)",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },

      // Static assets with immutable cache
      {
        source: "/(images|fonts|icons)/(.*)",
        headers: [
          { key: "Cache-Control", value: CACHE_IMMUTABLE },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },

      // Favicon and SVG - long cache
      {
        source: "/(favicon\\.ico|favicon/.*|\\.svg)",
        headers: [
          { key: "Cache-Control", value: CACHE_LONG },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Content-Type", value: "image/svg+xml" },
        ],
      },

      // Video content - optimized for streaming
      {
        source: "/(video|animated-bgs)/(.*)",
        headers: [
          { key: "Cache-Control", value: CACHE_VIDEO },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Accept-Ranges", value: "bytes" },
        ],
      },

      // JavaScript files
      {
        source: "/js/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=2592000, stale-while-revalidate=3600, stale-if-error=86400" },
          { key: "Content-Type", value: "application/javascript; charset=UTF-8" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Vary", value: "Accept-Encoding" },
        ],
      },

      // Dynamic content with medium cache
      {
        source: "/(image-backgrounds|site\\.webmanifest|browserconfig\\.xml)/(.*)",
        headers: [
          { key: "Cache-Control", value: CACHE_MEDIUM },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Vary", value: "Accept-Encoding" },
        ],
      },
      // Enhanced caching for offline functionality
      {
        source: "/(quiz|dashboard|banks)/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },

      // Offline page - cache for long periods
      {
        source: "/~offline",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=604800" },
        ],
      },
    ];
  },
  env: {
    NEXTAUTH_URL: process.env.WEBAPP_URL,
  },
};

// Configure server actions if WEBAPP_URL is set
if (process.env.WEBAPP_URL) {
  nextConfig.experimental!.serverActions = {
    allowedOrigins: [process.env.WEBAPP_URL.replace(/https?:\/\//, "")],
    bodySizeLimit: "2mb",
  };
}

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: !IS_PRODUCTION
});

export default withSentryConfig(withSerwist(nextConfig), {
  org: process.env.SENTRY_ORG || "no-name-studio",
  project: process.env.SENTRY_PROJECT || "quizmaster",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
});