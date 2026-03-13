import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/schools',
]

const RATE_LIMIT_MAP = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX = 10

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

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/review") return NextResponse.redirect(new URL("/login", request.url))
  const { pathname } = request.nextUrl

  if (pathname === '/api/reviews' && request.method === 'POST') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }
  }

  if (isPublicPath(pathname)) return NextResponse.next()

  const accessToken = request.cookies.get('access_token')?.value
  if (accessToken && (await verifyToken(accessToken))) return NextResponse.next()

  const refreshToken = request.cookies.get('refresh_token')?.value
  if (refreshToken) {
    try {
      const refreshRes = await fetch(new URL('/api/auth/refresh', request.url).toString(), {
        method: 'POST',
        headers: { cookie: `refresh_token=${refreshToken}`, 'x-middleware-refresh': '1' },
      })
      if (refreshRes.ok) {
        const response = NextResponse.next()
        refreshRes.headers.getSetCookie().forEach((cookie) => response.headers.append('Set-Cookie', cookie))
        return response
      }
    } catch {}
  }

  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('redirect', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
