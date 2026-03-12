/**
 * lib/auth/password.ts
 * AUTH-01: bcrypt helpers for hashing and verification.
 * Uses bcryptjs (pure-JS, no native bindings needed on Edge).
 */
import bcrypt from 'bcryptjs'
import { AUTH_CONFIG } from './config'

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, AUTH_CONFIG.bcryptRounds)
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

/** Minimum password requirements */
export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter.'
  if (!/[0-9]/.test(password)) return 'Password must contain a number.'
  return null // valid
}
