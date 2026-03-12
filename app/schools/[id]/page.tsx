// app/schools/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { ratingDimensions } from "@/content/ratingDimensions";

// ── Types ─────────────────────────────────────────────────────────────────────

interface School {
  id: string;
  name: string;
  city: string | null;
  state: string;
  created_at: string;
}

interface Review {
  id: string;
  academic_experience: number | null;
  enrollment_transition: number | null;
  special_needs_support: number | null;
  community_belonging: number | null;
  communication_engagement: number | null;
  overall_fit: number | null;
  interstate_compact: string | null;
  purple_star: string | null;
  iep504_status: string | null;
  extra_notes: string | null;
  created_at: string;
}

const SCORE_MAP: Record<string, keyof Review> = {
  avg_academic_experience_score:       "academic_experience",
  avg_enrollment_transition_score:     "enrollment_transition",
  avg_special_needs_support_score:     "special_needs_support",
  avg_community_belonging_score:       "community_belonging",
  avg_communication_engagement_score:  "communication_engagement",
  avg_overall_military_friendly_score: "overall_fit",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function avg(reviews: Review[], field: keyof Review): number | null {
  const values = reviews
    .map((r) => r[field])
    .filter((v): v is number => typeof v === "number");
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function labelFor(field: string | null, map: Record<string, string>) {
  if (!field) return null;
  return map[field] ?? field;
}

const COMPACT_LABELS: Record<string, string> = {
  yes:      "Interstate Compact honored",
  no:       "Interstate Compact NOT honored",
  not_sure: "Interstate Compact — not sure",
};
const PURPLE_LABELS: Record<string, string> = {
  yes:      "Purple Star school",
  no:       "Not a Purple Star school",
  not_sure: "Purple Star — not sure",
};
const IEP_LABELS: Record<string, string> = {
  honored_promptly: "IEP/504 honored promptly",
  delayed:          "IEP/504 implementation delayed",
  not_honored:      "IEP/504 not honored",
  not_applicable:   "No IEP/504 (not applicable)",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreBars({ reviews }: { reviews: Review[] }) {
  return (
    <section className="space-y-3 mt-8">
      <h2 className="text-xl font-semibold text-[#1B2A4A]">Average ratings</h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-slate-500">
          No ratings yet — be the first to review this school.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {ratingDimensions.map((dim) => {
            const reviewField = SCORE_MAP[dim.key];
            const value = reviewField ? avg(reviews, reviewField) : null;
            return (
              <div
                key={dim.key}
                className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-[#1B2A4A] text-sm">
                    {dim.label}
                  </span>
                  <span className="text-lg font-bold text-[#1B2A4A]">
                    {value !== null ? `${value.toFixed(1)}/5` : "—"}
                  </span>
                </div>
                {value !== null && (
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-[#E8A020]"
                      style={{ width: `${(value / 5) * 100}%` }}
                    />
                  </div>
                )}
                <p className="mt-2 text-xs text-slate-500">{dim.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const tags = [
    labelFor(review.interstate_compact, COMPACT_LABELS),
    labelFor(review.purple_star, PURPLE_LABELS),
    labelFor(review.iep504_status, IEP_LABELS),
  ].filter(Boolean) as string[];

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {formatDate(review.created_at)}
        </span>
        {review.overall_fit && (
          <span className="text-sm font-bold text-[#E8A020]">
            Overall: {review.overall_fit}/5
          </span>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {review.extra_notes && (
        <p className="text-sm text-slate-700 leading-relaxed">
          {review.extra_notes}
        </p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SchoolPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();

  const { data: school, error: schoolError } = await supabase
    .from("schools")
    .select("id, name, city, state, created_at")
    .eq("id", params.id)
    .single();

  if (schoolError || !school) {
    notFound();
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      "id, academic_experience, enrollment_transition, special_needs_support, community_belonging, communication_engagement, overall_fit, interstate_compact, purple_star, iep504_status, extra_notes, created_at"
    )
    .eq("school_id", params.id)
    .order("created_at", { ascending: false });

  const allReviews: Review[] = reviews ?? [];

  return (
    <div className="bg-[#F8F7F4] min-h-screen">

      {/* Header */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="mx-auto max-w-4xl px-4 py-10 flex flex-col gap-2">
          <Link
            href="/schools"
            className="text-blue-300 hover:text-white text-xs mb-2 inline-flex items-center gap-1 transition-colors"
          >
            ← All schools
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold capitalize">
            {school.name}
          </h1>
          <p className="text-blue-200 text-sm">
            {school.city ? `${school.city}, ` : ""}{school.state}
          </p>
          <p className="text-blue-300 text-xs mt-1">
            {allReviews.length === 0
              ? "No reviews yet"
              : `${allReviews.length} review${allReviews.length === 1 ? "" : "s"} from military families`}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10 space-y-10">

        {/* Score bars */}
        <ScoreBars reviews={allReviews} />

        {/* CTA */}
        <div className="bg-[#1B2A4A] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
          <div>
            <div className="font-bold">Have experience with this school?</div>
            <div className="text-blue-200 text-sm mt-1">
              Your review helps the next military family who PCSs here.
            </div>
          </div>
          <Link
            href="/review"
            className="flex-shrink-0 bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            Write a Review
          </Link>
        </div>

        {/* Individual reviews */}
        {allReviews.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1B2A4A]">
              Reviews ({allReviews.length})
            </h2>
            {allReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </section>
        )}

      </div>
    </div>
  );
}
