/**
 * lib/auth/config.ts
 * Central auth configuration — pulled from environment variables.
 * All values are required at runtime; app will throw on startup if missing.
 */
export const AUTH_CONFIG = {
  /** bcrypt work factor (12 = ~250 ms on modern hardware) */
  bcryptRounds: 12,

  /** JWT access token TTL */
  accessTokenTTL: '15m',

  /** JWT refresh token TTL */
  refreshTokenTTL: '30d',

  /** How many failed logins before lockout */
  maxFailedAttempts: 5,

  /** Lockout duration in minutes */
  lockoutMinutes: 15,

  /** Rate-limit: max requests per window */
  rateLimitMax: 10,
  rateLimitWindowMs: 60_000, // 1 minute

  get jwtSecret(): string {
    const s = process.env.JWT_SECRET
    if (!s) throw new Error('JWT_SECRET is not set')
    return s
  },

  get appUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  },

  google: {
    get clientId(): string {
      const v = process.env.GOOGLE_CLIENT_ID
      if (!v) throw new Error('GOOGLE_CLIENT_ID is not set')
      return v
    },
    get clientSecret(): string {
      const v = process.env.GOOGLE_CLIENT_SECRET
      if (!v) throw new Error('GOOGLE_CLIENT_SECRET is not set')
      return v
    },
  },
} as const
