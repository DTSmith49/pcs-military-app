export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  PostgrestVersion: "12"
  public: {
    Tables: {
      schools: {
        Row: { id: string; name: string; city: string | null; state: string; created_at: string }
        Insert: { id?: string; name: string; city?: string | null; state: string; created_at?: string }
        Update: { id?: string; name?: string; city?: string | null; state?: string; created_at?: string }
      }
      reviews: {
        Row: {
          id: string; school_id: string | null; created_at: string; interstate_compact: string | null
          purple_star: string | null; iep504_status: string | null; academic_experience: number | null
          community_belonging: number | null; communication_engagement: number | null
          special_needs_support: number | null; overall_fit: number | null
          extra_notes: string | null; enrollment_transition: number | null
        }
        Insert: {
          id?: string; school_id?: string | null; created_at?: string; interstate_compact?: string | null
          purple_star?: string | null; iep504_status?: string | null; academic_experience?: number | null
          community_belonging?: number | null; communication_engagement?: number | null
          special_needs_support?: number | null; overall_fit?: number | null
          extra_notes?: string | null; enrollment_transition?: number | null
        }
        Update: {
          id?: string; school_id?: string | null; interstate_compact?: string | null
          purple_star?: string | null; iep504_status?: string | null; academic_experience?: number | null
          community_belonging?: number | null; communication_engagement?: number | null
          special_needs_support?: number | null; overall_fit?: number | null
          extra_notes?: string | null; enrollment_transition?: number | null
        }
      }
      users: {
        Row: {
          id: string; email: string; password_hash: string | null; email_verified: boolean
          email_verified_at: string | null; sso_provider: string | null; sso_provider_user_id: string | null
          role: string | null; is_active: boolean; failed_login_attempts: number | null
          locked_until: string | null; last_login_at: string | null; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; email: string; password_hash?: string | null; email_verified?: boolean
          email_verified_at?: string | null; sso_provider?: string | null; sso_provider_user_id?: string | null
          role?: string | null; is_active?: boolean; failed_login_attempts?: number | null
          locked_until?: string | null; last_login_at?: string | null; created_at?: string; updated_at?: string
        }
        Update: {
          id?: string; email?: string; password_hash?: string | null; email_verified?: boolean
          email_verified_at?: string | null; sso_provider?: string | null; sso_provider_user_id?: string | null
          role?: string | null; is_active?: boolean; failed_login_attempts?: number | null
          locked_until?: string | null; last_login_at?: string | null; updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string; user_id: string; refresh_token: string; expires_at: string
          revoked_at: string | null; user_agent: string | null; ip_address: string | null; created_at: string
        }
        Insert: {
          id?: string; user_id: string; refresh_token: string; expires_at: string
          revoked_at?: string | null; user_agent?: string | null; ip_address?: string | null; created_at?: string
        }
        Update: {
          id?: string; user_id?: string; refresh_token?: string; expires_at?: string
          revoked_at?: string | null; user_agent?: string | null; ip_address?: string | null
        }
      }
      password_reset_tokens: {
        Row: { id: string; user_id: string; token_hash: string; expires_at: string; used: boolean; created_at: string }
        Insert: { id?: string; user_id: string; token_hash: string; expires_at: string; used?: boolean; created_at?: string }
        Update: { id?: string; user_id?: string; token_hash?: string; expires_at?: string; used?: boolean }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
