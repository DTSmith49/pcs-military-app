// app/schools/page.tsx
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

      {/* School list */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        {(!schools || schools.length === 0) ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center flex flex-col gap-4">
            <div className="text-5xl">🏫</div>
            <h2 className="text-xl font-bold text-[#1B2A4A]">No schools yet</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Be the first military family to add a school review. It only takes a few minutes
              and helps every family who PCSs here after you.
            </p>
            <Link
              href="/review"
              className="self-center bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              Write the First Review
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schools.map((school) => (
              <div
                key={school.id}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center justify-between gap-4 hover:border-[#E8A020] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1B2A4A] text-white flex items-center justify-center text-lg flex-shrink-0">
                    🏫
                  </div>
                  <div>
                    <div className="font-semibold text-[#1B2A4A] text-sm">{school.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {school.city ? `${school.city}, ` : ""}{school.state}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/schools/${school.id}`}
                  className="flex-shrink-0 bg-[#1B2A4A] hover:bg-[#243860] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  View Reviews
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

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
