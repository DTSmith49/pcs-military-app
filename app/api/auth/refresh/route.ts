/**
 * POST /api/auth/refresh
 * AUTH-02: Rotate refresh token and issue a fresh access token.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { rotateSession } from '@/lib/auth/tokens'

export async function POST(request: Request) {
  const jar = await cookies()
  const oldToken = jar.get('refresh_token')?.value

  if (!oldToken) {
    return NextResponse.json({ error: 'No refresh token.' }, { status: 401 })
  }

  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const result = await rotateSession(oldToken, {
    userAgent: request.headers.get('user-agent') ?? undefined,
    ipAddress: ip,
  })

  if (!result) {
    jar.delete('access_token')
    jar.delete('refresh_token')
    return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 })
  }

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
  jar.set('access_token', result.accessToken, { ...cookieOpts, maxAge: 60 * 15 })
  jar.set('refresh_token', result.refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 })

  return NextResponse.json({ ok: true })
}
