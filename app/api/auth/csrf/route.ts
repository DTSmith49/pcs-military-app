import { NextResponse } from 'next/server'
import { ensureCsrfToken } from '@/lib/auth/csrf'

export async function GET() {
  const token = await ensureCsrfToken()
  return NextResponse.json({ token })
}
