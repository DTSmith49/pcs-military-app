/**
 * lib/auth/csrf.ts
 * AUTH-05: Double-submit cookie CSRF protection.
 * On the client, read the cookie and echo it in the X-CSRF-Token header.
 */
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

const CSRF_COOKIE = 'csrf_token'
const CSRF_HEADER = 'x-csrf-token'

/** Set a CSRF cookie if one does not already exist; return the token value */
export async function ensureCsrfToken(): Promise<string> {
  const jar = await cookies()
  const existing = jar.get(CSRF_COOKIE)?.value
  if (existing) return existing

  const token = randomBytes(24).toString('hex')
  jar.set(CSRF_COOKIE, token, {
    httpOnly: false,  // must be readable by JS for double-submit
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  return token
}

/** Validate that the header matches the cookie — call in mutation API routes */
export async function validateCsrf(request: Request): Promise<boolean> {
  const jar = await cookies()
  const cookieToken = jar.get(CSRF_COOKIE)?.value
  const headerToken = request.headers.get(CSRF_HEADER)
  if (!cookieToken || !headerToken) return false
  return cookieToken === headerToken
}
