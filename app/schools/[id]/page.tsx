// app/schools/[id]/page.tsx
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type PageProps = {
  params: { id: string };
};

export default async function SchoolProfilePage({ params }: PageProps) {
  const schoolId = params.id;

  // 1) Fetch school
  const { data: school, error: schoolError } = await supabase
    .from("schools")
    .select("id, name, city, state")
    .eq("id", schoolId)
    .maybeSingle();

  if (schoolError || !school) {
    return notFound();
  }

  // 2) Fetch reviews for this school
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      "id, created_at, academic_experience, community_belonging, communication_engagement, special_needs_support, overall_fit, extra_notes"
    )
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#F8F7F4] px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-xs text-slate-500 mb-1">
            <a href="/schools" className="underline hover:text-slate-700">
              ← Back to school directory
            </a>
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1B2A4A]">
            {school.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {school.city}, {school.state}
          </p>
        </header>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-[#1B2A4A]">
              Reviews from military families
            </h2>
            <a
              href="/review"
              className="hidden sm:inline-flex bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold px-4 py-2 rounded-lg text-xs transition-colors"
            >
              Write a Review
            </a>
          </div>

          {!reviews || reviews.length === 0 ? (
            <p className="text-sm text-slate-500">
              No reviews yet for this school. Be the first to share your
              experience.
            </p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li
                  key={r.id}
                  className="border border-slate-200 rounded-xl p-4 bg-[#FAF9F6]"
                >
                  <p className="text-xs text-slate-400 mb-2">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-600 mb-2">
                    Academic: {r.academic_experience ?? "–"} · Community:{" "}
                    {r.community_belonging ?? "–"} · Communication:{" "}
                    {r.communication_engagement ?? "–"} · Special needs:{" "}
                    {r.special_needs_support ?? "–"} · Overall:{" "}
                    {r.overall_fit ?? "–"}
                  </p>
                  {r.extra_notes && (
                    <p className="text-sm text-slate-700 whitespace-pre-line">
                      {r.extra_notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 sm:hidden">
            <a
              href="/review"
              className="inline-flex bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold px-4 py-2 rounded-lg text-xs transition-colors"
            >
              Write a Review
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}