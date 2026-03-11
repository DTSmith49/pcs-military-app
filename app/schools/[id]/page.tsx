// app/schools/[id]/page.tsx
import { ratingDimensions } from "@/content/ratingDimensions";

// Explicit School interface — matches DB schema and ratingDimensions keys.
export interface School {
  id: string;
  name: string;
  avg_academic_experience_score: number | null;
  avg_enrollment_transition_score: number | null;
  avg_special_needs_support_score: number | null;
  avg_community_belonging_score: number | null;
  avg_communication_engagement_score: number | null;
  avg_overall_military_friendly_score: number | null;
}

// Placeholder fetch — replace with a real Supabase query (DB-01 / API-02).
async function getSchoolById(id: string): Promise<School> {
  // TODO: fetch from Supabase once DB-01 tables are created.
  return {
    id,
    name: "Example School",
    avg_academic_experience_score: 4.2,
    avg_enrollment_transition_score: 3.9,
    avg_special_needs_support_score: 4.0,
    avg_community_belonging_score: 4.1,
    avg_communication_engagement_score: 3.8,
    avg_overall_military_friendly_score: 4.0,
  };
}

function SchoolRatings({ school }: { school: School }) {
  return (
    <section className="space-y-3 mt-8">
      <h2 className="text-xl font-semibold">Military-family ratings</h2>
      <p className="text-sm text-slate-700">
        Scores are based on reviews from military families, across several
        dimensions that matter during a PCS.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {ratingDimensions.map((dim) => {
          const value = school[dim.key as keyof School];
          if (value == null || typeof value !== "number") return null;
          return (
            <div key={dim.key} className="rounded border p-3">
              <div className="flex items-baseline justify-between">
                <span className="font-medium">{dim.label}</span>
                <span className="text-lg font-semibold">
                  {value.toFixed(1)}/5
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">{dim.description}</p>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        No single review tells the full story, but together they surface trends
        you won't see in test scores alone.
      </p>
    </section>
  );
}

export default async function SchoolPage({
  params,
}: {
  params: { id: string };
}) {
  const school = await getSchoolById(params.id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-semibold">{school.name}</h1>
      <SchoolRatings school={school} />
    </main>
  );
}
