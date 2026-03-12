/**
 * POST /api/auth/reset-password
 * AUTH-04: Consume a reset token and update the user's password.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { hashPassword, verifyPassword, validatePasswordStrength } from '@/lib/auth/password'

const Schema = z.object({
  token: z.string().min(64).max(64),
  password: z.string().min(8).max(128),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { token, password } = parsed.data

  const strengthError = validatePasswordStrength(password)
  if (strengthError) return NextResponse.json({ error: strengthError }, { status: 400 })

  const supabase = await createClient()

  // Fetch all non-expired, unused tokens and find a bcrypt match
  const { data: rows } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())

  const match = rows
    ? await Promise.all(
        rows.map(async (row) => ({
          row,
          valid: await verifyPassword(token, row.token_hash),
        })),
      ).then((results) => results.find((r) => r.valid))
    : null

  if (!match) {
    return NextResponse.json({ error: 'Reset link is invalid or has expired.' }, { status: 400 })
  }

  const newHash = await hashPassword(password)

  await Promise.all([
    supabase.from('users').update({ password_hash: newHash }).eq('id', match.row.user_id),
    supabase.from('password_reset_tokens').update({ used: true }).eq('id', match.row.id),
    // Revoke all existing sessions for this user
    supabase
      .from('sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', match.row.user_id)
      .is('revoked_at', null),
  ])

  return NextResponse.json({ message: 'Password updated. Please log in.' })
}
