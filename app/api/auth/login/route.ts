/**
 * POST /api/auth/login
 * AUTH-01: Email + password login.
 * AUTH-02: Issues access token (httpOnly) + refresh token (httpOnly).
 * AUTH-04: Enforces account lockout.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { verifyPassword } from '@/lib/auth/password'
import { signAccessToken } from '@/lib/auth/jwt'
import { createSession } from '@/lib/auth/tokens'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/auth/rateLimit'
import { validateCsrf } from '@/lib/auth/csrf'
import { AUTH_CONFIG } from '@/lib/auth/config'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
})

export async function POST(request: Request) {
  if (!(await validateCsrf(request))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }

  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkRateLimit(`login:${ip}`)) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: getRateLimitHeaders(`login:${ip}`) },
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = LoginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 400 })
  }

  const { email, password } = parsed.data
  const supabase = await createClient()

  const { data: user } = await supabase
    .from('users')
    .select('id, email, role, password_hash, is_active, email_verified, failed_login_attempts, locked_until')
    .eq('email', email.toLowerCase())
    .single()

  // Generic error — do not reveal whether account exists
  const INVALID = NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })

  if (!user || !user.password_hash) return INVALID
  if (!user.is_active) return INVALID

  // Lockout check
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    return NextResponse.json(
      { error: `Account locked. Try again after ${new Date(user.locked_until).toLocaleTimeString()}.` },
      { status: 403 },
    )
  }

  const valid = await verifyPassword(password, user.password_hash)

  if (!valid) {
    const attempts = (user.failed_login_attempts ?? 0) + 1
    const lockedUntil =
      attempts >= AUTH_CONFIG.maxFailedAttempts
        ? new Date(Date.now() + AUTH_CONFIG.lockoutMinutes * 60_000).toISOString()
        : null

    await supabase
      .from('users')
      .update({ failed_login_attempts: attempts, locked_until: lockedUntil })
      .eq('id', user.id)

    return INVALID
  }

  // Reset failed attempts on success
  await supabase
    .from('users')
    .update({ failed_login_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() })
    .eq('id', user.id)

  const accessToken = await signAccessToken({ sub: user.id, email: user.email, role: user.role })
  const refreshToken = await createSession(user.id, {
    userAgent: request.headers.get('user-agent') ?? undefined,
    ipAddress: ip,
  })

  const jar = await cookies()
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
  jar.set('access_token', accessToken, { ...cookieOpts, maxAge: 60 * 15 })
  jar.set('refresh_token', refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 })

  return NextResponse.json({ ok: true, role: user.role })
}
