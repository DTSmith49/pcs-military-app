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

    // ── Input Validation ────────────────────────────────────────────────────

    // schoolName and schoolState are required (replaces schoolId)
    if (!body.schoolName || typeof body.schoolName !== "string" || !body.schoolName.trim()) {
      return NextResponse.json(
        { error: "schoolName is required" },
        { status: 400 }
      );
    }
    if (!body.schoolState || typeof body.schoolState !== "string") {
      return NextResponse.json(
        { error: "schoolState is required" },
        { status: 400 }
      );
    }

    // Rating fields must be 1–5 if present
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

    // Enum field validation
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

    // Text length cap
    if (body.extraNotes && body.extraNotes.length > 5000) {
      return NextResponse.json(
        { error: "extraNotes must be under 5000 characters" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const schoolName = body.schoolName.trim();
    const schoolState = body.schoolState.trim().toUpperCase();
    const schoolCity = body.schoolCity?.trim() || null;

    // ── Option B: get-or-create the school record ────────────────────────────
    // upsert on the (lower(name), state) unique index.
    // onConflict targets the index columns; ignoreDuplicates:false means
    // we get the existing row back if it already exists.
    const { data: schoolData, error: schoolError } = await supabase
      .from("schools")
      .upsert(
        { name: schoolName, city: schoolCity, state: schoolState },
        {
          onConflict: "lower(name),state",
          ignoreDuplicates: false,
        }
      )
      .select("id")
      .single();

    if (schoolError || !schoolData) {
      console.error("School upsert error", schoolError);
      return NextResponse.json({ error: "Failed to resolve school" }, { status: 500 });
    }

    const schoolId = schoolData.id;

    // ── Insert the review ────────────────────────────────────────────────────
    const {
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

    const { error: reviewError } = await supabase.from("reviews").insert({
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

    if (reviewError) {
      console.error("Review insert error", reviewError);
      return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, schoolId });
  } catch (e) {
    console.error("Unexpected error", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
