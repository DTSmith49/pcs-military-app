export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          answer_numeric: number | null
          answer_option: string | null
          answer_text: string | null
          created_at: string
          id: string
          question_id: string
          response_id: string
        }
        Insert: {
          answer_numeric?: number | null
          answer_option?: string | null
          answer_text?: string | null
          created_at?: string
          id?: string
          question_id: string
          response_id: string
        }
        Update: {
          answer_numeric?: number | null
          answer_option?: string | null
          answer_text?: string | null
          created_at?: string
          id?: string
          question_id?: string
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "survey_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id: string | null
          created_at: string
          id: number
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          created_at?: string
          id?: number
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          created_at?: string
          id?: number
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token_hash: string
          used: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token_hash: string
          used?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token_hash?: string
          used?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          is_scored: boolean
          question_order: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          response_options: Json | null
          score_weight: number
          section: string
          section_order: number
          validated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          is_scored?: boolean
          question_order: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          response_options?: Json | null
          score_weight?: number
          section: string
          section_order: number
          validated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          is_scored?: boolean
          question_order?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          response_options?: Json | null
          score_weight?: number
          section?: string
          section_order?: number
          validated_by?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          academic_experience: number | null
          communication_engagement: number | null
          community_belonging: number | null
          created_at: string | null
          extra_notes: string | null
          id: string
          iep504_status: string | null
          interstate_compact: string | null
          overall_fit: number | null
          purple_star: string | null
          school_id: string | null
          special_needs_support: number | null
        }
        Insert: {
          academic_experience?: number | null
          communication_engagement?: number | null
          community_belonging?: number | null
          created_at?: string | null
          extra_notes?: string | null
          id?: string
          iep504_status?: string | null
          interstate_compact?: string | null
          overall_fit?: number | null
          purple_star?: string | null
          school_id?: string | null
          special_needs_support?: number | null
        }
        Update: {
          academic_experience?: number | null
          communication_engagement?: number | null
          community_belonging?: number | null
          created_at?: string | null
          extra_notes?: string | null
          id?: string
          iep504_status?: string | null
          interstate_compact?: string | null
          overall_fit?: number | null
          purple_star?: string | null
          school_id?: string | null
          special_needs_support?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          city: string | null
          created_at: string
          id: string
          name: string
          state: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          name: string
          state?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          state?: string | null
        }
        Relationships: []
      }
      score_snapshots: {
        Row: {
          academic_experience_score: number | null
          communication_engagement_score: number | null
          community_belonging_score: number | null
          composite_score: number | null
          computed_at: string
          enrollment_transition_score: number | null
          id: string
          is_suppressed: boolean
          nps_score: number | null
          overall_military_friendly_score: number | null
          response_count: number
          school_id: string
          scored_response_count: number
          snapshot_period_end: string | null
          snapshot_period_start: string | null
          special_needs_support_score: number | null
          suppression_reason: string | null
        }
        Insert: {
          academic_experience_score?: number | null
          communication_engagement_score?: number | null
          community_belonging_score?: number | null
          composite_score?: number | null
          computed_at?: string
          enrollment_transition_score?: number | null
          id?: string
          is_suppressed?: boolean
          nps_score?: number | null
          overall_military_friendly_score?: number | null
          response_count?: number
          school_id: string
          scored_response_count?: number
          snapshot_period_end?: string | null
          snapshot_period_start?: string | null
          special_needs_support_score?: number | null
          suppression_reason?: string | null
        }
        Update: {
          academic_experience_score?: number | null
          communication_engagement_score?: number | null
          community_belonging_score?: number | null
          composite_score?: number | null
          computed_at?: string
          enrollment_transition_score?: number | null
          id?: string
          is_suppressed?: boolean
          nps_score?: number | null
          overall_military_friendly_score?: number | null
          response_count?: number
          school_id?: string
          scored_response_count?: number
          snapshot_period_end?: string | null
          snapshot_period_start?: string | null
          special_needs_support_score?: number | null
          suppression_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "score_snapshots_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          expires_at: string
          id: string
          ip_address: unknown
          issued_at: string
          refresh_token: string
          revoked_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          expires_at: string
          id?: string
          ip_address?: unknown
          issued_at?: string
          refresh_token: string
          revoked_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          expires_at?: string
          id?: string
          ip_address?: unknown
          issued_at?: string
          refresh_token?: string
          revoked_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          anchor_text: string | null
          created_at: string
          dedup_hash: string | null
          id: string
          linked_at: string | null
          linked_by: string | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          one_thing_text: string | null
          pcs_moves: Database["public"]["Enums"]["pcs_moves_range"] | null
          reviewer_branch: Database["public"]["Enums"]["military_branch"] | null
          reviewer_relationship:
            | Database["public"]["Enums"]["military_relationship"]
            | null
          school_id: string | null
          school_year: string | null
          status: Database["public"]["Enums"]["response_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          anchor_text?: string | null
          created_at?: string
          dedup_hash?: string | null
          id?: string
          linked_at?: string | null
          linked_by?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          one_thing_text?: string | null
          pcs_moves?: Database["public"]["Enums"]["pcs_moves_range"] | null
          reviewer_branch?:
            | Database["public"]["Enums"]["military_branch"]
            | null
          reviewer_relationship?:
            | Database["public"]["Enums"]["military_relationship"]
            | null
          school_id?: string | null
          school_year?: string | null
          status?: Database["public"]["Enums"]["response_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          anchor_text?: string | null
          created_at?: string
          dedup_hash?: string | null
          id?: string
          linked_at?: string | null
          linked_by?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          one_thing_text?: string | null
          pcs_moves?: Database["public"]["Enums"]["pcs_moves_range"] | null
          reviewer_branch?:
            | Database["public"]["Enums"]["military_branch"]
            | null
          reviewer_relationship?:
            | Database["public"]["Enums"]["military_relationship"]
            | null
          school_id?: string | null
          school_year?: string | null
          status?: Database["public"]["Enums"]["response_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_linked_by_fkey"
            columns: ["linked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          deactivated_at: string | null
          deactivated_by: string | null
          email: string
          email_verified: boolean
          email_verified_at: string | null
          failed_login_attempts: number
          id: string
          is_active: boolean
          last_login_at: string | null
          locked_until: string | null
          military_branch: Database["public"]["Enums"]["military_branch"] | null
          military_relationship:
            | Database["public"]["Enums"]["military_relationship"]
            | null
          password_hash: string | null
          pcs_moves: Database["public"]["Enums"]["pcs_moves_range"] | null
          role: Database["public"]["Enums"]["user_role"]
          sso_provider: string | null
          sso_provider_user_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          email: string
          email_verified?: boolean
          email_verified_at?: string | null
          failed_login_attempts?: number
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          locked_until?: string | null
          military_branch?:
            | Database["public"]["Enums"]["military_branch"]
            | null
          military_relationship?:
            | Database["public"]["Enums"]["military_relationship"]
            | null
          password_hash?: string | null
          pcs_moves?: Database["public"]["Enums"]["pcs_moves_range"] | null
          role?: Database["public"]["Enums"]["user_role"]
          sso_provider?: string | null
          sso_provider_user_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          email?: string
          email_verified?: boolean
          email_verified_at?: string | null
          failed_login_attempts?: number
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          locked_until?: string | null
          military_branch?:
            | Database["public"]["Enums"]["military_branch"]
            | null
          military_relationship?:
            | Database["public"]["Enums"]["military_relationship"]
            | null
          password_hash?: string | null
          pcs_moves?: Database["public"]["Enums"]["pcs_moves_range"] | null
          role?: Database["public"]["Enums"]["user_role"]
          sso_provider?: string | null
          sso_provider_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_deactivated_by_fkey"
            columns: ["deactivated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      audit_action:
        | "insert"
        | "update"
        | "delete"
        | "login"
        | "logout"
        | "flag"
        | "moderate"
        | "link"
        | "export"
      military_branch:
        | "army"
        | "navy"
        | "air_force"
        | "marine_corps"
        | "coast_guard"
        | "space_force"
      military_relationship:
        | "active_duty"
        | "military_spouse"
        | "veteran"
        | "guard_reserve"
      pcs_moves_range: "1" | "2-3" | "4-5" | "6+"
      question_type:
        | "likert_5"
        | "bipolar_5"
        | "categorical"
        | "categorical_comment"
        | "ordinal_time"
        | "agreement_5"
        | "nps_0_10"
        | "open_text"
      response_status: "draft" | "submitted" | "flagged" | "removed" | "linked"
      user_role: "reviewer" | "admin" | "moderator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      audit_action: [
        "insert",
        "update",
        "delete",
        "login",
        "logout",
        "flag",
        "moderate",
        "link",
        "export",
      ],
      military_branch: [
        "army",
        "navy",
        "air_force",
        "marine_corps",
        "coast_guard",
        "space_force",
      ],
      military_relationship: [
        "active_duty",
        "military_spouse",
        "veteran",
        "guard_reserve",
      ],
      pcs_moves_range: ["1", "2-3", "4-5", "6+"],
      question_type: [
        "likert_5",
        "bipolar_5",
        "categorical",
        "categorical_comment",
        "ordinal_time",
        "agreement_5",
        "nps_0_10",
        "open_text",
      ],
      response_status: ["draft", "submitted", "flagged", "removed", "linked"],
      user_role: ["reviewer", "admin", "moderator"],
    },
  },
} as const
