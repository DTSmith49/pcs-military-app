import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from("schools")
    .select("ncessch, school_name, city, state_abbr")
    .ilike("school_name", `%${q}%`)
    .order("school_name")
    .limit(10);

  if (error) {
    console.error("School search error", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
