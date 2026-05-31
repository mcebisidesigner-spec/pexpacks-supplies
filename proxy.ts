import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter that allows 50 requests per 10 seconds.
// We fallback to a dummy implementation if the UPSTASH_REDIS_REST_URL is missing
// to prevent the app from crashing in environments without Redis configured.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const ratelimit =
  redisUrl && redisToken
    ? new Ratelimit({
        redis: new Redis({
          url: redisUrl,
          token: redisToken,
        }),
        limiter: Ratelimit.slidingWindow(50, "10 s"),
        analytics: true,
      })
    : null;

export async function proxy(request: NextRequest) {
  // Only apply rate limiting to /api routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    if (!ratelimit) {
      // If Upstash is not configured, we just pass the request through.
      return NextResponse.next();
    }

    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    
    try {
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);
      
      if (!success) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: "Too many requests, please try again later.",
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          }
        );
      }

      // Add rate limit headers to successful requests
      const response = NextResponse.next();
      response.headers.set("X-RateLimit-Limit", limit.toString());
      response.headers.set("X-RateLimit-Remaining", remaining.toString());
      response.headers.set("X-RateLimit-Reset", reset.toString());
      return response;
    } catch (error) {
      // If Upstash fails for some reason (e.g., network error), let the request through
      // rather than breaking the application.
      console.error("Rate limiting error:", error);
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply only to API routes
    "/api/:path*",
  ],
};
