// app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

const VALID_COMPACT_VALUES = ["yes", "no", "not_sure"];
const VALID_PURPLE_STAR_VALUES = ["yes", "no", "not_sure"];
const VALID_IEP_VALUES = ["honored_promptly", "delayed", "not_honored", "not_applicable"];
const RATING_FIELDS = [
  "academicExperience",
  "communityBelonging",
  "communicationEngagement",
  "specialNeedsSupport",
  "overallFit",
] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // --- Input Validation ---

    // 1. schoolId is required
    if (!body.schoolId || typeof body.schoolId !== "string") {
      return NextResponse.json(
        { error: "schoolId is required and must be a string" },
        { status: 400 }
      );
    }

    // 2. Rating fields must be 1–5 if present
    for (const field of RATING_FIELDS) {
      if (body[field] != null) {
        const num = Number(body[field]);
        if (isNaN(num) || num < 1 || num > 5) {
          return NextResponse.json(
            { error: `${field} must be a number between 1 and 5` },
            { status: 400 }
          );
        }
      }
    }

    // 3. Enum field validation
    if (body.interstateCompact && !VALID_COMPACT_VALUES.includes(body.interstateCompact)) {
      return NextResponse.json(
        { error: `interstateCompact must be one of: ${VALID_COMPACT_VALUES.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.purpleStar && !VALID_PURPLE_STAR_VALUES.includes(body.purpleStar)) {
      return NextResponse.json(
        { error: `purpleStar must be one of: ${VALID_PURPLE_STAR_VALUES.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.iep504Status && !VALID_IEP_VALUES.includes(body.iep504Status)) {
      return NextResponse.json(
        { error: `iep504Status must be one of: ${VALID_IEP_VALUES.join(", ")}` },
        { status: 400 }
      );
    }

    // 4. Text length cap
    if (body.extraNotes && body.extraNotes.length > 5000) {
      return NextResponse.json(
        { error: "extraNotes must be under 5000 characters" },
        { status: 400 }
      );
    }

    // --- Database Insert ---
    const supabase = createSupabaseServerClient();

    const {
      schoolId,
      interstateCompact,
      purpleStar,
      iep504Status,
      academicExperience,
      communityBelonging,
      communicationEngagement,
      specialNeedsSupport,
      overallFit,
      extraNotes,
    } = body;

    const { error } = await supabase.from("reviews").insert({
      school_id: schoolId,
      interstate_compact: interstateCompact ?? null,
      purple_star: purpleStar ?? null,
      iep504_status: iep504Status ?? null,
      academic_experience: academicExperience ? Number(academicExperience) : null,
      community_belonging: communityBelonging ? Number(communityBelonging) : null,
      communication_engagement: communicationEngagement
        ? Number(communicationEngagement)
        : null,
      special_needs_support: specialNeedsSupport ? Number(specialNeedsSupport) : null,
      overall_fit: overallFit ? Number(overallFit) : null,
      extra_notes: extraNotes ?? null,
    });

    if (error) {
      console.error("Supabase insert error", error);
      return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Unexpected error", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
