// app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { createBrowserClient } from "@supabase/ssr";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

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
      academic_experience: academicExperience
        ? Number(academicExperience)
        : null,
      community_belonging: communityBelonging
        ? Number(communityBelonging)
        : null,
      communication_engagement: communicationEngagement
        ? Number(communicationEngagement)
        : null,
      special_needs_support: specialNeedsSupport
        ? Number(specialNeedsSupport)
        : null,
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