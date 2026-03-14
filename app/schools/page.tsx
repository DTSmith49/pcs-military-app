// app/schools/page.tsx
import SchoolsListClient from "./SchoolsListClient";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pnomrrkizuymcbopylxk.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default async function SchoolsListPage() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: schools } = await supabase
    .from("schools")
    .select("ncessch, school_name, city, state_abbr, rating_overall, is_dodea, enrollment")
    .order("school_name", { ascending: true });

  return (
    <div className="bg-[#F8F7F4] min-h-screen">

      {/* Page header */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 flex flex-col gap-3">
          <h1 className="text-3xl md:text-4xl font-bold">Find schools near your next duty station</h1>
          <p className="text-blue-200 text-sm max-w-xl">
            Ratings calculated from federal NCES data. Reviews from military families who've been there.
          </p>
          <Link
            href="/review"
            className="mt-2 self-start bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            + Add a School Review
          </Link>
        </div>
      </section>

      {/* School list + search */}
      <SchoolsListClient initialSchools={schools ?? []} />

      {/* Bottom CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="bg-[#1B2A4A] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
          <div>
            <div className="font-bold text-lg">Don&apos;t see your school?</div>
            <div className="text-blue-200 text-sm mt-1">
              Add it when you write your first review. It only takes a school name and state.
            </div>
          </div>
          <Link
            href="/review"
            className="flex-shrink-0 bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            Write a Review
          </Link>
        </div>
      </section>

    </div>
  );
}
