/**
 * GET /api/auth/google/callback
 * AUTH-03: Handle Google OIDC callback — exchange code, upsert user, issue tokens.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { signAccessToken } from '@/lib/auth/jwt'
import { createSession } from '@/lib/auth/tokens'
import { AUTH_CONFIG } from '@/lib/auth/config'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const jar = await cookies()
  const savedState = jar.get('oauth_state')?.value
  jar.delete('oauth_state')
  jar.delete('oauth_nonce')

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(`${AUTH_CONFIG.appUrl}/login?error=oauth_state_mismatch`)
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: AUTH_CONFIG.google.clientId,
      client_secret: AUTH_CONFIG.google.clientSecret,
      redirect_uri: `${AUTH_CONFIG.appUrl}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${AUTH_CONFIG.appUrl}/login?error=oauth_token_exchange`)
  }

  const { id_token } = await tokenRes.json()

  // Decode id_token (trust Google's signature; validate aud in production via jose)
  const [, payloadB64] = id_token.split('.')
  const idPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString())
  const { email, sub: googleSub, email_verified } = idPayload

  if (!email || !email_verified) {
    return NextResponse.redirect(`${AUTH_CONFIG.appUrl}/login?error=unverified_google_email`)
  }

  const supabase = await createClient()

  // Upsert user by email
  const { data: user } = await supabase
    .from('users')
    .upsert(
      {
        email: email.toLowerCase(),
        email_verified: true,
        email_verified_at: new Date().toISOString(),
      },
      { onConflict: 'email', ignoreDuplicates: false },
    )
    .select('id, email, role')
    .single()

  if (!user) {
    return NextResponse.redirect(`${AUTH_CONFIG.appUrl}/login?error=upsert_failed`)
  }

  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const accessToken = await signAccessToken({ sub: user.id, email: user.email, role: user.role })
  const refreshToken = await createSession(user.id, {
    userAgent: request.headers.get('user-agent') ?? undefined,
    ipAddress: ip,
  })

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
  jar.set('access_token', accessToken, { ...cookieOpts, maxAge: 60 * 15 })
  jar.set('refresh_token', refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 })

  return NextResponse.redirect(`${AUTH_CONFIG.appUrl}/`)
}
