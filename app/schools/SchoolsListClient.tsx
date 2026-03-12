"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface School {
  id: string;
  name: string;
  city: string | null;
  state: string;
}

interface Props {
  initialSchools: School[];
}

export default function SchoolsListClient({ initialSchools }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialSchools;

    return initialSchools.filter((school) => {
      const name = school.name?.toLowerCase() ?? "";
      const city = school.city?.toLowerCase() ?? "";
      const state = school.state?.toLowerCase() ?? "";
      return name.includes(q) || city.includes(q) || state.includes(q);
    });
  }, [initialSchools, query]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      {/* Search box */}
      <div className="mb-6">
        <label
          htmlFor="school-search"
          className="block text-sm font-medium text-slate-700"
        >
          Search by school name, city, or state
        </label>
        <input
          id="school-search"
          type="text"
          placeholder="e.g. Clarksville Middle, El Paso, TX"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
        />
        {query && (
          <p className="mt-1 text-xs text-slate-500">
            Showing {filtered.length} of {initialSchools.length} schools
          </p>
        )}
      </div>

      {/* School list */}
      {(!filtered || filtered.length === 0) ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center flex flex-col gap-4">
          <div className="text-5xl">🏫</div>
          <h2 className="text-xl font-bold text-[#1B2A4A]">No matching schools</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Try a different spelling or search by city or state. If your school
            truly isn&apos;t here yet, you can be the first to review it.
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
          {filtered.map((school) => (
            <Link
              key={school.id}
              href={`/schools/${school.id}`}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center justify-between gap-4 hover:border-[#E8A020] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#1B2A4A] text-white flex items-center justify-center text-lg flex-shrink-0">
                  🏫
                </div>
                <div>
                  <div className="font-semibold text-[#1B2A4A] text-sm">
                    {school.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {school.city ? `${school.city}, ` : ""}
                    {school.state}
                  </div>
                </div>
              </div>
              <span className="flex-shrink-0 bg-[#1B2A4A] hover:bg-[#243860] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                View Reviews
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}