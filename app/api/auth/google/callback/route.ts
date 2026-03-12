/**
 * GET /api/auth/google/callback
 * AUTH-SSO-02 / AUTH-SSO-03 / AUTH-SSO-04:
 * Handle Google OIDC callback — verify ID token via JWKS, upsert user, issue tokens.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { createClient } from '@/lib/supabase/server'
import { signAccessToken } from '@/lib/auth/jwt'
import { createSession } from '@/lib/auth/tokens'
import { AUTH_CONFIG } from '@/lib/auth/config'

/** Google's public JWKS endpoint — cached automatically by jose */
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const jar = await cookies()
  const savedState = jar.get('oauth_state')?.value
  const savedNonce = jar.get('oauth_nonce')?.value
  jar.delete('oauth_state')
  jar.delete('oauth_nonce')

  // CSRF: verify state param matches what we set
  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(`${AUTH_CONFIG.appUrl}/login?error=oauth_state_mismatch`)
  }

  // Step 1 — Exchange authorization code for Google tokens
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

  // Step 2 — Cryptographically verify the ID token via Google's JWKS
  // This confirms: signature is valid, token is from Google, aud matches our client_id,
  // issuer is accounts.google.com, token has not expired, and nonce matches.
  let idPayload: {
    email: string
    email_verified: boolean
    sub: string
    nonce?: string
  }

  try {
    const { payload } = await jwtVerify(id_token, GOOGLE_JWKS, {
      issuer: 'https://accounts.google.com',
      audience: AUTH_CONFIG.google.clientId,
    })

    // Verify nonce matches what we stored in the cookie (replay attack prevention)
    if (savedNonce && payload.nonce !== savedNonce) {
      return NextResponse.redirect(`${AUTH_CONFIG.appUrl}/login?error=oauth_nonce_mismatch`)
    }

    idPayload = payload as typeof idPayload
  } catch {
    return NextResponse.redirect(`${AUTH_CONFIG.appUrl}/login?error=oauth_id_token_invalid`)
  }

  const { email, sub: googleSub, email_verified } = idPayload

  if (!email || !email_verified) {
    return NextResponse.redirect(`${AUTH_CONFIG.appUrl}/login?error=unverified_google_email`)
  }

  // Step 3 — Upsert user (AUTH-SSO-02: new user created with is_verified=true;
  //           AUTH-SSO-03: existing email/password account is linked automatically)
  const supabase = await createClient()

  const { data: user } = await supabase
    .from('users')
    .upsert(
      {
        email: email.toLowerCase(),
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        sso_provider: 'google',
        sso_provider_user_id: googleSub,
      },
      { onConflict: 'email', ignoreDuplicates: false },
    )
    .select('id, email, role')
    .single()

  if (!user) {
    return NextResponse.redirect(`${AUTH_CONFIG.appUrl}/login?error=upsert_failed`)
  }

  // Step 4 — Issue internal JWT access token + refresh token session (AUTH-SSO-04)
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
