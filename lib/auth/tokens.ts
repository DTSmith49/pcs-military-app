/**
 * lib/auth/tokens.ts
 * AUTH-02: Persist refresh tokens in the `sessions` table and rotate them.
 * AUTH-04: Reset token generation (hex, stored as bcrypt hash).
 */
import { randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { signRefreshToken, verifyRefreshToken } from './jwt'
import { hashPassword } from './password'

/** Create a new session row and return the signed refresh token */
export async function createSession(
  userId: string,
  meta: { userAgent?: string; ipAddress?: string },
): Promise<string> {
  const supabase = await createClient()
  const sessionId = randomBytes(16).toString('hex')
  const token = await signRefreshToken({ sub: userId, sessionId })

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  await supabase.from('sessions').insert({
    id: sessionId,
    user_id: userId,
    refresh_token: token,
    expires_at: expiresAt.toISOString(),
    user_agent: meta.userAgent,
    ip_address: meta.ipAddress,
  })

  return token
}

/** Rotate: revoke old session, issue new one */
export async function rotateSession(
  oldToken: string,
  meta: { userAgent?: string; ipAddress?: string },
): Promise<{ accessToken: string; refreshToken: string; userId: string } | null> {
  const supabase = await createClient()

  // 1. Verify JWT structure
  let payload: Awaited<ReturnType<typeof verifyRefreshToken>>
  try {
    payload = await verifyRefreshToken(oldToken)
  } catch {
    return null
  }

  // 2. Look up session in DB — must still be valid
  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', payload.sessionId)
    .eq('refresh_token', oldToken)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!session) return null

  // 3. Revoke old session
  await supabase
    .from('sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', session.id)

  // 4. Fetch user for new token claims
  const { data: user } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('id', session.user_id)
    .single()

  if (!user) return null

  // 5. Issue new tokens
  const { signAccessToken } = await import('./jwt')
  const accessToken = await signAccessToken({ sub: user.id, email: user.email, role: user.role })
  const refreshToken = await createSession(user.id, meta)

  return { accessToken, refreshToken, userId: user.id }
}

/** Generate a password-reset token (hex), store bcrypt hash, return raw token */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const supabase = await createClient()
  const raw = randomBytes(32).toString('hex')
  const hashed = await hashPassword(raw)

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

  // Upsert into a simple password_reset_tokens table (created in migration 0003)
  await supabase.from('password_reset_tokens').upsert({
    user_id: userId,
    token_hash: hashed,
    expires_at: expiresAt.toISOString(),
    used: false,
  })

  return raw
}
