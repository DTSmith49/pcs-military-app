/**
 * POST /api/auth/logout
 * AUTH-02: Revoke the refresh token session and clear auth cookies.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { verifyRefreshToken } from '@/lib/auth/jwt'

export async function POST() {
  const jar = await cookies()
  const refreshToken = jar.get('refresh_token')?.value

  if (refreshToken) {
    try {
      const payload = await verifyRefreshToken(refreshToken)
      const supabase = await createClient()
      await supabase
        .from('sessions')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', payload.sessionId)
    } catch {
      // Token already invalid — still clear cookies
    }
  }

  jar.delete('access_token')
  jar.delete('refresh_token')

  return NextResponse.json({ ok: true })
}
