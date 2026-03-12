/**
 * lib/auth/rateLimit.ts
 * AUTH-05: In-memory rate limiter for auth routes.
 * For production, swap the Map for a Redis INCR/EXPIRE implementation.
 */
import { AUTH_CONFIG } from './config'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

/**
 * Returns true if the key is under the rate limit (request allowed).
 * Returns false if the limit is exceeded.
 */
export function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + AUTH_CONFIG.rateLimitWindowMs })
    return true
  }

  if (entry.count >= AUTH_CONFIG.rateLimitMax) return false

  entry.count++
  return true
}

export function getRateLimitHeaders(key: string): Record<string, string> {
  const entry = store.get(key)
  if (!entry) return {}
  return {
    'X-RateLimit-Limit': String(AUTH_CONFIG.rateLimitMax),
    'X-RateLimit-Remaining': String(Math.max(0, AUTH_CONFIG.rateLimitMax - entry.count)),
    'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
  }
}
