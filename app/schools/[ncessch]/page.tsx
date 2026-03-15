// app/schools/[ncessch]/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

function ratingColor(score: number | null) {
  if (score === null) return { bg: "bg-slate-100", text: "text-slate-400", ring: "ring-slate-200" };
  if (score >= 70) return { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" };
  if (score >= 55) return { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200" };
  return { bg: "bg-red-100", text: "text-red-600", ring: "ring-red-200" };
}

function pillColor(score: number) {
  if (score >= 4) return "bg-emerald-100 text-emerald-700";
  if (score >= 3) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-600";
}

function gradeRange(low: string | null, high: string | null) {
  if (!low && !high) return null;
  const fmt = (g: string) => g === "PK" ? "Pre-K" : g === "KG" ? "K" : g;
  if (low === high) return `Grade ${fmt(low!)}`;
  return `Grades ${fmt(low!)}–${fmt(high!)}`;
}

function schoolLevelLabel(level: string | null) {
  const map: Record<string, string> = { "1": "Elementary", "2": "Middle", "3": "High School", "4": "Other" };
  return level ? (map[level] ?? "School") : "School";
}

function formatCompact(val: string | null) {
  if (!val) return null;
  const map: Record<string, string> = { yes: "Yes ✓", no: "No ✗", not_sure: "Not sure" };
  return map[val] ?? val;
}

function formatIep(val: string | null) {
  if (!val) return null;
  const map: Record<string, string> = {
    honored_promptly: "Honored promptly ✓",
    delayed: "Delayed",
    not_honored: "Not honored ✗",
    not_applicable: "N/A",
  };
  return map[val] ?? val;
}

interface PageProps {
  params: Promise<{ ncessch: string }>;
  searchParams: Promise<{ page?: string }>;
}

const PER_PAGE = 10;

export default async function SchoolProfilePage({ params, searchParams }: PageProps) {
  const { ncessch } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  const supabase = await createClient();

  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("ncessch", ncessch)
    .single();

  if (!school) notFound();

  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  const { data: reviews, count: reviewCount } = await supabase
    .from("reviews")
    .select(
      "id, overall_fit, academic_experience, community_belonging, communication_engagement, special_needs_support, interstate_compact, purple_star, iep_504_status, extra_notes, created_at",
      { count: "exact" }
    )
    .eq("school_id", ncessch)
    .order("created_at", { ascending: false })
    .range(from, to);

  const safeReviews = reviews ?? [];
  const totalReviews = reviewCount ?? 0;
  const totalPages = Math.ceil(totalReviews / PER_PAGE);

  const overall = ratingColor(school.rating_overall);
  const grades = gradeRange(school.grade_low, school.grade_high);
  const level = schoolLevelLabel(school.school_level);

  const ratingDimensions = [
    { key: "rating_academic", label: "Academic Quality", accent: "bg-blue-400" },
    { key: "rating_military_friendly", label: "Military Friendly", accent: "bg-purple-400" },
    { key: "rating_student_teacher", label: "Student-Teacher Ratio", accent: "bg-teal-400" },
    { key: "rating_grade_span", label: "Grade Span", accent: "bg-indigo-400" },
    { key: "rating_size", label: "School Size", accent: "bg-pink-400" },
    { key: "rating_diversity", label: "Diversity", accent: "bg-orange-400" },
  ] as const;

  const reviewDimensions = [
    { key: "academic_experience", label: "Academic" },
    { key: "community_belonging", label: "Community" },
    { key: "communication_engagement", label: "Communication" },
    { key: "special_needs_support", label: "Special Needs" },
    { key: "overall_fit", label: "Military Fit" },
  ] as const;

  const writeReviewHref = `/review?ncessch=${school.ncessch}&name=${encodeURIComponent(school.school_name)}&city=${encodeURIComponent(school.city ?? "")}&state=${school.state_abbr}`;

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
                  <span className="text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">🎖️ DoDEA</span>
                )}
                {school.purple_star_school && (
                  <span className="text-xs bg-purple-400/20 text-purple-200 px-2 py-0.5 rounded-full font-medium">⭐ Purple Star</span>
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

            {school.rating_overall !== null && (
              <div className={`w-20 h-20 rounded-2xl ring-4 ${overall.ring} ${overall.bg} flex flex-col items-center justify-center flex-shrink-0`}>
                <span className={`text-2xl font-black ${overall.text}`}>{Math.round(school.rating_overall)}</span>
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
            { label: "Reviews", value: totalReviews },
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
          {ratingDimensions.every((d) => school[d.key] === null || school[d.key] === undefined) ? (
            <p className="text-slate-400 text-sm">No ratings calculated yet — be the first to review this school.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {ratingDimensions.map((dim) => {
                const score = school[dim.key] as number | null | undefined;
                const color = ratingColor(score ?? null);
                return (
                  <div key={dim.key} className="flex items-center gap-3">
                    <div className="w-40 text-xs text-slate-600 flex-shrink-0">{dim.label}</div>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${dim.accent}`}
                        style={{ width: score != null ? `${Math.max(2, score)}%` : "0%" }}
                      />
                    </div>
                    <div className={`text-xs font-bold w-8 text-right ${color.text}`}>
                      {score != null ? Math.round(score) : "—"}
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
                    {item.value !== null && item.value !== undefined ? `${Math.round(item.value * 100)}%` : "—"}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{item.label} Proficiency</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-lg font-bold text-[#1B2A4A]">
              Military Family Reviews
              {totalReviews > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-400">({totalReviews})</span>
              )}
            </h2>
            <Link
              href={writeReviewHref}
              className="bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              ✏️ Write a Review
            </Link>
          </div>

          {safeReviews.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="text-4xl">🏫</span>
              <p className="text-slate-500 text-sm max-w-sm">
                No reviews yet — be the first military family to share your experience at this school.
              </p>
              <Link
                href={writeReviewHref}
                className="mt-1 bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                Write the First Review
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col divide-y divide-slate-100">
                {safeReviews.map((r) => (
                  <div key={r.id} className="py-5 first:pt-0 last:pb-0 flex flex-col gap-3">

                    {/* Top row: overall fit + date */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {r.overall_fit != null && (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${pillColor(Number(r.overall_fit))}`}>
                            ⭐ Military Fit: {r.overall_fit}/5
                          </span>
                        )}
                        {r.purple_star && r.purple_star !== "not_sure" && (
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.purple_star === "yes" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500"}`}>
                            Purple Star: {r.purple_star === "yes" ? "Yes ✓" : "No"}
                          </span>
                        )}
                        {r.interstate_compact && r.interstate_compact !== "not_sure" && (
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.interstate_compact === "yes" ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
                            Interstate Compact: {formatCompact(r.interstate_compact)}
                          </span>
                        )}
                        {r.iep_504_status && r.iep_504_status !== "not_applicable" && (
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.iep_504_status === "honored_promptly" ? "bg-emerald-100 text-emerald-700" : r.iep_504_status === "delayed" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                            IEP/504: {formatIep(r.iep_504_status)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                      </span>
                    </div>

                    {/* Dimension score pills */}
                    <div className="flex gap-2 flex-wrap">
                      {reviewDimensions.map((d) => {
                        const val = r[d.key];
                        if (val == null) return null;
                        return (
                          <span key={d.key} className={`text-xs px-2.5 py-1 rounded-full font-medium ${pillColor(Number(val))}`}>
                            {d.label}: {val}/5
                          </span>
                        );
                      })}
                    </div>

                    {/* Free-text notes */}
                    {r.extra_notes && (
                      <p className="text-sm text-slate-600 leading-relaxed">{r.extra_notes}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-3 border-t border-slate-100 pt-5">
                  {page > 1 && (
                    <Link
                      href={`/schools/${ncessch}?page=${page - 1}`}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:border-[#E8A020] transition-colors"
                    >
                      ← Prev
                    </Link>
                  )}
                  <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                  {page < totalPages && (
                    <Link
                      href={`/schools/${ncessch}?page=${page + 1}`}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:border-[#E8A020] transition-colors"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="bg-[#1B2A4A] rounded-2xl p-8 text-white text-center flex flex-col items-center gap-4">
          <h2 className="text-lg font-bold">Have you attended this school?</h2>
          <p className="text-blue-200 text-sm max-w-md">
            Your review takes about 5 minutes and could save another military family weeks of uncertainty during their PCS move.
          </p>
          <Link
            href={writeReviewHref}
            className="bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold px-8 py-3 rounded-lg text-sm transition-colors"
          >
            Write a Review
          </Link>
        </div>

      </div>
    </div>
  );
}
