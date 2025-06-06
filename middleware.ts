import {
  clientSideApiEndpointsLimiter,
  forgotPasswordLimiter,
  loginLimiter,
  shareUrlLimiter,
  signupLimiter,
  syncUserIdentificationLimiter,
  verifyEmailLimiter,
} from "@/app/middleware/bucket";
import {
  isAuthProtectedRoute,
  isClientSideApiRoute,
  isForgotPasswordRoute,
  isLoginRoute,
  isShareUrlRoute,
  isSignupRoute,
  isSyncWithUserIdentificationEndpoint,
  isVerifyEmailRoute,
} from "@/app/middleware/endpoint-validator";
import { IS_PRODUCTION, RATE_LIMITING_DISABLED, WEBAPP_URL, NEXTAUTH_SECRET } from "@/lib/constants";
import { isValidCallbackUrl } from "@/lib/utils/url";
import { logApiError } from "@/modules/api/lib/utils";
import { ApiErrorResponseV2 } from "@/modules/api/types/api-error";
import { ipAddress } from "@vercel/functions";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const handleAuth = async (request: NextRequest): Promise<Response | null> => {
  const token = await getToken({ req: request as Request, secret: NEXTAUTH_SECRET });

  if (isAuthProtectedRoute(request.nextUrl.pathname) && !token) {
    const loginUrl = `${WEBAPP_URL}/auth/login?callbackUrl=${encodeURIComponent(WEBAPP_URL + request.nextUrl.pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(loginUrl);
  }

  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");

  if (callbackUrl && !isValidCallbackUrl(callbackUrl, WEBAPP_URL)) {
    return NextResponse.json({ error: "Invalid callback URL" }, { status: 400 });
  }

  if (token && callbackUrl) {
    return NextResponse.redirect(callbackUrl);
  }

  return null;
};

const applyRateLimiting = async (request: NextRequest, ip: string) => {
  if (isLoginRoute(request.nextUrl.pathname)) {
    await loginLimiter(`login-${ip}`);
  } else if (isSignupRoute(request.nextUrl.pathname)) {
    await signupLimiter(`signup-${ip}`);
  } else if (isVerifyEmailRoute(request.nextUrl.pathname)) {
    await verifyEmailLimiter(`verify-email-${ip}`);
  } else if (isForgotPasswordRoute(request.nextUrl.pathname)) {
    await forgotPasswordLimiter(`forgot-password-${ip}`);
  } else if (isClientSideApiRoute(request.nextUrl.pathname)) {
    await clientSideApiEndpointsLimiter(`client-side-api-${ip}`);
    const envIdAndUserId = isSyncWithUserIdentificationEndpoint(request.nextUrl.pathname);
    if (envIdAndUserId) {
      const { environmentId, userId } = envIdAndUserId;
      await syncUserIdentificationLimiter(`sync-${environmentId}-${userId}`);
    }
  } else if (isShareUrlRoute(request.nextUrl.pathname)) {
    await shareUrlLimiter(`share-${ip}`);
  }
};

export const middleware = async (originalRequest: NextRequest) => {

  // Create a new Request object to override headers and add a unique request ID header
  const request = new NextRequest(originalRequest, {
    headers: new Headers(originalRequest.headers),
  });

  request.headers.set("x-request-id", uuidv4());
  request.headers.set("x-start-time", Date.now().toString());

  // Create a new NextResponse object to forward the new request with headers

  const nextResponseWithCustomHeader = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Handle authentication
  const authResponse = await handleAuth(request);
  if (authResponse) return authResponse;

  if (!IS_PRODUCTION || RATE_LIMITING_DISABLED) {
    return nextResponseWithCustomHeader;
  }

  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    ipAddress(request);

  if (ip) {
    try {
      await applyRateLimiting(request, ip);
      return nextResponseWithCustomHeader;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      const apiError: ApiErrorResponseV2 = {
        type: "too_many_requests",
        details: [{ field: "", issue: "Too many requests. Please try again later." }],
      };
      logApiError(request, apiError);
      return NextResponse.json(apiError, { status: 429 });
    }
  }

  return nextResponseWithCustomHeader;
};

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|js|css|images|fonts|icons|public|api/v1/og).*)", // Exclude the Open Graph image generation route from middleware
  ],
};