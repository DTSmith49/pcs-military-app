// app/schools/[ncessch]/page.tsx
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

const supabaseUrl = "https://pnomrrkizuymcbopylxk.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function ratingColor(score: number | null) {
  if (score === null) return { bg: "bg-slate-100", text: "text-slate-400", ring: "ring-slate-200" };
  if (score >= 70) return { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" };
  if (score >= 55) return { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200" };
  return { bg: "bg-red-100", text: "text-red-600", ring: "ring-red-200" };
}

function gradeRange(low: string | null, high: string | null) {
  if (!low && !high) return null;
  const fmt = (g: string) => g === "PK" ? "Pre-K" : g === "KG" ? "K" : `${g}`;
  if (low === high) return `Grade ${fmt(low!)}`;
  return `Grades ${fmt(low!)}–${fmt(high!)}`;
}

function schoolLevelLabel(level: string | null) {
  const map: Record<string, string> = { "1": "Elementary", "2": "Middle", "3": "High School", "4": "Other" };
  return level ? (map[level] ?? "School") : "School";
}

interface PageProps {
  params: Promise<{ ncessch: string }>;
}

export default async function SchoolProfilePage({ params }: PageProps) {
  const { ncessch } = await params;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("ncessch", ncessch)
    .single();

  if (!school) notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, overall_fit, academic_experience, community_belonging, communication_engagement, special_needs_support, interstate_compact, purple_star, extra_notes, created_at")
    .eq("school_id", ncessch)
    .order("created_at", { ascending: false });

  const safeReviews = reviews ?? [];

  const overall = ratingColor(school.rating_overall);
  const grades = gradeRange(school.grade_low, school.grade_high);
  const level = schoolLevelLabel(school.school_level);

  const ratingDimensions = [
    { key: "rating_academic", label: "Academic Quality" },
    { key: "rating_military_friendly", label: "Military Friendly" },
    { key: "rating_student_teacher", label: "Student-Teacher Ratio" },
    { key: "rating_grade_span", label: "Grade Span" },
    { key: "rating_size", label: "School Size" },
    { key: "rating_diversity", label: "Diversity" },
  ] as const;

  return (
    <div className="bg-[#F8F7F4] min-h-screen">

      {/* Header */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <Link href="/schools" className="text-blue-300 text-sm hover:text-white transition-colors">
            ← Back to schools
          </Link>
          <div className="mt-4 flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{level}</span>
                {school.is_dodea && (
                  <span className="text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">DoDEA</span>
                )}
                {grades && (
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{grades}</span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{school.school_name}</h1>
              <p className="text-blue-200 text-sm mt-1">
                {school.street_address && `${school.street_address}, `}
                {school.city}, {school.state_abbr} {school.zip}
              </p>
            </div>

            {/* Overall score */}
            {school.rating_overall !== null && (
              <div className={`w-20 h-20 rounded-2xl ring-4 ${overall.ring} ${overall.bg} flex 
            flex-col items-center justify-center flex-shrink-0`}>
              <span className={`text-2xl font-black ${overall.text}`}>
            {Math.round(school.rating_overall)}</span>
              <span className={`text-xs ${overall.text}`}>/ 100</span>
            </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10 flex flex-col gap-8">

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Enrollment", value: school.enrollment ? school.enrollment.toLocaleString() : "—" },
            { label: "Pupil-Teacher Ratio", value: school.pupil_teacher_ratio ? `${school.pupil_teacher_ratio}:1` : "—" },
            { label: "Free/Reduced Lunch", value: school.frl_ratio ? `${Math.round(school.frl_ratio * 100)}%` : "—" },
            { label: "Reviews", value: safeReviews.length },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
              <div className="text-2xl font-black text-[#1B2A4A]">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Rating breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Rating Breakdown</h2>
          {ratingDimensions.every((d) => school[d.key] === null) ? (
            <p className="text-slate-400 text-sm">No ratings calculated yet — be the first to review this school.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {ratingDimensions.map((dim) => {
                const score = school[dim.key] as number | null;
                const color = ratingColor(score);
                return (
                  <div key={dim.key} className="flex items-center gap-3">
                    <div className="w-36 text-xs text-slate-600 flex-shrink-0">{dim.label}</div>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${score !== null ? (score >= 70 ? "bg-emerald-400" : score >= 55 ? "bg-amber-400" : "bg-red-400") : ""}`}
                        style={{ width: score !== null ? `${score}%` : "0%" }}
                      />
                    </div>
                    <div className={`text-xs font-bold w-8 text-right ${color.text}`}>
                      {score !== null ? Math.round(score) : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Academic proficiency */}
        {(school.academic_proficiency_math !== null || school.academic_proficiency_reading !== null) && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Academic Proficiency</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Math", value: school.academic_proficiency_math },
                { label: "Reading", value: school.academic_proficiency_reading },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className="text-2xl font-black text-[#1B2A4A]">
                    {item.value !== null ? `${Math.round(item.value * 100)}%` : "—"}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{item.label} Proficiency</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1B2A4A]">
              Military Family Reviews
              {safeReviews.length > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-400">({safeReviews.length})</span>
              )}
            </h2>
            <Link
              href={`/review?
            ncessch=${school.ncessch}&name=${encodeURIComponent(school.school_name)}&city=${encodeURIComponent(school.city ?? "")}&state=${school.state_abbr}`}
              className="bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold px-4 py-2 
            rounded-lg text-sm transition-colors"
            >
              Write a Review
            </Link>
          </div>

          {safeReviews.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No reviews yet — be the first military family to share your experience.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {safeReviews.map((r) => (
                <div key={r.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {r.overall_fit && (
                      <span className="text-sm font-bold text-[#1B2A4A]">
                        Overall Fit: {r.overall_fit}/5
                      </span>
                    )}
                    {r.interstate_compact && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        Interstate Compact: {r.interstate_compact.replace("_", " ")}
                      </span>
                    )}
                    {r.purple_star && r.purple_star !== "not_sure" && (
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                        Purple Star: {r.purple_star}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {r.extra_notes && (
                    <p className="text-sm text-slate-600 leading-relaxed">{r.extra_notes}</p>
                  )}
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {[
                      { label: "Academic", value: r.academic_experience },
                      { label: "Community", value: r.community_belonging },
                      { label: "Communication", value: r.communication_engagement },
                      { label: "Special Needs", value: r.special_needs_support },
                    ].filter((d) => d.value !== null).map((d) => (
                      <span key={d.label} className="text-xs text-slate-500">
                        {d.label}: <span className="font-semibold text-[#1B2A4A]">{d.value}/5</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
