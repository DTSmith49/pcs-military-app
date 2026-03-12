/**
 * middleware.ts  (root — required location for Next.js Edge Middleware)
 * AUTH-MW-01: JWT-based route protection + silent token refresh.
 *
 * Public routes (no token required):
 *   /login, /register, /forgot-password, /reset-password
 *   /api/auth/*  (all auth API endpoints)
 *   /_next/*, /favicon.ico  (Next.js internals)
 *
 * Protected routes: everything else.
 *   1. Valid access_token cookie  → allow through
 *   2. Expired/missing access_token + valid refresh_token → hit /api/auth/refresh,
 *      forward the new Set-Cookie headers, then allow through
 *   3. No valid tokens → redirect to /login?redirect=<original-path>
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]

const RATE_LIMIT_MAP = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 min
const RATE_LIMIT_MAX = 10

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) return true
  if (pathname.startsWith('/api/auth/')) return true
  if (pathname.startsWith('/_next/')) return true
  if (pathname === '/favicon.ico') return true
  return false
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Rate-limit helper (retained from original middleware)
// ---------------------------------------------------------------------------
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = RATE_LIMIT_MAP.get(ip)
  if (entry && now < entry.resetTime) {
    if (entry.count >= RATE_LIMIT_MAX) return false
    entry.count++
  } else {
    RATE_LIMIT_MAP.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
  }
  return true
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. /api/reviews POST — rate limiting (preserved from original)
  if (pathname === '/api/reviews' && request.method === 'POST') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }
  }

  // 2. Public paths — always allow
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // 3. Check access_token cookie
  const accessToken = request.cookies.get('access_token')?.value

  if (accessToken && (await verifyToken(accessToken))) {
    // Valid token — allow through
    return NextResponse.next()
  }

  // 4. Access token missing or expired — attempt silent refresh
  const refreshToken = request.cookies.get('refresh_token')?.value

  if (refreshToken) {
    try {
      const refreshRes = await fetch(
        new URL('/api/auth/refresh', request.url).toString(),
        {
          method: 'POST',
          headers: {
            cookie: `refresh_token=${refreshToken}`,
            'x-middleware-refresh': '1', // sentinel so the route can identify middleware calls
          },
        },
      )

      if (refreshRes.ok) {
        // Forward the new access_token + refresh_token cookies from the refresh response
        const response = NextResponse.next()
        refreshRes.headers.getSetCookie().forEach((cookie) => {
          response.headers.append('Set-Cookie', cookie)
        })
        return response
      }
    } catch {
      // Refresh fetch failed — fall through to redirect
    }
  }

  // 5. No valid tokens — redirect to login
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('redirect', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next.js static files and image optimization.
     * Public paths are filtered inside the middleware function itself.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
