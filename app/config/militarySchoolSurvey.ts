// app/config/militarySchoolSurvey.ts

export type FieldType =
  | "school_search"
  | "single_select"
  | "likert_5"
  | "likert_5_agreement"
  | "long_text"
  | "short_text"
  | "numeric_scale"
  | "checkbox"
  | "email";

export interface ConditionalDisplay {
  field: string;
  value: string;
}

export interface FieldConfig {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  scale_labels?: string[];
  min?: number;
  max?: number;
  conditional?: ConditionalDisplay;
}

export interface SectionConfig {
  id: string;
  title: string;
  fields: FieldConfig[];
}

export interface SurveyConfig {
  id: string;
  title: string;
  sections: SectionConfig[];
}

export const militarySchoolSurvey: SurveyConfig = {
  id: "military_school_review",
  title: "Military Family School Experience Survey",
  sections: [
    {
      id: "school_student_context",
      title: "School & student context",
      fields: [
        {
          id: "school_name",
          label: "School name",
          type: "school_search",
          required: true
        },
        {
          id: "school_year_attended",
          label: "When did your child attend this school?",
          type: "single_select",
          required: true,
          options: ["2024–2025", "2023–2024", "2022–2023", "Earlier"]
        },
        {
          id: "grade_level",
          label: "Grade level of your child at this school",
          type: "single_select",
          required: true,
          options: ["Elementary", "Middle", "High", "Other"]
        },
        {
          id: "pcs_moves",
          label: "How many PCS moves has your family completed?",
          type: "single_select",
          required: true,
          options: ["1", "2–3", "4–5", "6+"]
        },
        {
          id: "military_relationship",
          label: "What is your relationship to the military?",
          type: "single_select",
          required: true,
          options: [
            "Active duty service member",
            "Military spouse",
            "Veteran",
            "Guard/Reserve",
            "Other"
          ]
        },
        {
          id: "branch",
          label: "Branch of service",
          type: "single_select",
          required: true,
          options: [
            "Army",
            "Navy",
            "Air Force",
            "Marine Corps",
            "Coast Guard",
            "Space Force"
          ]
        }
      ]
    },
    {
      id: "academic_experience",
      title: "Academic experience",
      fields: [
        {
          id: "academic_pace",
          label:
            "How would you rate this school’s academic pace compared to your child’s previous school?",
          type: "likert_5",
          required: true,
          scale_labels: [
            "Much slower",
            "Somewhat slower",
            "About the same",
            "Somewhat faster",
            "Much faster"
          ]
        },
        {
          id: "credits_accepted",
          label:
            "Did this school accept all of your child’s previously earned credits without requiring retesting or repeating coursework?",
          type: "single_select",
          required: true,
          options: ["Yes", "No", "Partially"]
        },
        {
          id: "credits_accepted_comment",
          label: "If partially, please explain.",
          type: "long_text",
          required: false,
          conditional: {
            field: "credits_accepted",
            value: "Partially"
          }
        },
        {
          id: "curriculum_alignment",
          label:
            "How well did this school’s curriculum align with what your child had already learned?",
          type: "likert_5",
          required: true,
          scale_labels: [
            "Completely misaligned",
            "Significant gaps",
            "Moderate gaps",
            "Mostly aligned",
            "Seamless"
          ]
        },
        {
          id: "advanced_programs",
          label:
            "Does this school offer Advanced Placement (AP), IB, or dual enrollment options?",
          type: "single_select",
          required: true,
          options: ["Yes", "No", "Unknown"]
        },
        {
          id: "academic_open_text",
          label:
            "What do you wish you had known about this school’s academics before enrolling?",
          type: "long_text",
          required: false
        }
      ]
    },
    {
      id: "enrollment_transition",
      title: "Enrollment & transition",
      fields: [
        {
          id: "enrollment_timeline",
          label:
            "How long did it take from your initial contact to your child’s first day of class?",
          type: "single_select",
          required: true,
          options: [
            "Same day",
            "1–3 days",
            "1 week",
            "2–3 weeks",
            "More than 3 weeks"
          ]
        },
        {
          id: "midyear_accommodation",
          label:
            "Did the school accommodate mid‑year enrollment without penalizing your child for missed assignments or assessments?",
          type: "single_select",
          required: true,
          options: ["Yes", "No", "Partially"]
        },
        {
          id: "aware_interstate_compact",
          label:
            "Were you aware of the Interstate Compact on Educational Opportunity for Military Children before this PCS?",
          type: "single_select",
          required: true,
          options: ["Yes", "No"]
        },
        {
          id: "school_interstate_compact_familiarity",
          label:
            "Did the school demonstrate familiarity with the Interstate Compact on Educational Opportunity for Military Children?",
          type: "single_select",
          required: true,
          options: ["Yes", "No", "Unsure"]
        },
        {
          id: "admin_paperwork_rating",
          label:
            "How would you rate the front office/administrative staff in handling military family enrollment paperwork?",
          type: "likert_5",
          required: true,
          scale_labels: ["Very poor", "Poor", "Adequate", "Good", "Excellent"]
        }
      ]
    },
    {
      id: "special_needs_support",
      title: "Special needs & support",
      fields: [
        {
          id: "has_slo_or_poc",
          label:
            "Does this school have a dedicated School Liaison Officer (SLO) contact or military family point of contact?",
          type: "single_select",
          required: true,
          options: ["Yes", "No", "Unknown"]
        },
        {
          id: "iep_504_status",
          label:
            "If your child has an IEP or 504 plan, was it honored promptly upon enrollment?",
          type: "single_select",
          required: true,
          options: ["Yes", "No", "Partially", "Not applicable"]
        },
        {
          id: "purple_star_status",
          label:
            "Does this school hold a Purple Star designation (or similar state recognition) for supporting military‑connected students?",
          type: "single_select",
          required: true,
          options: ["Yes", "No", "Unknown"]
        },
        {
          id: "counseling_access",
          label:
            "How accessible and responsive is the school’s counseling or social‑emotional support staff for children experiencing transition stress?",
          type: "likert_5",
          required: true,
          scale_labels: [
            "Very inaccessible",
            "Somewhat inaccessible",
            "Neutral",
            "Accessible",
            "Very accessible"
          ]
        }
      ]
    },
    {
      id: "community_belonging",
      title: "Community & belonging",
      fields: [
        {
          id: "social_adjustment_speed",
          label:
            "How quickly did your child feel socially adjusted at this school?",
          type: "single_select",
          required: true,
          options: [
            "Within the first week",
            "Within 2–4 weeks",
            "1–3 months",
            "More than 3 months",
            "Has not yet adjusted"
          ]
        },
        {
          id: "military_clubs_programs",
          label:
            "Does the school have clubs, programs, or affinity groups that acknowledge or celebrate military family experiences?",
          type: "single_select",
          required: true,
          options: ["Yes", "No", "Unknown"]
        },
        {
          id: "extracurricular_variety",
          label:
            "How would you rate the school’s extracurricular variety for a child who may have developed interests at a previous school?",
          type: "likert_5",
          required: true,
          scale_labels: [
            "Very limited",
            "Limited",
            "Adequate",
            "Good variety",
            "Excellent variety"
          ]
        },
        {
          id: "welcoming_midsemester",
          label:
            "This school is welcoming to military children who arrive mid‑semester.",
          type: "likert_5_agreement",
          required: true,
          scale_labels: [
            "Strongly disagree",
            "Disagree",
            "Neutral",
            "Agree",
            "Strongly agree"
          ]
        }
      ]
    },
    {
      id: "communication_engagement",
      title: "Communication & engagement",
      fields: [
        {
          id: "teacher_responsiveness",
          label:
            "How would you rate teacher responsiveness to your questions or concerns?",
          type: "likert_5",
          required: true,
          scale_labels: [
            "Very unresponsive",
            "Somewhat unresponsive",
            "Adequate",
            "Responsive",
            "Very responsive"
          ]
        },
        {
          id: "uses_digital_platform",
          label:
            "Does the school use a digital platform (for example, ParentVue, ClassDojo, Schoology) that made it easy to monitor your child’s progress remotely during the move?",
          type: "single_select",
          required: true,
          options: ["Yes", "No"]
        },
        {
          id: "digital_platform_name",
          label: "If yes, which platform?",
          type: "short_text",
          required: false,
          conditional: {
            field: "uses_digital_platform",
            value: "Yes"
          }
        },
        {
          id: "parent_informed_involved",
          label:
            "How informed and involved did you feel as a parent during the transition period?",
          type: "likert_5",
          required: true,
          scale_labels: [
            "Not at all informed",
            "Slightly informed",
            "Moderately informed",
            "Very informed",
            "Extremely informed"
          ]
        }
      ]
    },
    {
      id: "overall_fit",
      title: "Overall military‑family fit",
      fields: [
        {
          id: "overall_military_friendly",
          label:
            "On a scale of 1–5, how military‑family‑friendly is this school overall?",
          type: "likert_5",
          required: true,
          scale_labels: [
            "1 Not at all friendly",
            "2 Slightly friendly",
            "3 Moderately friendly",
            "4 Very friendly",
            "5 Extremely friendly"
          ]
        },
        {
          id: "recommend_binary",
          label:
            "Would you recommend this school to another military family PCSing to this area?",
          type: "single_select",
          required: true,
          options: ["Yes", "No", "With reservations"]
        },
        {
          id: "recommend_0_10",
          label:
            "On a scale of 0–10, how likely are you to recommend this school to another military family?",
          type: "numeric_scale",
          required: true,
          min: 0,
          max: 10
        },
        {
          id: "one_thing_message",
          label:
            "What is the one thing you would tell another military family about this school before they enroll?",
          type: "long_text",
          required: false
        }
      ]
    },
    {
      id: "reviewer_verification",
      title: "Reviewer verification & consent",
      fields: [
        {
          id: "honest_experience_confirm",
          label:
            "I am sharing my honest experience as a parent/guardian or military‑connected caregiver of a child who attended this school.",
          type: "checkbox",
          required: true
        },
        {
          id: "consent_deidentified_use",
          label:
            "I consent to have my de‑identified responses included in aggregate ratings and anonymous quotes.",
          type: "checkbox",
          required: true
        },
        {
          id: "contact_email",
          label:
            "Optional email address (only used if we need to clarify your response; never displayed publicly).",
          type: "email",
          required: false
        }
      ]
    }
  ]
};