/**
 * POST /api/auth/forgot-password
 * AUTH-04: Generate and (eventually) email a password-reset link.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createPasswordResetToken } from '@/lib/auth/tokens'
import { checkRateLimit } from '@/lib/auth/rateLimit'

const Schema = z.object({ email: z.string().email() })

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkRateLimit(`forgot:${ip}`)) {
    return NextResponse.json({ message: GENERIC_MSG }, { status: 200 })
  }

  const body = await request.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: GENERIC_MSG }, { status: 200 })

  const supabase = await createClient()
  const { data: user } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', parsed.data.email.toLowerCase())
    .single()

  if (user) {
    const token = await createPasswordResetToken(user.id)
    // TODO (EMAIL-TMPL): send reset email with token
    console.log(`[forgot-password] reset token for ${user.email}: ${token}`)
  }

  return NextResponse.json({ message: GENERIC_MSG }, { status: 200 })
}

// Always return the same message to prevent email enumeration
const GENERIC_MSG = 'If an account exists for that email, a reset link has been sent.'
