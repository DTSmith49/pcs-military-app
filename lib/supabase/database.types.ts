export type Database = {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name: string;
          city: string | null;
          state: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          city?: string | null;
          state: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          city?: string | null;
          state?: string;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          school_id: string | null;
          created_at: string;
          interstate_compact: string | null;
          purple_star: string | null;
          iep504_status: string | null;
          academic_experience: number | null;
          community_belonging: number | null;
          communication_engagement: number | null;
          special_needs_support: number | null;
          overall_fit: number | null;
          extra_notes: string | null;
          enrollment_transition: number | null;
        };
        Insert: {
          id?: string;
          school_id?: string | null;
          created_at?: string;
          interstate_compact?: string | null;
          purple_star?: string | null;
          iep504_status?: string | null;
          academic_experience?: number | null;
          community_belonging?: number | null;
          communication_engagement?: number | null;
          special_needs_support?: number | null;
          overall_fit?: number | null;
          extra_notes?: string | null;
          enrollment_transition?: number | null;
        };
        Update: {
          id?: string;
          school_id?: string | null;
          interstate_compact?: string | null;
          purple_star?: string | null;
          iep504_status?: string | null;
          academic_experience?: number | null;
          community_belonging?: number | null;
          communication_engagement?: number | null;
          special_needs_support?: number | null;
          overall_fit?: number | null;
          extra_notes?: string | null;
          enrollment_transition?: number | null;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string | null;
          email_verified: boolean;
          email_verified_at: string | null;
          sso_provider: string | null;
          sso_provider_user_id: string | null;
          role: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash?: string | null;
          email_verified?: boolean;
          email_verified_at?: string | null;
          sso_provider?: string | null;
          sso_provider_user_id?: string | null;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string | null;
          email_verified?: boolean;
          email_verified_at?: string | null;
          sso_provider?: string | null;
          sso_provider_user_id?: string | null;
          role?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};
