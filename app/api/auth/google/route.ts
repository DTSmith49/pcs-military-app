/**
 * GET /api/auth/google
 * AUTH-03: Initiate Google OIDC flow — redirect to Google's auth endpoint.
 */
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { AUTH_CONFIG } from '@/lib/auth/config'

export async function GET() {
  const state = randomBytes(16).toString('hex')
  const nonce = randomBytes(16).toString('hex')

  const jar = await cookies()
  jar.set('oauth_state', state, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 600 })
  jar.set('oauth_nonce', nonce, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 600 })

  const params = new URLSearchParams({
    client_id: AUTH_CONFIG.google.clientId,
    redirect_uri: `${AUTH_CONFIG.appUrl}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    nonce,
    access_type: 'offline',
    prompt: 'select_account',
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
