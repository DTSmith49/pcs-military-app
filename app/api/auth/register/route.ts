/**
 * POST /api/auth/register
 * AUTH-01: Create a new account with email + password.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/auth/rateLimit'
import { validateCsrf } from '@/lib/auth/csrf'
import { sendWelcomeEmail } from '@/lib/email/sendWelcomeEmail'

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

export async function POST(request: Request) {
  // CSRF
  if (!(await validateCsrf(request))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }

  // Rate limit by IP
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkRateLimit(`register:${ip}`)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: getRateLimitHeaders(`register:${ip}`) },
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = RegisterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { email, password } = parsed.data

  const strengthError = validatePasswordStrength(password)
  if (strengthError) {
    return NextResponse.json({ error: strengthError }, { status: 400 })
  }

  const supabase = await createClient()

  // Check for existing account
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single()

  if (existing) {
    return NextResponse.json(
      { message: 'If that email is not registered, you will receive a verification link.' },
      { status: 200 },
    )
  }

  const passwordHash = await hashPassword(password)

  const { data: user, error } = await supabase
    .from('users')
    .insert({ email: email.toLowerCase(), password_hash: passwordHash })
    .select('id, email')
    .single()

  if (error || !user) {
    console.error('[register] insert error', error)
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }

  // Send welcome email — fire and forget, never blocks registration
  void sendWelcomeEmail(user.email)

  return NextResponse.json(
    { message: 'Account created. Please check your email to verify your address.' },
    { status: 201 },
  )
}
