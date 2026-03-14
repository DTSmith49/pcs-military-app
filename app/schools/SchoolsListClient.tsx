"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface School {
  ncessch: string;
  school_name: string;
  city: string | null;
  state_abbr: string;
  rating_overall: number | null;
  is_dodea: boolean | null;
  enrollment: number | null;
}

interface Props {
  initialSchools: School[];
}

const PAGE_SIZE = 20;

function ratingBadge(score: number | null) {
  if (score === null) return null;
  if (score >= 70) return { label: Math.round(score), bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" };
  if (score >= 55) return { label: Math.round(score), bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-200" };
  return { label: Math.round(score), bg: "bg-red-100", text: "text-red-600", ring: "ring-red-200" };
}

export default function SchoolsListClient({ initialSchools }: Props) {
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [dodeaOnly, setDodeaOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "rating" | "enrollment">("name");
  const [page, setPage] = useState(1);

  const states = useMemo(() => {
    return Array.from(new Set(initialSchools.map((s) => s.state_abbr))).sort();
  }, [initialSchools]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let results = initialSchools.filter((school) => {
      const name = school.school_name?.toLowerCase() ?? "";
      const city = school.city?.toLowerCase() ?? "";
      const state = school.state_abbr?.toLowerCase() ?? "";
      const matchesQuery = !q || name.includes(q) || city.includes(q) || state.includes(q);
      const matchesState = !stateFilter || school.state_abbr === stateFilter;
      const matchesDodea = !dodeaOnly || school.is_dodea === true;
      return matchesQuery && matchesState && matchesDodea;
    });

    return [...results].sort((a, b) => {
      if (sortBy === "rating") return (b.rating_overall ?? -1) - (a.rating_overall ?? -1);
      if (sortBy === "enrollment") return (b.enrollment ?? 0) - (a.enrollment ?? 0);
      return a.school_name.localeCompare(b.school_name);
    });
  }, [initialSchools, query, stateFilter, dodeaOnly, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = query || stateFilter || dodeaOnly;

  function resetFilters() {
    setQuery("");
    setStateFilter("");
    setDodeaOnly(false);
    setPage(1);
  }

  function handleFilterChange(fn: () => void) {
    fn();
    setPage(1); // reset to page 1 on any filter change
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6 flex flex-col gap-4">
        <input
          type="text"
          placeholder="Search by school name, city, or state…"
          value={query}
          onChange={(e) => handleFilterChange(() => setQuery(e.target.value))}
          className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
        />

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={stateFilter}
            onChange={(e) => handleFilterChange(() => setStateFilter(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
          >
            <option value="">All States</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => handleFilterChange(() => setSortBy(e.target.value as "name" | "rating" | "enrollment"))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
          >
            <option value="name">Sort: A–Z</option>
            <option value="rating">Sort: Highest Rated</option>
            <option value="enrollment">Sort: Largest</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dodeaOnly}
              onChange={(e) => handleFilterChange(() => setDodeaOnly(e.target.checked))}
              className="w-4 h-4 rounded accent-[#E8A020]"
            />
            <span className="text-sm text-slate-700">DoDEA only</span>
          </label>

          {hasFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 hover:text-slate-600 underline ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500">
          Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} schools
        </p>
      </div>

      {/* School list */}
      {paginated.length === 0 ? (
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginated.map((school) => {
              const badge = ratingBadge(school.rating_overall);
              return (
                <Link
                  key={school.ncessch}
                  href={`/schools/${school.ncessch}`}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center justify-between gap-4 hover:border-[#E8A020] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1B2A4A] text-white flex items-center justify-center text-lg flex-shrink-0">
                      🏫
                    </div>
                    <div>
                      <div className="font-semibold text-[#1B2A4A] text-sm">{school.school_name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {school.city ? `${school.city}, ` : ""}{school.state_abbr}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {school.is_dodea && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            DoDEA
                          </span>
                        )}
                        {school.enrollment && school.enrollment > 0 && (
                          <span className="text-xs text-slate-400">
                            {school.enrollment.toLocaleString()} students
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {badge ? (
                      <div className={`w-10 h-10 rounded-full ring-2 ${badge.ring} ${badge.bg} flex items-center justify-center`}>
                        <span className={`text-sm font-black ${badge.text}`}>{badge.label}</span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full ring-2 ring-slate-200 bg-slate-100 flex items-center justify-center">
                        <span className="text-xs text-slate-400">—</span>
                      </div>
                    )}
                    <span className="text-xs text-slate-400 group-hover:text-[#E8A020] transition-colors">
                      View →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium disabled:opacity-40 hover:border-[#E8A020] transition-colors"
              >
                ← Prev
              </button>
              <span className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium disabled:opacity-40 hover:border-[#E8A020] transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}