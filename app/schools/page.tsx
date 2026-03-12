// app/schools/page.tsx
import SchoolsListClient from "./SchoolsListClient";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default async function SchoolsListPage() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: schools } = await supabase
    .from("schools")
    .select("id, name, city, state")
    .order("name", { ascending: true });

  return (
    <div className="bg-[#F8F7F4] min-h-screen">

      {/* Page header */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 flex flex-col gap-3">
          <h1 className="text-3xl md:text-4xl font-bold">Schools reviewed by military families</h1>
          <p className="text-blue-200 text-sm max-w-xl">
            Every school below has been reviewed by at least one military family during a PCS move.
            Don&apos;t see your school? Be the first to add it.
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
