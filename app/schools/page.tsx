import { createClient } from '@/lib/supabase/server'
import SchoolsListClient from './SchoolsListClient'
import AppNav from '@/components/AppNav'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

interface SearchParams {
  q?: string
  state?: string
  sort?: string
  dodea?: string
  purple_star?: string
  has_reviews?: string
  page?: string
}

export default async function SchoolsListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const q = sp.q?.trim() ?? ''
  const stateFilter = sp.state?.toUpperCase() ?? ''
  const sort = sp.sort ?? 'name'
  const dodeaOnly = sp.dodea === '1'
  const purpleStarOnly = sp.purple_star === '1'
  const hasReviewsOnly = sp.has_reviews === '1'
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))

  // Build query
  let query = supabase
    .from('schools')
    .select(
      'ncessch, school_name, city, state_abbr, rating_overall, rating_military_friendly, is_dodea, enrollment, review_count, purple_star_school',
      { count: 'exact' }
    )

  if (q) {
    query = query.or(
      `school_name.ilike.%${q}%,city.ilike.%${q}%,state_abbr.ilike.%${q}%`
    )
  }
  if (stateFilter) query = query.eq('state_abbr', stateFilter)
  if (dodeaOnly) query = query.eq('is_dodea', true)
  if (purpleStarOnly) query = query.eq('purple_star_school', true)
  if (hasReviewsOnly) query = query.gt('review_count', 0)

  // Sort
  switch (sort) {
    case 'rating':
      query = query.order('rating_overall', { ascending: false, nullsFirst: false })
      break
    case 'military':
      query = query.order('rating_military_friendly', { ascending: false, nullsFirst: false })
      break
    case 'reviews':
      query = query.order('review_count', { ascending: false, nullsFirst: false })
      break
    default:
      query = query.order('school_name', { ascending: true })
  }

  // Paginate
  const from = (page - 1) * PAGE_SIZE
  query = query.range(from, from + PAGE_SIZE - 1)

  const { data: schools, count, error } = await query
  if (error) console.error('Schools list error', error)

  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // Get distinct states for filter dropdown
  const { data: stateRows } = await supabase
    .from('schools')
    .select('state_abbr')
    .order('state_abbr')

  const states: string[] = Array.from(
    new Set((stateRows ?? []).map((r) => r.state_abbr).filter(Boolean))
  ).sort()

  return (
    <div className="bg-[#F8F7F4] min-h-screen">
      <AppNav />

      {/* Page header */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 flex flex-col gap-3">
          <h1 className="text-3xl md:text-4xl font-bold">
            Find schools near your next duty station
          </h1>
          <p className="text-blue-200 text-sm max-w-xl">
            Ratings calculated from federal NCES data. Reviews from military families who&apos;ve been there.
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
      <SchoolsListClient
        schools={schools ?? []}
        totalCount={totalCount}
        totalPages={totalPages}
        states={states}
        initialParams={{
          q,
          state: stateFilter,
          sort,
          dodea: dodeaOnly,
          purple_star: purpleStarOnly,
          has_reviews: hasReviewsOnly,
          page,
        }}
      />

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
  )
}
