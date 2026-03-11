// lib/supabaseServerClient.ts
// Server-side Supabase client — uses createClient from @supabase/supabase-js,
// NOT createBrowserClient. Safe to use in API routes and Server Components.
import { createClient } from "@supabase/supabase-js";

export function createSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
