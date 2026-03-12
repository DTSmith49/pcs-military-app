/**
 * lib/auth/jwt.ts
 * AUTH-02: Access + refresh token helpers using jose (Web Crypto, Edge-compatible).
 */
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { AUTH_CONFIG } from './config'

export interface AccessTokenPayload extends JWTPayload {
  sub: string       // user UUID
  email: string
  role: string
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string
  sessionId: string
}

const encoder = new TextEncoder()

function getSecret() {
  return encoder.encode(AUTH_CONFIG.jwtSecret)
}

// ── Access token (15 min) ────────────────────────────────────────────────────

export async function signAccessToken(
  payload: Omit<AccessTokenPayload, 'iat' | 'exp'>,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(AUTH_CONFIG.accessTokenTTL)
    .sign(getSecret())
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as AccessTokenPayload
}

// ── Refresh token (30 days) ──────────────────────────────────────────────────

export async function signRefreshToken(
  payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(AUTH_CONFIG.refreshTokenTTL)
    .sign(getSecret())
}

export async function verifyRefreshToken(
  token: string,
): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as RefreshTokenPayload
}
