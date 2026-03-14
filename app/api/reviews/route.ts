import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { validateCsrf } from "@/lib/auth/csrf";

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
  // Auth check
  const jar = await cookies();
  const token = jar.get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    const payload = await verifyAccessToken(token);
    userId = payload.sub as string;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // CSRF check
  if (!(await validateCsrf(req))) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as IncomingBody;

    if (!body.schoolName || !body.schoolState) {
      return NextResponse.json(
        { error: "Missing school name or state" },
        { status: 400 }
      );
    }

    const nameTrimmed = body.schoolName.trim();
    const stateTrimmed = body.schoolState.trim().toUpperCase();

    const supabase = await createClient();

    // Find existing school by school_name + state_abbr
    const { data: existing, error: findError } = await supabase
      .from("schools")
      .select("ncessch")
      .eq("school_name", nameTrimmed)
      .eq("state_abbr", stateTrimmed)
      .limit(1)
      .maybeSingle();

    if (findError) {
      console.error("Error looking up school", findError);
      return NextResponse.json({ error: "Failed to look up school" }, { status: 500 });
    }

    let schoolNcessch = existing?.ncessch as string | undefined;

    if (!schoolNcessch) {
      // Create new school record
      const { data: created, error: createError } = await supabase
        .from("schools")
        .insert({
          ncessch: `USER-${crypto.randomUUID()}`,
          school_name: nameTrimmed,
          city: body.schoolCity?.trim() || null,
          state_abbr: stateTrimmed,
        })
        .select("ncessch")
        .single();

      if (createError || !created) {
        console.error("Error creating school", createError);
        return NextResponse.json({ error: "Failed to create school" }, { status: 500 });
      }

      schoolNcessch = created.ncessch;
    }

    // Insert review
const { error: reviewError } = await supabase.from("reviews").insert({
  school_id: schoolNcessch,
  user_id: userId,
  interstate_compact: body.interstateCompact ?? null,
  purple_star: body.purpleStar ?? null,
  iep504_status: body.iep504Status ?? null,
  academic_experience: body.academicExperience ? 
Number(body.academicExperience) : null,
  community_belonging: body.communityBelonging ? 
Number(body.communityBelonging) : null,
  communication_engagement: body.communicationEngagement ? 
Number(body.communicationEngagement) : null,
  special_needs_support: body.specialNeedsSupport ? 
Number(body.specialNeedsSupport) : null,
  overall_fit: body.overallFit ? 
Number(body.overallFit) : null,
  extra_notes: body.extraNotes ?? null,
});
    if (reviewError) {
      console.error("Supabase insert error", reviewError);
      return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/reviews error", e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
