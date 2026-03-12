// app/middleware.ts
// IP-based rate limiting for the review submission endpoint.
// Allows a maximum of 10 POST requests per IP per 15-minute window.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimit = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 10;

export function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname === "/api/reviews" &&
    request.method === "POST"
  ) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",").trim() ??
      "unknown";
    const now = Date.now();

    const entry = rateLimit.get(ip);

    if (entry && now < entry.resetTime) {
      if (entry.count >= MAX_REQUESTS) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
      entry.count++;
    } else {
      rateLimit.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/reviews"],
};
