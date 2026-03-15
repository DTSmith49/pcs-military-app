'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import Link from 'next/link'

interface School {
  ncessch: string
  school_name: string
  city: string | null
  state_abbr: string
  rating_overall: number | null
  rating_military_friendly: number | null
  is_dodea: boolean | null
  enrollment: number | null
  review_count: number | null
  purple_star_school: boolean | null
}

interface InitialParams {
  q: string
  state: string
  sort: string
  dodea: boolean
  purple_star: boolean
  has_reviews: boolean
  page: number
}

interface Props {
  schools: School[]
  totalCount: number
  totalPages: number
  states: string[]
  initialParams: InitialParams
}

function ratingBadge(score: number | null, size: 'sm' | 'md' = 'md') {
  if (score === null) return null
  const label = Math.round(score)
  const color =
    score >= 70
      ? { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200' }
      : score >= 55
      ? { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200' }
      : { bg: 'bg-red-100', text: 'text-red-600', ring: 'ring-red-200' }
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  return (
    <div
      className={`${dim} rounded-full ring-2 ${color.ring} ${color.bg} flex items-center justify-center flex-shrink-0`}
    >
      <span className={`font-black ${color.text}`}>{label}</span>
    </div>
  )
}

export default function SchoolsListClient({
  schools,
  totalCount,
  totalPages,
  states,
  initialParams,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateParam = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, val] of Object.entries(updates)) {
        if (val === null || val === '' || val === '0') {
          params.delete(key)
        } else {
          params.set(key, val)
        }
      }
      // Reset to page 1 when filters change (unless we're explicitly paginating)
      if (!('page' in updates)) params.delete('page')
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [searchParams, pathname, router]
  )

  const hasFilters =
    initialParams.q ||
    initialParams.state ||
    initialParams.dodea ||
    initialParams.purple_star ||
    initialParams.has_reviews

  const from = (initialParams.page - 1) * 20 + 1
  const to = Math.min(initialParams.page * 20, totalCount)

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      {/* Search + Filters */}
      <div
        className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6 flex flex-col gap-4 transition-opacity ${
          isPending ? 'opacity-60' : 'opacity-100'
        }`}
      >
        {/* Search input */}
        <input
          type="text"
          placeholder="Search by school name, city, or state…"
          defaultValue={initialParams.q}
          onChange={(e) => {
            const val = e.target.value
            if (val.length === 0 || val.length >= 2) {
              updateParam({ q: val || null })
            }
          }}
          className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
        />

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* State */}
          <select
            defaultValue={initialParams.state}
            onChange={(e) => updateParam({ state: e.target.value || null })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
          >
            <option value="">All States</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            defaultValue={initialParams.sort}
            onChange={(e) => updateParam({ sort: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
          >
            <option value="name">Sort: A–Z</option>
            <option value="rating">Sort: Composite Score ↓</option>
            <option value="military">Sort: Military Friendly ↓</option>
            <option value="reviews">Sort: Most Reviewed</option>
          </select>

          {/* Toggle badges */}
          <ToggleBadge
            active={initialParams.dodea}
            label="DoDEA"
            emoji="🎖️"
            onToggle={() => updateParam({ dodea: initialParams.dodea ? null : '1' })}
          />
          <ToggleBadge
            active={initialParams.purple_star}
            label="Purple Star"
            emoji="⭐"
            onToggle={() =>
              updateParam({ purple_star: initialParams.purple_star ? null : '1' })
            }
          />
          <ToggleBadge
            active={initialParams.has_reviews}
            label="Has Reviews"
            emoji="💬"
            onToggle={() =>
              updateParam({ has_reviews: initialParams.has_reviews ? null : '1' })
            }
          />

          {hasFilters && (
            <button
              onClick={() =>
                router.push(pathname)
              }
              className="text-xs text-slate-400 hover:text-slate-600 underline ml-auto"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Result count */}
        <p className="text-xs text-slate-500">
          {totalCount === 0
            ? 'No schools found'
            : `Showing ${from}–${to} of ${totalCount.toLocaleString()} schools`}
          {isPending && ' · Updating…'}
        </p>
      </div>

      {/* School list */}
      {schools.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center flex flex-col gap-4">
          <div className="text-5xl">🏫</div>
          <h2 className="text-xl font-bold text-[#1B2A4A]">No matching schools</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Try a different spelling or search by city or state. If your school truly isn&apos;t here
            yet, you can be the first to review it.
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
            {schools.map((school) => (
              <SchoolCard key={school.ncessch} school={school} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() =>
                  updateParam({ page: String(Math.max(1, initialParams.page - 1)) })
                }
                disabled={initialParams.page === 1 || isPending}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium disabled:opacity-40 hover:border-[#E8A020] transition-colors"
              >
                ← Prev
              </button>
              <span className="text-sm text-slate-500">
                Page {initialParams.page} of {totalPages}
              </span>
              <button
                onClick={() =>
                  updateParam({ page: String(Math.min(totalPages, initialParams.page + 1)) })
                }
                disabled={initialParams.page === totalPages || isPending}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium disabled:opacity-40 hover:border-[#E8A020] transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function ToggleBadge({
  active,
  label,
  emoji,
  onToggle,
}: {
  active: boolean
  label: string
  emoji: string
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
          : 'bg-white text-slate-600 border-slate-300 hover:border-[#1B2A4A]'
      }`}
    >
      <span>{emoji}</span>
      {label}
    </button>
  )
}

function SchoolCard({ school }: { school: School }) {
  return (
    <Link
      href={`/schools/${school.ncessch}`}
      className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-start justify-between gap-4 hover:border-[#E8A020] transition-colors group"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-[#1B2A4A]/10 text-[#1B2A4A] flex items-center justify-center text-base flex-shrink-0 mt-0.5">
          🏫
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[#1B2A4A] text-sm leading-snug truncate">
            {school.school_name}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {school.city ? `${school.city}, ` : ''}
            {school.state_abbr}
          </p>

          {/* Badges row */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {school.is_dodea && (
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                🎖️ DoDEA
              </span>
            )}
            {school.purple_star_school && (
              <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                ⭐ Purple Star
              </span>
            )}
            {school.enrollment && school.enrollment > 0 ? (
              <span className="text-xs text-slate-400">
                {school.enrollment.toLocaleString()} students
              </span>
            ) : null}
          </div>

          {/* Review count */}
          <div className="mt-1.5">
            {school.review_count && school.review_count > 0 ? (
              <span className="text-xs text-amber-600 font-medium">
                ★ {school.review_count}{' '}
                {school.review_count === 1 ? 'review' : 'reviews'}
              </span>
            ) : (
              <span className="text-xs text-slate-300">No reviews yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Score column */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        {ratingBadge(school.rating_overall, 'md')}
        {school.rating_military_friendly !== null && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">MF</span>
            {ratingBadge(school.rating_military_friendly, 'sm')}
          </div>
        )}
        <span className="text-xs text-slate-400 group-hover:text-[#E8A020] transition-colors mt-0.5">
          View →
        </span>
      </div>
    </Link>
  )
}
