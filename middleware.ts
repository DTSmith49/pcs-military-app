// middleware.ts (temporary: only keep rate limiting, no auth yet)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const RATE_LIMIT_MAP = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 min
const RATE_LIMIT_MAX = 10

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

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Preserve rate limiting for /api/reviews POST
  if (pathname === '/api/reviews' && request.method === 'POST') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }
  }

  // Otherwise, let everything through (no auth yet)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
