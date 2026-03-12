import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type IncomingBody = {
  schoolName: string;
  schoolCity?: string;
  schoolState: string;
  interstateCompact?: "yes" | "no" | "not_sure";
  purpleStar?: "yes" | "no" | "not_sure";
  iep504Status?: "honored_promptly" | "delayed" | "not_honored" | "not_applicable";
  academicExperience?: "1" | "2" | "3" | "4" | "5";
  communityBelonging?: "1" | "2" | "3" | "4" | "5";
  communicationEngagement?: "1" | "2" | "3" | "4" | "5";
  specialNeedsSupport?: "1" | "2" | "3" | "4" | "5";
  overallFit?: "1" | "2" | "3" | "4" | "5";
  extraNotes?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IncomingBody;

    if (!body.schoolName || !body.schoolState) {
      return NextResponse.json(
        { error: "Missing school name or state" },
        { status: 400 }
      );
    }

    // 1) Find or create school
    const nameTrimmed = body.schoolName.trim();
    const stateTrimmed = body.schoolState.trim().toUpperCase();

    const { data: existing, error: findError } = await supabase
      .from("schools")
      .select("id")
      .eq("name", nameTrimmed)
      .eq("state", stateTrimmed)
      .limit(1)
      .maybeSingle();

    if (findError) {
      console.error("Error looking up school", findError);
      return NextResponse.json(
        { error: "Failed to look up school" },
        { status: 500 }
      );
    }

    let schoolId = existing?.id as string | undefined;

    if (!schoolId) {
      const { data: created, error: createError } = await supabase
        .from("schools")
        .insert({
          name: nameTrimmed,
          city: body.schoolCity?.trim() || null,
          state: stateTrimmed,
        })
        .select("id")
        .single();

      if (createError || !created) {
        console.error("Error creating school", createError);
        return NextResponse.json(
          { error: "Failed to create school" },
          { status: 500 }
        );
      }

      schoolId = created.id;
    }

    // 2) Insert review with school_id
    const { error: reviewError } = await supabase.from("reviews").insert({
      school_id: schoolId,
      interstate_compact: body.interstateCompact ?? null,
      purple_star: body.purpleStar ?? null,
      iep504_status: body.iep504Status ?? null,
      academic_experience: body.academicExperience
        ? Number(body.academicExperience)
        : null,
      community_belonging: body.communityBelonging
        ? Number(body.communityBelonging)
        : null,
      communication_engagement: body.communicationEngagement
        ? Number(body.communicationEngagement)
        : null,
      special_needs_support: body.specialNeedsSupport
        ? Number(body.specialNeedsSupport)
        : null,
      overall_fit: body.overallFit ? Number(body.overallFit) : null,
      extra_notes: body.extraNotes ?? null,
    });

    if (reviewError) {
      console.error("Supabase insert error", reviewError);
      return NextResponse.json(
        { error: "Failed to save review" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/reviews error", e);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
