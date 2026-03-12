/**
 * middleware.ts
 * AUTH-05: HTTPS redirect, HSTS, security headers, and access-token validation.
 * Runs on every request matched by `config.matcher`.
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/lib/auth/jwt'

/** Routes that require authentication */
const PROTECTED_PREFIXES = ['/admin', '/account', '/api/auth/logout', '/api/auth/refresh']

/** Routes that should redirect to home if already authenticated */
const AUTH_ONLY_ROUTES = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname, protocol } = request.nextUrl

  // 1. Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && protocol === 'http:') {
    const httpsUrl = request.nextUrl.clone()
    httpsUrl.protocol = 'https:'
    return NextResponse.redirect(httpsUrl, { status: 301 })
  }

  // 2. Set security headers on every response
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    )
  }

  // 3. Validate access token for protected routes
  const accessToken = request.cookies.get('access_token')?.value
  let userId: string | null = null

  if (accessToken) {
    try {
      const payload = await verifyAccessToken(accessToken)
      userId = payload.sub
    } catch {
      // Expired or invalid — will be refreshed by client interceptor
    }
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthOnly = AUTH_ONLY_ROUTES.some((p) => pathname.startsWith(p))

  if (isProtected && !userId) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthOnly && userId) {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = '/'
    return NextResponse.redirect(homeUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
