/**
 * lib/supabase/server.ts
 * Server-side Supabase client (service-role key, bypasses RLS for auth ops).
 * Import this only in API routes / Server Actions — never in client components.
 */
import { createClient as _createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env vars are not configured')
  return _createClient<Database>(url, key)
}
